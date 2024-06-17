import { fabric } from "fabric";
//import { rgbToHex } from "../misc/rgb-to-hex";

export function assignCanvasToMesh(mesh, canvasSize) {
  let ownCanvas = new fabric.Canvas("temp", {
    width: canvasSize,
    height: canvasSize,
    backgroundColor: "#fff",
    part: mesh.name,
  });
  //if (mesh && mesh.userData && mesh.userData.canvas)
  mesh.userData.canvas = ownCanvas;
}
