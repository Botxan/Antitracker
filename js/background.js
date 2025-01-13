// background.js
import HeaderObfuscator from "./actions/headers/HeaderObfuscator.js";
import { canvas } from "./actions/canvas.js";

// Single instance of header obfuscator
const headerObfuscator = new HeaderObfuscator();

// Handle module state
const moduleHandlers = {
    headers: (enabled) => {
        if (enabled && !headerObfuscator.listener) {
            headerObfuscator.setupHeaderListener();
        }
        headerObfuscator.toggle(enabled);
    },

    mouse: (enabled) => {
        // Send message to toggle mouse protection to all tabs
        browser.tabs.query({}).then(tabs => {
            for (const tab of tabs) {
                console.log("Sending to tab ", tab);
                if (tab.url.startsWith('http')) {
                    browser.tabs.sendMessage(tab.id, {
                        action: 'toggleMouse',
                        enabled: enabled
                    })
                    .catch(err => console.error('Failed to toggle mouse protection', tab.id, err));
                }
            }
        });
    },

    keystrokes: (enabled) => {
        // Send message to toggle keystroke protection to all tabs
        browser.tabs.query({}).then(tabs => {
            for (const tab of tabs) {
                if (tab.url.startsWith('http')) {
                    browser.tabs.sendMessage(tab.id, {
                        action: 'toggleKeystrokes',
                        enabled: enabled
                    })
                    .catch(err => console.error('Failed to disable keystroke protection', tab.id, err));
                }
            }
        });
    },

    canvas: (enabled) => {
        if (enabled) canvas();
    }
};

// List of all available modules
const MODULES = Object.keys(moduleHandlers);

// Initialize state from storage and setup listeners
async function initializeModules() {
    try {
        // Get states for all modules at once
        const savedStates = await browser.storage.local.get(MODULES);
        
        // Initialize each enabled module
        MODULES.forEach(moduleName => {
            if (savedStates[moduleName]) {
                moduleHandlers[moduleName](true);
                console.log(`Initialized ${moduleName} module`);
            }
        });
    } catch (error) {
        console.error('Error initializing modules:', error);
    }
}

// Listen for messages from popup
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    try {
        const handler = moduleHandlers[message.module];
        if (handler) {
            handler(message.enabled);
            console.log(`${message.module} module ${message.enabled ? 'enabled' : 'disabled'}`);
            sendResponse({ success: true });
        } else {
            console.warn(`Unknown module: ${message.module}`);
            sendResponse({ success: false, error: 'Unknown module' });
        }
    } catch (error) {
        console.error(`Error handling ${message.module} module:`, error);
        sendResponse({ success: false, error: error.message });
    }
    
    // Required for async response
    return true;
});

// Initialize all modules on startup
initializeModules();