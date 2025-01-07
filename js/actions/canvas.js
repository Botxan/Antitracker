(function () {
  // Backup of original methods
  const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
  const originalGetImageData = CanvasRenderingContext2D.prototype.getImageData;
  const originalToBlob = HTMLCanvasElement.prototype.toBlob;

  // Function to add noise to image data
  function addNoise(imageData) {
    const noiseLevel = 10; 
    console.log("Adding noise to image data...");

    for (let i = 0; i < imageData.data.length; i += 4) {
      const noise = () => {
  const array = new Uint8Array(1); 
  crypto.getRandomValues(array); 
  return Math.floor((array[0] / 255) * noiseLevel) - noiseLevel / 2;
};

      // Clamp function to ensure the valid range [0, 255]
      const clamp = (value) => Math.min(255, Math.max(0, value));

      // Add noise and clamp each color channel
      imageData.data[i] = clamp(imageData.data[i] + noise()); 
      imageData.data[i + 1] = clamp(imageData.data[i + 1] + noise()); 
      imageData.data[i + 2] = clamp(imageData.data[i + 2] + noise()); 
    }

    console.log("Noise added successfully.");
    return imageData;
  }

  // Override toDataURL to apply noise before encoding
  HTMLCanvasElement.prototype.toDataURL = function (...args) {
    const context = this.getContext("2d");
    if (context) {
      console.log("toDataURL called - Canvas context retrieved.");
      const imageData = context.getImageData(0, 0, this.width, this.height);
      console.log("Original image data retrieved for toDataURL.");
      context.putImageData(addNoise(imageData), 0, 0); 
      console.log("Modified image data applied to canvas for toDataURL.");
    } else {
      console.warn("toDataURL called, but no 2D context available.");
    }
    return originalToDataURL.apply(this, args);
  };

  // Override getImageData to return noisy image data
  CanvasRenderingContext2D.prototype.getImageData = function (x, y, width, height) {
    console.log(`getImageData called with parameters: x = ${x}, y = ${y}, width = ${width}, height = ${height}`);
    const imageData = originalGetImageData.call(this, x, y, width, height);
    console.log("Original image data retrieved for getImageData.");
    const modifiedImageData = addNoise(imageData);
    console.log("Modified image data returned for getImageData.");
    return modifiedImageData;
  };

  // Override toBlob to apply noise before creating a blob
  HTMLCanvasElement.prototype.toBlob = function (callback, ...args) {
    const context = this.getContext("2d");
    if (context) {
      console.log("toBlob called - Canvas context retrieved.");
      const imageData = context.getImageData(0, 0, this.width, this.height);
      console.log("Original image data retrieved for toBlob.");
      context.putImageData(addNoise(imageData), 0, 0); 
      console.log("Modified image data applied to canvas for toBlob.");
    } else {
      console.warn("toBlob called, but no 2D context available.");
    }
    return originalToBlob.apply(this, [callback, ...args]);
  };

  console.log("Canvas fingerprinting protection active with dynamic noise addition.");
})();

// Export function
export const canvas = () => {
  console.log("Canvas main function called!");
};
