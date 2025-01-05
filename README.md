<h1 align="center">AntiTracker</h1>
<div align="center">
  <img width="300" src="https://github.com/user-attachments/assets/476519c3-32de-4416-8b30-81667294f4d6">
  <p align="center"><i>Open-source privacy: Obfuscate, simulate, and take control of your web tracking.</i></p>
</div>

---

# Implement your own AntiTracker plugin
1. Add a new switch to the `popup.html` file:
![image](https://github.com/user-attachments/assets/77a61290-5e13-40d2-8af0-a2cc1eb0ea5f)

2. Edit `js/main.js` file:
  - Add the new html element to the `featureSwitches` array:
  
    ![image](https://github.com/user-attachments/assets/57f41fdd-0861-4cb7-a466-8aa0ef7c6646)
  - Create the event listener function for the new switch:

    ![image](https://github.com/user-attachments/assets/1065e9f2-f152-4259-80b0-d07d9fe19612)
  - Implement your functions in the under `/js/actions/<your-actions>.js` (in this case `/js/actions/mouse.js`)
  
    ![image](https://github.com/user-attachments/assets/de8836b0-e718-45e4-a09f-cbfe3e35aefe)

---

# Run the extension
1. Download the repository.
2. Open Firefox and navigate to about:debugging#/runtime/this-firefox.
3. Click on "Load Temporary Add-on" and select any of the files of the extension directory.

# Debugging
In order spawn the devtools terminal for the extension, about:debugging#/runtime/this-firefox, and click the button "Inspect".
The data of the extension popup (console log, HTML elements...) will clear from the devtools every time the popup of the extension is closed. In order to prevent automatic closing, click on the three dots on the top-right corner, and then "Disable Popup Auto-Hide"
![image](https://github.com/user-attachments/assets/c4c60689-d6c1-4fb6-9a54-419cb33fbe53)
