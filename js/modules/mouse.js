let isMouseProtectionEnabled = false;
let options = {
    noiseValue: 1,
    disallowed: []
};

// Create and style the tracker dot
let trackerDot = null;

function createTrackerDot() {
    if (trackerDot) return;
    
    trackerDot = document.createElement('div');
    trackerDot.style.cssText = `
        position: fixed;
        width: 8px;
        height: 8px;
        background-color: red;
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        opacity: 0.7;
        display: none;
    `;
    document.body.appendChild(trackerDot);
}

// Noise generator function
const noise = (() => {
    let useSpare = false;
    let spare;
    
    return (pos, sigma = options.noiseValue) => {
        if (useSpare) {
            useSpare = false;
            return Math.max(0, Math.floor(pos + spare * sigma));
        }
        const _2PI = Math.PI * 2;
        const u1 = Math.random();
        const u2 = Math.random();
        const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(_2PI * u2);
        spare = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(_2PI * u2);
        useSpare = true;
        return Math.max(0, Math.floor(pos + z0 * sigma));
    };
})();

// Mouse event handler
function handleMouseMove(e) {
    if (!e.isTrusted || !isMouseProtectionEnabled) return;

    const domain = window.location.hostname;
    if (options.disallowed.includes(domain)) return;

    // Calculate obfuscated coordinates
    const obfuscatedX = noise(e.clientX);
    const obfuscatedY = noise(e.clientY);

    //debug messages
    console.log("Original position:", e.clientX, e.clientY);
    console.log("Obfuscated position:", obfuscatedX, obfuscatedY);

    const props = {
        view: window,
        bubbles: true,
        cancelable: true,
        clientX: obfuscatedX,
        clientY: obfuscatedY,
        screenX: noise(e.screenX),
        screenY: noise(e.screenY),
    };

    // Update tracker dot position
    if (trackerDot) {
        trackerDot.style.display = 'block';
        trackerDot.style.left = `${obfuscatedX}px`;
        trackerDot.style.top = `${obfuscatedY}px`;
    }
    
    const event = new MouseEvent('mousemove', props);
    document.dispatchEvent(event);
    e.stopImmediatePropagation();
}

function initializeMouseProtection() {
    if (isMouseProtectionEnabled) return;
    
    createTrackerDot();
    document.addEventListener('mousemove', handleMouseMove, true);
    isMouseProtectionEnabled = true;
    // console.log('Mouse movement protection initialized');
}

function removeMouseProtection() {
    if (!isMouseProtectionEnabled) return;

    // Hide and clean up tracker dot
    if (trackerDot) {
        trackerDot.style.display = 'none';
    }
    
    document.removeEventListener('mousemove', handleMouseMove, true);
    isMouseProtectionEnabled = false;
    // console.log('Mouse movement protection removed');
}

// Clean up function for page unload
function cleanup() {
    if (trackerDot) {
        trackerDot.remove();
        trackerDot = null;
    }
}

// Load settings from storage
async function loadSettings() {
    try {
        const prefs = await browser.storage.sync.get({
            noiseValue: 1,
            disallowed: [],
        });
        options.noiseValue = prefs.noiseValue;
        options.disallowed = prefs.disallowed || [];
    } catch (error) {
        console.error("Error loading mouse settings:", error);
    }
}

// Listen for settings changes
browser.storage.onChanged.addListener((changes) => {
    if (changes.noiseValue) {
        options.noiseValue = changes.noiseValue.newValue;
    }
    if (changes.disallowed) {
        options.disallowed = changes.disallowed.newValue;
    }
});

// Listen for messages from background script
browser.runtime.onMessage.addListener((message) => {
    if (message.action === 'toggleMouse') {
        if (message.enabled && !isMouseProtectionEnabled) {
            loadSettings().then(() => {
                initializeMouseProtection();
            });
        } else if (!message.enabled && isMouseProtectionEnabled) {
            removeMouseProtection();
        }
    }
});

// Clean up on page unload
window.addEventListener('unload', cleanup);