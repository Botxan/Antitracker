// Store original methods
const originalMethods = {
  toDataURL: HTMLCanvasElement.prototype.toDataURL,
  getContext: HTMLCanvasElement.prototype.getContext,
  getImageData: CanvasRenderingContext2D.prototype.getImageData
};

let isProtectionEnabled = false;

function addNoise(data) {
  if (!isProtectionEnabled) {
      return data;
  }
  const rgba = new Uint8ClampedArray(data.length);
  for (let i = 0; i < data.length; i += 4) {
      rgba[i] = data[i] + (Math.random() * 2 - 1);
      rgba[i + 1] = data[i + 1] + (Math.random() * 2 - 1);
      rgba[i + 2] = data[i + 2] + (Math.random() * 2 - 1);
      rgba[i + 3] = data[i + 3];
  }
  console.log('Canvas fingerprinting attempt blocked');
  return rgba;
}

function enableProtection() {
  HTMLCanvasElement.prototype.getContext = function(type, ...args) {
    console.log("modified getContext called...");
      const context = originalMethods.getContext.call(this, type, ...args);
      if (type === '2d') {
          context.getImageData = function(x, y, width, height) {
              const imageData = originalMethods.getImageData.call(this, x, y, width, height);
              imageData.data.set(addNoise(imageData.data));
              return imageData;
          };
      }
      return context;
  };

  HTMLCanvasElement.prototype.toDataURL = function(...args) {
    console.log("modified toDataURL called...");
      const originalDataUrl = originalMethods.toDataURL.apply(this, args);
      
      if (!isProtectionEnabled || this.width <= 16 || this.height <= 16) {
          return originalDataUrl;
      }

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = this.width;
      tempCanvas.height = this.height;
      
      const ctx = tempCanvas.getContext('2d');
      const img = new Image();
      img.src = originalDataUrl;
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
      const noisyData = addNoise(imageData.data);
      
      ctx.putImageData(new ImageData(noisyData, tempCanvas.width, tempCanvas.height), 0, 0);
      return tempCanvas.toDataURL(...args);
  };
}

function disableProtection() {
  // Restore original methods
  HTMLCanvasElement.prototype.toDataURL = originalMethods.toDataURL;
  HTMLCanvasElement.prototype.getContext = originalMethods.getContext;
  CanvasRenderingContext2D.prototype.getImageData = originalMethods.getImageData;
}

function toggleProtection(enabled) {
  isProtectionEnabled = enabled;
  if (enabled) {
      enableProtection();
  } else {
      disableProtection();
  }
  console.log('Canvas protection ' + (enabled ? 'enabled' : 'disabled'));
}

// Listen for messages from background script
browser.runtime.onMessage.addListener((message) => {
  if (message.action === 'toggleCanvas') {
      toggleProtection(message.enabled);
  }
});

// Check initial state from storage
browser.storage.local.get('canvas').then(result => {
  if (result.canvas) {
      toggleProtection(true);
  }
});