export const canvas = () => {
  console.log("Canvas main function called!"); // Export function
};

// (function () {
//   // Backup dei metodi originali
//   const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
//   const originalGetImageData = CanvasRenderingContext2D.prototype.getImageData;
//   const originalToBlob = HTMLCanvasElement.prototype.toBlob;
//   const originalFillText = CanvasRenderingContext2D.prototype.fillText;
//   const originalMeasureText = CanvasRenderingContext2D.prototype.measureText;
//   const originalGetContext = HTMLCanvasElement.prototype.getContext;

//   // Funzione per aggiungere rumore ai dati del canvas
//   function addNoise(imageData) {
//     const noiseLevel = 20; // Livello di rumore
//     for (let i = 0; i < imageData.data.length; i += 4) {
//       imageData.data[i] += Math.floor(Math.random() * noiseLevel) - noiseLevel / 2; // Rosso
//       imageData.data[i + 1] += Math.floor(Math.random() * noiseLevel) - noiseLevel / 2; // Verde
//       imageData.data[i + 2] += Math.floor(Math.random() * noiseLevel) - noiseLevel / 2; // Blu
//     }
//     return imageData;
//   }

//   // Override di toDataURL
//   HTMLCanvasElement.prototype.toDataURL = function (...args) {
//     const context = this.getContext("2d");
//     if (context) {
//       const imageData = context.getImageData(0, 0, this.width, this.height);
//       context.putImageData(addNoise(imageData), 0, 0);
//     }
//     return originalToDataURL.apply(this, args);
//   };

//   // Override di getImageData
//   CanvasRenderingContext2D.prototype.getImageData = function (x, y, width, height) {
//     const imageData = originalGetImageData.call(this, x, y, width, height);
//     return addNoise(imageData);
//   };

//   // Override di toBlob
//   HTMLCanvasElement.prototype.toBlob = function (callback, ...args) {
//     const context = this.getContext("2d");
//     if (context) {
//       const imageData = context.getImageData(0, 0, this.width, this.height);
//       context.putImageData(addNoise(imageData), 0, 0);
//     }
//     return originalToBlob.apply(this, [callback, ...args]);
//   };

//   // Override di fillText per mascherare il testo
//   CanvasRenderingContext2D.prototype.fillText = function (...args) {
//     console.log(`fillText chiamato con args: ${args}`);
//     args[0] = args[0].replace(/./g, '*'); // Sostituisce il testo con '*'
//     return originalFillText.apply(this, args);
//   };

//   // Override di measureText per restituire larghezze casuali
//   CanvasRenderingContext2D.prototype.measureText = function (text) {
//     console.log(`measureText chiamato con testo: ${text}`);
//     return { width: Math.random() * 100 }; // Larghezza casuale
//   };

//   // Blocca l'accesso al canvas se di dimensioni ridotte
//   HTMLCanvasElement.prototype.getContext = function (...args) {
//     if (this.width < 16 || this.height < 16) {
//       console.warn("Accesso al canvas bloccato per dimensioni ridotte");
//       return null;
//     }
//     return originalGetContext.apply(this, args);
//   };

//   // Modifica delle API JavaScript comuni
//   Object.defineProperty(navigator, 'platform', {
//     get: () => 'Win32', // Sempre restituisce "Win32"
//   });

//   Object.defineProperty(screen, 'width', {
//     get: () => 1920 + Math.floor(Math.random() * 10), // Aggiunge rumore casuale
//   });

//   Object.defineProperty(window, 'devicePixelRatio', {
//     get: () => Math.random() + 1, // Valore variabile
//   });

//   // Rilevamento di strumenti automatizzati
//   function detectAutomation() {
//     if (navigator.webdriver || /HeadlessChrome/.test(navigator.userAgent)) {
//       document.body.innerHTML = '<h1>Accesso non consentito</h1>';
//     }
//   }
//   detectAutomation();

//   // Anti-debugging
//   if (typeof window.console !== "undefined") {
//     console.log = () => {};
//     console.warn = () => {};
//     console.error = () => {};
//   }

//   // Anti-debugging
// function antiDebug() {
//   let start = Date.now();
//   debugger; // Inserisce un punto di interruzione
//   if (Date.now() - start > 100) { // Verifica il ritardo dovuto al debugger
//       console.warn("Debugger rilevato!");
//       while (true) {} // Blocca l'esecuzione in caso di debugger attivo
//   }
// }
// antiDebug();

//   console.log("Protezione contro il canvas fingerprinting e tecniche anti-tracciamento attiva.");
// })();
