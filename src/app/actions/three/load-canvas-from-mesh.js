import { copyCanvas } from "../canvas/copy-canvas";

export function loadCanvasFromMesh(mesh, texture, canvasRef, updateTexture) {
  //if (!mesh) return;
  if (mesh.userData && mesh.userData.canvas)
    copyCanvas(mesh.userData.canvas, canvasRef.current);
  updateTexture();
  mesh.material.map = texture;
}
