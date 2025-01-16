// Generate a deterministic canvas pattern including the string "Antitracker"
function drawDeterministicPattern(canvas, seed, text) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
  
    // Background pattern
    function seededRandom(seed) {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    }
  
    for (let x = 0; x < width; x += 20) {
      for (let y = 0; y < height; y += 20) {
        const randomValue = seededRandom(seed + x * y);
        const color = `rgb(${Math.floor(randomValue * 255)}, ${Math.floor(
          randomValue * 255
        )}, ${Math.floor(randomValue * 255)})`;
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 20, 20);
      }
    }
  
    // Draw the "Antitracker" text
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText(text, 10, height / 2);
  }
  
  // Calculate a simple hash from the canvas content
  function getCanvasFingerprint(canvas) {
    return hashString(canvas.toDataURL());
  }
  
  // Improved hash function (returns a fixed-length hexadecimal string)
  function hashString(str) {
    const crypto = new TextEncoder().encode(str);
    return crypto.subarray(0, 16).reduce((hash, byte) => {
      return hash + byte.toString(16).padStart(2, '0'); // Convert to hex
    }, '');
  }
  
  // Add noise to the canvas data
  function addNoise(data) {
    const rgba = new Uint8ClampedArray(data.length);
    for (let i = 0; i < data.length; i += 4) {
      rgba[i] = data[i] + (Math.random() * 2 - 1);
      rgba[i + 1] = data[i + 1] + (Math.random() * 2 - 1);
      rgba[i + 2] = data[i + 2] + (Math.random() * 2 - 1);
      rgba[i + 3] = data[i + 3]; // Preserve alpha channel
    }
    return rgba;
  }
  
  // Draw the canvas without protection
  function drawOriginalCanvas() {
    const canvas = document.getElementById('originalCanvas');
    drawDeterministicPattern(canvas, 42, "Antitracker");
    const hash = getCanvasFingerprint(canvas);
    document.getElementById('originalHash').textContent = hash;
  }
  
  // Draw the canvas with protection
  function drawProtectedCanvas() {
    const canvas = document.getElementById('protectedCanvas');
    drawDeterministicPattern(canvas, 42, "Antitracker");
    const hash1 = getCanvasFingerprint(canvas);
    console.log(hash1);
  
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const noisyData = addNoise(imageData.data);
  
    ctx.putImageData(new ImageData(noisyData, canvas.width, canvas.height), 0, 0);
  
    // Recalculate hash AFTER applying noise
    const hash = getCanvasFingerprint(canvas);
    document.getElementById('protectedHash').textContent = hash;
  }
  
  // Initial rendering
  drawOriginalCanvas();
  drawProtectedCanvas();
  