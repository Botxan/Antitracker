const FEATURES = {
    canvas: {
        id: 'obfuscateCanvas',
        label: 'Obfuscate Canvas Fingerprint'
    },
    headers: {
        id: 'obfuscateHeaders',
        label: 'Obfuscate Headers'
    },
    keystrokes: {
        id: 'obfuscateKeystrokes',
        label: 'Obfuscate Keystrokes'
    },
    mouse: {
        id: 'obfuscateMouse',
        label: 'Obfuscate Mouse Movements'
    }
};

// Setup switch listeners and load saved states
async function initializePopup() {
    const selectAll = document.getElementById('selectAll');
    const switches = {};
    let isInitializing = true;

    // Create switches and handlers for each feature
    for (const [feature, config] of Object.entries(FEATURES)) {
        // Get switch element
        switches[feature] = document.getElementById(config.id);
        
        // Add change listener
        switches[feature].addEventListener('change', async (e) => {
            if (!isInitializing) {
                try {
                    const enabled = e.target.checked;
                    // Send message to background script
                    const response = await browser.runtime.sendMessage({ 
                        module: feature, 
                        enabled 
                    });
                    
                    if (response.success) {
                        // Update storage only if background action was successful
                        await browser.storage.local.set({ [feature]: enabled });
                        // Update select all state
                        selectAll.checked = Object.values(switches).every(s => s.checked);
                    } else {
                        // Revert switch if there was an error
                        console.error(`Error toggling ${feature}:`, response.error);
                        e.target.checked = !enabled;
                    }
                } catch (error) {
                    console.error(`Failed to toggle ${feature}:`, error);
                    e.target.checked = !e.target.checked;
                }
            }
        });
    }

    // Handle "Select All" switch
    selectAll.addEventListener('change', async (e) => {
        const enabled = e.target.checked;
        
        for (const [feature, config] of Object.entries(FEATURES)) {
            try {
                // Send message to background script
                const response = await browser.runtime.sendMessage({ 
                    module: feature, 
                    enabled 
                });
                
                if (response.success) {
                    switches[feature].checked = enabled;
                    await browser.storage.local.set({ [feature]: enabled });
                } else {
                    console.error(`Error in select all for ${feature}:`, response.error);
                }
            } catch (error) {
                console.error(`Failed to toggle ${feature} in select all:`, error);
            }
        }
        
        // If any feature failed to toggle, update select all state
        selectAll.checked = Object.values(switches).every(s => s.checked);
    });

    try {
        // Load saved states
        const savedState = await browser.storage.local.get(Object.keys(FEATURES));
        
        // Apply saved states to switches
        for (const [feature, enabled] of Object.entries(savedState)) {
            if (switches[feature]) {
                switches[feature].checked = enabled;
            }
        }
        
        // Update select all state
        selectAll.checked = Object.values(switches).every(s => s.checked);
    } catch (error) {
        console.error('Error loading saved states:', error);
    }
    
    isInitializing = false;
}

// Initialize when popup opens
document.addEventListener('DOMContentLoaded', initializePopup);

document.getElementById("btn-settings")?.addEventListener("click", () => {
    console.log("Settings button clicked");
});