const listeners = {
    globaKeydown: null,
    inputKeydown: null,
    focusin: null,
    mousedown: null,
    resize: null,
    scroll: null
};

let isEnabled = false;
let overlay = null;
let input = null;

let activeElement = null;
let isOverlayActive = false;
let preventFocusIn = false;

function createOverlay() {
    if (overlay) return;

    overlay = document.createElement("div");
    overlay.className = "private-input-overlay";
    input = document.createElement("input");
    input.type = "text";
    input.className = "private-input-box";
    overlay.appendChild(input);
    document.body.appendChild(overlay);
}

// Function to position overlay over input
function positionOverlay(element) {
    if (!overlay) createOverlay();

    const rect = element.getBoundingClientRect();
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    overlay.style.position = "absolute";
    overlay.style.top = `${rect.top + scrollY}px`;
    overlay.style.left = `${rect.left + scrollX}px`;

    overlay.style.width = `${rect.width}px`;
    input.style.width = "100%";
    input.style.height = `${rect.height}px`;

    const styles = window.getComputedStyle(element);
    input.style.fontSize = styles.fontSize;
    input.style.padding = styles.padding;
    input.style.fontFamily = styles.fontFamily;
    input.style.borderRadius = styles.borderRadius;
}

function showOverlay(element) {
    if (!overlay) createOverlay();

    activeElement = element;
    isOverlayActive = true;
    overlay.style.display = "block";
    input.value = element.value || "";

    positionOverlay(element);

    setTimeout(() => {
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
    }, 0);
}

function submitAndClose() {
    if (activeElement) {
        activeElement.value = input.value;
        const event = new Event("input", { bubbles: true });
        activeElement.dispatchEvent(event);
    }

    overlay.style.display = "none";
    input.value = "";
    isOverlayActive = false;
}

function initializeKeystrokeProtection() {
    if (isEnabled) return;
    isEnabled = true;

    // Global keystroke protection
    listeners.globalKeydown = function (e) {
        const target = e.target;

        // Allow keystrokes if:
        if (
            overlay.contains(target) ||
            e.ctrlKey ||
            e.metaKey ||
            e.altKey ||
            target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.isContentEditable
        ) {
            return;
        }

        e.stopImmediatePropagation();
        e.preventDefault();
    };
    document.addEventListener("keydown", listeners.globaKeydown, true);

    // Handle focus on any input element
    listeners.focusin = (e) => {
        if (preventFocusIn) {
            preventFocusIn = false;
            return;
        }

        if (
            !isOverlayActive &&
            (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.isContentEditable)
        ) {
            showOverlay(e.target);
        }
    };
    document.addEventListener("focusin", listeners.focusin);

    // Handle input keydown events
    listeners.inputKeydown = (e) => {
        if (e.key === "Enter" && activeElement) {
            e.preventDefault();
            submitAndClose();
            preventFocusIn = true;
            activeElement.focus();
        } else if (e.key === "Escape") {
            overlay.style.display = "none";
            input.value = "";
            isOverlayActive = false;
            preventFocusIn = true;
            if (activeElement) activeElement.focus();
        } else if (e.key === "Tab") {
            e.preventDefault();
            submitAndClose();

            // Find the next focusable element
            const focusable = Array.from(document.querySelectorAll('input, textarea, [contenteditable="true"]'));
            const currentIndex = focusable.indexOf(activeElement);
            const nextElement = e.shiftKey
                ? focusable[currentIndex - 1] || focusable[focusable.length - 1]
                : focusable[currentIndex + 1] || focusable[0];

            // Focus the next element and show overlay
            if (nextElement) {
                nextElement.focus();
                showOverlay(nextElement);
            }
        }
    };
    document.addEventListener("keydown", listeners.inputKeydown);

    // Modified click handler to handle reopening
    listeners.mousedown = (e) => {
        if (!overlay.contains(e.target)) {
            if (e.target === activeElement && !isOverlayActive) {
                e.preventDefault();
                showOverlay(e.target);
            } else if (e.target !== activeElement) {
                overlay.style.display = "none";
                input.value = "";
                isOverlayActive = false;
            }
        }
    };
    document.addEventListener("mousedown", listeners.mousedown);

    // Handle window resize
    listeners.resize = () => {
        if (isOverlayActive && activeElement) {
            positionOverlay(activeElement);
        }
    };
    document.addEventListener("resize", listeners.resize);

    // Handle scroll events
    listeners.scroll = (e) => {
        if (isOverlayActive && activeElement) {
            positionOverlay(activeElement);
        }
    };
    document.addEventListener("scroll", listeners.scroll, true);
}

function removeKeystrokeProtection() {
    if (!isEnabled) return;
    isEnabled = false;
    
    if (listeners.globaKeydown) {
        document.removeEventListener("keydown", listeners.globaKeydown, true);
    }
    if (listeners.inputKeydown) {
        document.removeEventListener("keydown", listeners.inputKeydown, true);
    }
    if (listeners.focusin) {
        document.removeEventListener("focusin", listeners.focusin);
    }
    if (listeners.mousedown) {
        document.removeEventListener("mousedown", listeners.mousedown);
    }
    if (listeners.resize) {
        window.removeEventListener("resize", listeners.resize);
    }
    if (listeners.scroll) {
        document.removeEventListener("scroll", listeners.scroll, true);
    }

    // Reset all listeners
    Object.keys(listeners).forEach(key => {
        listeners[key] = null;
    });

    // Clean up overlay
    if (overlay) {
        overlay.remove();
        overlay = null;
        input = null;
    }

    isOverlayActive = false;
    isEnabled = false;
}

// Listen for messages from background script
browser.runtime.onMessage.addListener((message) => {
    console.log("Received message:", message);
    if (message.action === 'toggleKeystrokes') {
        if (message.enabled) {
            initializeKeystrokeProtection();
            isEnabled = true;
        } else if (!message.enabled && isEnabled) {
            removeKeystrokeProtection();
        }
    }
});