import { animateEmissiveColor } from "../animations/animmate-emissive-color";
import { assignCanvasToMesh } from "./assign-canvas-to-mesh";
import { loadCanvasFromMesh } from "./load-canvas-from-mesh";
import * as THREE from "three";

export function setEditingComponent(
  clickedMesh,
  fabricTexture,
  fabricCanvas,
  updateTexture,
  setEditingComponentName,
  animate,
  canvasSize
) {
  //if (!editingComponent.current) return;
  if (animate) animateEmissiveColor(clickedMesh, 400);
  if (!clickedMesh.userData.canvas) assignCanvasToMesh(clickedMesh, canvasSize);
  loadCanvasFromMesh(clickedMesh, fabricTexture, fabricCanvas, updateTexture);
  //if (editingComponent.current.material)
  clickedMesh.material.map = fabricTexture;
  setEditingComponentName(clickedMesh.name);
}
