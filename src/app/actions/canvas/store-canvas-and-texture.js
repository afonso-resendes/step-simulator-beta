import * as THREE from "three";
import { copyCanvas } from "./copy-canvas";

export function storeCanvasAndTexture(mesh, canvas, canvasSize) {
  if (
    (canvas.backgroundColor == "#ffffff" || canvas.backgroundColor == "#fff") &&
    canvas._objects == []
  ) {
    mesh.current.material.map = null;
    return;
  }
  const staticCanvas = new fabric.Canvas("staticCanvas", {
    width: canvasSize,
    height: canvasSize,
  });
  copyCanvas(canvas, staticCanvas);
  const texture = new THREE.CanvasTexture(staticCanvas.getElement());
  texture.flipY = false;
  texture.colorSpace = THREE.SRGBColorSpace;

  mesh.current.userData.canvas = staticCanvas;
  mesh.current.material.map = texture;
}
