import { fabric } from "fabric";

// Function to check color at specific coordinates (x, y)
export const checkColorAtCoordinates = (canvas, x, y, path) => {
  const ctx = canvas.current.getContext("2d");
  const targetColor = hexToRGBA(path.stroke);
  // Create a temporary canvas to work with
  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");

  // Set temporary canvas dimensions
  tempCanvas.width = canvas.current.width;
  tempCanvas.height = canvas.current.height;

  // Copy the canvas content to the temporary canvas
  const objects = canvas.current.getObjects();
  objects.forEach((obj) => {
    obj.render(tempCtx);
  });

  // Get the pixel data from the temporary canvas
  const pixelData = tempCtx.getImageData(x, y, 1, 1).data;

  // Check if the pixel matches the target color
  const [r, g, b, a] = pixelData;
  const actualColor = `rgba(${r},${g},${b},${a})`;

  return actualColor == targetColor;
};

const hexToRGBA = (hex) => {
  // Remove '#' if it exists
  hex = hex.replace("#", "");

  // Parse hex to RGB
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return `rgba(${r},${g},${b},255)`;
};
