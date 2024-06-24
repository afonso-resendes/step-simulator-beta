import { animatePrice } from "../animations/animate-price";
import { copyCanvasWOBG } from "../canvas/copy-canvas";
import { calculateUVArea } from "../three/get-uv-data";
import * as THREE from "three";
import { isPointInUV } from "./isPointInUV";

export function calculateArea(sceneRef, setAnimatedPrice) {
  console.log("start");
  let totalPrice = 13.25;
  console.log(totalPrice);
  let realPartArea;

  let canvasesAndPercentages = [];

  sceneRef.current.children.forEach((child) => {
    if (child instanceof THREE.Group) {
      child.children.forEach((mesh) => {
        let percentageOccupiedByUV = calculateUVArea(mesh.geometry);
        let canvas = mesh.userData.canvas;

        if (canvas)
          canvasesAndPercentages.push({ canvas, percentageOccupiedByUV });
      });
    }
  });

  canvasesAndPercentages.forEach((object) => {
    let percentageOccupiedByUV = object.percentageOccupiedByUV;
    let canvas = object.canvas;

    if (canvas.part.includes("body")) {
      realPartArea = 63 * 54; //cm^2
    } else if (canvas.part.includes("manga")) {
      realPartArea = 61 * 48; //cm^2
    } else {
      //pocket
      realPartArea = 36 * 18; //cm^2
    }

    // realPartAreaCm----------------percentageOccupiedByUV
    // canvasAreaCm------------------1

    const canvasAreaCm = realPartArea / percentageOccupiedByUV;

    let finalPrintCanvas = new fabric.Canvas("temp", {
      width: canvas.width,
      height: canvas.height,
      backgroundColor: "transparent",
    });

    finalPrintCanvas.clear();

    //canvas.renderAll();

    copyCanvasWOBG(canvas, finalPrintCanvas);

    let finalPrintPngData = finalPrintCanvas.toDataURL({ format: "png" });
    console.log(finalPrintPngData);
    /*
    let finalPrintImage = new Image();
    finalPrintImage.src = finalPrintPngData;*/

    const pixelRatio = window.devicePixelRatio || 1;

    const ctx = finalPrintCanvas.getContext("2d");
    const imageData = ctx.getImageData(
      0,
      0,
      finalPrintCanvas.width * pixelRatio,
      finalPrintCanvas.height * pixelRatio
    );

    const data = imageData.data;

    let pixelsWithPrint = 0;

    for (let i = 0; i < data.length; i += 4) {
      /*let index = i / 4;
      let x = index % finalPrintCanvas.width;
      let y = Math.floor(index / finalPrintCanvas.width);*/

      //const pointInUV = isPointInUV(x, y, meshGeometry);

      if (data[i + 3] > 10 /*&& pointInUV*/) {
        pixelsWithPrint += 1;
      }
    }

    ctx.putImageData(imageData, 0, 0);

    const canvasAreaPixels = canvas.width * canvas.height;

    const percentageOfPrint = pixelsWithPrint / canvasAreaPixels;

    const areaOfPrintingCm = canvasAreaCm * percentageOfPrint;

    const tenCm2Blocks = Math.ceil(areaOfPrintingCm) / 100;

    const aditionalCost = tenCm2Blocks * 1.6;

    totalPrice += aditionalCost;
    console.log(totalPrice);
  });

  console.log("total", totalPrice);

  animatePrice(0, totalPrice, 1000, setAnimatedPrice);
}
