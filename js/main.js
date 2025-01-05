import { canvas } from './actions/canvas.js';
import { headers } from './actions/headers.js';
import { keystrokes } from './actions/keystrokes.js';
import { mouse } from './actions/mouse.js';

// Settings button click handler
document.getElementById('btn-settings').addEventListener('click', () => {
    console.log("No settings implemented yet.");
});

// Get all switches
const selectAllSwitch = document.getElementById('selectAll');
const canvasSwitch = document.getElementById('obfuscateCanvas');
const headersSwitch = document.getElementById('obfuscateHeaders');
const keystrokesSwitch = document.getElementById('obfuscateKeystrokes');
const mouseSwitch = document.getElementById('obfuscateMouse');

// Array of all feature switches (excluding selectAll)
const featureSwitches = [mouseSwitch, keystrokesSwitch, headersSwitch, canvasSwitch];

// Function to check if all switches are active
const areAllSwitchesActive = () => {
    return featureSwitches.every(switch_ => switch_.checked);
};

// Function to update selectAll state
const updateSelectAllState = () => {
    selectAllSwitch.checked = areAllSwitchesActive();
};

const toggleSwitch = (switchElement, isEnabled) => {
    switchElement.checked = isEnabled;
    console.log(`${switchElement.id}:`, isEnabled ? 'enabled' : 'disabled');
};

// Select All switch handler
selectAllSwitch.addEventListener('click', (e) => {
    const isEnabled = e.target.checked;
    featureSwitches.forEach(switch_ => {
        toggleSwitch(switch_, isEnabled);
    });
});

canvasSwitch.addEventListener('change', (e) => {
    canvas();
    updateSelectAllState();
});

headersSwitch.addEventListener('change', (e) => {
    headers();
    updateSelectAllState();
});

keystrokesSwitch.addEventListener('change', (e) => {
    keystrokes();
    updateSelectAllState();
});

mouseSwitch.addEventListener('change', (e) => {
    mouse();
    updateSelectAllState();
});