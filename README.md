<h1 align="center">AntiTracker</h1>
<div align="center">
  <img width="300" src="https://github.com/user-attachments/assets/476519c3-32de-4416-8b30-81667294f4d6">
  <p align="center"><i>Open-source privacy: Obfuscate, and take control of your web tracking.</i></p>
</div>

---
# Table of Contents  
- [Project Overview](#project-overview)  
- [Project Structure](#project-structure)  
- [Run the Extension](#run-the-extension)  
- [Run the Canvas Fingerprint Testing App](#run-the-canvas-fingerprint-testing-app)  
- [Debugging](#debugging)  

# Project Overview
Antitracker is a Firefox extension designed to protect your privacy online. It features functionalities such as canvas fingerprinting obfuscation, mouse movement obfuscation, header manipulation, and local buffers/overlays to prevent typing tracking. This repository contains the source code, resources, and some of the testing tools for the extension.

# Project Structure
- The metadata of the application is provided in the [manifest.json](https://github.com/Botxan/Antitracker/blob/main/manifest.json) file.
- The UI of the extension consists of:
  -   The [HTML structure](https://github.com/Botxan/Antitracker/blob/main/popup.html)
  -   The [styles and colors](https://github.com/Botxan/Antitracker/tree/main/css)
  -   The [popup.js script](https://github.com/Botxan/Antitracker/blob/main/js/popup.js)

This last script will send messages to the [background](https://github.com/Botxan/Antitracker/blob/main/js/background.js) script in the case any of the switches is toggled. The background script is in charge of sending the messages to the different modules in order to enable/disable their functionalities. Scripts for each of the modules are stored under [/js/modules](https://github.com/Botxan/Antitracker/tree/main/js/modules) folder.

Apart from the main scripts, there are other resources available:
- A [Canvas Fingerprintg Obfuscation Test App](https://github.com/Botxan/Antitracker/tree/main/canvas-fingerprint-test) to visualize and test how the extension obfuscates canvas fingerprints.
- A [Mouse Movement Obfuscation Script](https://github.com/Botxan/Antitracker/tree/main/MouseTesting) written in Python to evaluate mouse tracking interference..
- Logo assets ([images](https://github.com/Botxan/Antitracker/tree/main/images) and [icons](https://github.com/Botxan/Antitracker/tree/main/icons)).

# Run the Extension
1. Download the repository.
2. Open Firefox and navigate to about:debugging#/runtime/this-firefox.
3. Click on "Load Temporary Add-on" and select any of the files of the extension directory.

# Run the Canvas Fingerprint Testing App
Simply open this [index.html](https://github.com/Botxan/Antitracker/blob/main/canvas-fingerprint-test/index.html) in the browser.

# Debugging
In order spawn the devtools terminal for the extension, navigate to about:debugging#/runtime/this-firefox, and click the button "Inspect".

The data of the extension popup (console log, HTML elements...) will clear from the devtools every time the popup of the extension is closed. In order to prevent automatic closing, click on the three dots on the top-right corner, and then "Disable Popup Auto-Hide"

![image](https://github.com/user-attachments/assets/c4c60689-d6c1-4fb6-9a54-419cb33fbe53)
