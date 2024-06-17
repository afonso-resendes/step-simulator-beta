import * as THREE from "three";
import { getIntersection } from "../three/get-intersections";
import { calculateAverageUV, getUVDimensions } from "../three/get-uv-data";
export function scaleRotateMove(
  x,
  y,
  initialMouse,
  previousMouse,
  currentMouse,
  initialMouseOut,
  initialUVCursor,
  previousUVCursor,
  currentUVCursor,
  editingComponent,
  raycaster,
  camera,
  isMouseOutsideModel,
  fabricCanvas,
  objectRotation,
  updateTexture,
  selectImageResult,
  canvasSize,
  originalLeft,
  originalTop,
  originalOCoords,
  textBoxWidth,
  initialAngle,
  lastDUVRecorded,
  lastDCursorRecorded,
  lastDeltaUVRecorded,
  orbit
) {
  orbit.enabled = false;
  const canvasW = fabricCanvas.current.width;
  const canvasH = fabricCanvas.current.height;
  currentMouse.x = (x / window.innerWidth) * 2 - 1;
  currentMouse.y = -(y / window.innerHeight) * 2 + 1;

  const isHandleSelected = selectImageResult.selectedHandle;
  const selectedHandle = selectImageResult.selectedHandle;
  const isImageSelected = selectImageResult.isImageSelected;

  const minScaleAllowed = canvasSize / 20;
  const maxScaleAllowed = canvasSize / 1.5;

  let deltaUV, dUV;
  let dMouse = new THREE.Vector2(
    currentMouse.x - previousMouse.x,
    currentMouse.y - previousMouse.y
  );
  let deltaMouse = new THREE.Vector2(
    currentMouse.x - initialMouse.x,
    currentMouse.y - initialMouse.y
  );
  let scaleVector;

  let intersection = null;
  if (editingComponent.current) {
    intersection = getIntersection(
      raycaster,
      camera,
      editingComponent.current,
      currentMouse
    )[0];
  }

  const activeObject = fabricCanvas.current.getActiveObject();
  if (isImageSelected && activeObject) {
    objectRotation.current = activeObject.angle ? activeObject.angle : 0;
    const width = activeObject.width;
    const height = activeObject.height;

    if (intersection != null) {
      currentUVCursor = new THREE.Vector2(
        intersection.uv.x * canvasW,
        intersection.uv.y * canvasH
      );

      dUV = new THREE.Vector2(
        currentUVCursor.x - previousUVCursor.x,
        currentUVCursor.y - previousUVCursor.y
      );

      deltaUV = new THREE.Vector2(
        currentUVCursor.x - initialUVCursor.x,
        currentUVCursor.y - initialUVCursor.y
      );

      lastDUVRecorded.current = new THREE.Vector2(dUV.x, dUV.y);
      lastDCursorRecorded.current = new THREE.Vector2(dMouse.x, dMouse.y);
      lastDeltaUVRecorded.current = new THREE.Vector2(deltaUV.x, deltaUV.y);
      initialMouseOut.current = new THREE.Vector2(
        (x / window.innerWidth) * 2 - 1,
        -(y / window.innerHeight) * 2 + 1
      );
    } else {
      let deltaMouseOut = new THREE.Vector2(
        ((currentMouse.x - initialMouseOut.current.x) * window.innerWidth) / 2,
        ((currentMouse.y - initialMouseOut.current.y) * window.innerHeight) / 2
      );

      if (lastDCursorRecorded.current.x == 0) {
        lastDCursorRecorded.current.x = lastDCursorRecorded.current.y;
      }
      if (lastDCursorRecorded.current.y == 0) {
        lastDCursorRecorded.current.y = lastDCursorRecorded.current.x;
      }

      let ratio = new THREE.Vector2(
        lastDUVRecorded.current.x /
          ((lastDCursorRecorded.current.x * window.innerWidth) / 2),
        lastDUVRecorded.current.y /
          ((lastDCursorRecorded.current.y * window.innerHeight) / 2)
      );

      if (ratio.x > 3 || ratio.x < -3) {
        ratio.x = 3 * Math.sign(ratio.x);
      }
      if (ratio.y > 3 || ratio.y < -3) {
        ratio.y = 3 * Math.sign(ratio.y);
      }

      deltaUV = new THREE.Vector2(
        lastDeltaUVRecorded.current.x + deltaMouseOut.x * ratio.x,
        lastDeltaUVRecorded.current.y + deltaMouseOut.y * ratio.y
      );

      currentUVCursor = new THREE.Vector2(
        initialUVCursor.x + deltaUV.x,
        initialUVCursor.y + deltaUV.y
      );
    }

    if (isHandleSelected) {
      let scaleDirection;
      let scaleDirectionNorm;
      let scaleDirectionUnit;
      let scaleFactor;
      let scaleDirectionUnitOnObject;
      let originalCoords = originalOCoords.current;
      let sin = Math.sin((activeObject.angle * Math.PI) / 180);
      let cos = Math.cos((activeObject.angle * Math.PI) / 180);
      let newOCoords = {
        tr: { x: 0, y: 0 },
        tl: { x: 0, y: 0 },
        br: { x: 0, y: 0 },
        bl: { x: 0, y: 0 },
      };
      switch (selectedHandle) {
        case "tr":
          scaleDirection = new THREE.Vector2(
            originalCoords.tr.x - originalCoords.bl.x,
            originalCoords.tr.y - originalCoords.bl.y
          );
          scaleDirectionNorm = vectorNorm(scaleDirection);

          scaleDirectionUnit = new THREE.Vector2(
            scaleDirection.x / scaleDirectionNorm,
            scaleDirection.y / scaleDirectionNorm
          );

          scaleFactor = dotProduct(scaleDirectionUnit, deltaUV);
          scaleVector = scaleDirectionUnit.multiplyScalar(scaleFactor);

          scaleDirectionUnitOnObject = new THREE.Vector2(
            scaleVector.x * cos + scaleVector.y * sin,
            scaleVector.y * cos - scaleVector.x * sin
          );

          newOCoords = {
            tr: {
              x: originalCoords.tr.x + scaleVector.x,
              y: originalCoords.tr.y + scaleVector.y,
            },
            tl: {
              x: originalCoords.tl.x - scaleDirectionUnitOnObject.y * sin,
              y: originalCoords.tl.y + scaleDirectionUnitOnObject.y * cos,
            },
            br: {
              x: originalCoords.br.x + scaleDirectionUnitOnObject.x * cos,
              y: originalCoords.br.y + scaleDirectionUnitOnObject.x * sin,
            },
            bl: {
              x: originalCoords.bl.x,
              y: originalCoords.bl.y,
            },
          };

          break;

        case "tl":
          scaleDirection = new THREE.Vector2(
            originalCoords.tl.x - originalCoords.br.x,
            originalCoords.tl.y - originalCoords.br.y
          );
          scaleDirectionNorm = vectorNorm(scaleDirection);

          scaleDirectionUnit = new THREE.Vector2(
            scaleDirection.x / scaleDirectionNorm,
            scaleDirection.y / scaleDirectionNorm
          );

          scaleFactor = dotProduct(scaleDirectionUnit, deltaUV);
          scaleVector = scaleDirectionUnit.multiplyScalar(scaleFactor);

          scaleDirectionUnitOnObject = new THREE.Vector2(
            scaleVector.x * cos + scaleVector.y * sin,
            scaleVector.y * cos - scaleVector.x * sin
          );

          newOCoords = {
            tl: {
              x: originalCoords.tl.x + scaleVector.x,
              y: originalCoords.tl.y + scaleVector.y,
            },
            tr: {
              x: originalCoords.tr.x - scaleDirectionUnitOnObject.y * sin,
              y: originalCoords.tr.y + scaleDirectionUnitOnObject.y * cos,
            },
            bl: {
              x: originalCoords.bl.x + scaleDirectionUnitOnObject.x * cos,
              y: originalCoords.bl.y + scaleDirectionUnitOnObject.x * sin,
            },
            br: {
              x: originalCoords.br.x,
              y: originalCoords.br.y,
            },
          };

          break;

        case "br":
          scaleDirection = new THREE.Vector2(
            originalCoords.br.x - originalCoords.tl.x,
            originalCoords.br.y - originalCoords.tl.y
          );
          scaleDirectionNorm = vectorNorm(scaleDirection);

          scaleDirectionUnit = new THREE.Vector2(
            scaleDirection.x / scaleDirectionNorm,
            scaleDirection.y / scaleDirectionNorm
          );

          scaleFactor = dotProduct(scaleDirectionUnit, deltaUV);
          scaleVector = scaleDirectionUnit.multiplyScalar(scaleFactor);

          scaleDirectionUnitOnObject = new THREE.Vector2(
            scaleVector.x * cos + scaleVector.y * sin,
            scaleVector.y * cos - scaleVector.x * sin
          );

          newOCoords = {
            tl: {
              x: originalCoords.tl.x,
              y: originalCoords.tl.y,
            },
            tr: {
              x: originalCoords.tr.x + scaleDirectionUnitOnObject.x * cos,
              y: originalCoords.tr.y + scaleDirectionUnitOnObject.x * sin,
            },
            bl: {
              x: originalCoords.bl.x - scaleDirectionUnitOnObject.y * sin,
              y: originalCoords.bl.y + scaleDirectionUnitOnObject.y * cos,
            },
            br: {
              x: originalCoords.br.x + scaleVector.x,
              y: originalCoords.br.y + scaleVector.y,
            },
          };

          break;

        case "bl":
          scaleDirection = new THREE.Vector2(
            originalCoords.bl.x - originalCoords.tr.x,
            originalCoords.bl.y - originalCoords.tr.y
          );
          scaleDirectionNorm = vectorNorm(scaleDirection);

          scaleDirectionUnit = new THREE.Vector2(
            scaleDirection.x / scaleDirectionNorm,
            scaleDirection.y / scaleDirectionNorm
          );

          scaleFactor = dotProduct(scaleDirectionUnit, deltaUV);
          scaleVector = scaleDirectionUnit.multiplyScalar(scaleFactor);

          scaleDirectionUnitOnObject = new THREE.Vector2(
            scaleVector.x * cos + scaleVector.y * sin,
            scaleVector.y * cos - scaleVector.x * sin
          );

          newOCoords = {
            tl: {
              x: originalCoords.tl.x + scaleDirectionUnitOnObject.x * cos,
              y: originalCoords.tl.y + scaleDirectionUnitOnObject.x * sin,
            },
            tr: {
              x: originalCoords.tr.x,
              y: originalCoords.tr.y,
            },
            bl: {
              x: originalCoords.bl.x + scaleVector.x,
              y: originalCoords.bl.y + scaleVector.y,
            },
            br: {
              x: originalCoords.br.x - scaleDirectionUnitOnObject.y * sin,
              y: originalCoords.br.y + scaleDirectionUnitOnObject.y * cos,
            },
          };

          break;

        case "ml":
          scaleDirection = new THREE.Vector2(
            originalCoords.ml.x - originalCoords.mr.x,
            originalCoords.ml.y - originalCoords.mr.y
          );
          scaleDirectionNorm = vectorNorm(scaleDirection);

          scaleDirectionUnit = new THREE.Vector2(
            scaleDirection.x / scaleDirectionNorm,
            scaleDirection.y / scaleDirectionNorm
          );

          scaleFactor = dotProduct(scaleDirectionUnit, deltaUV);
          scaleVector = scaleDirectionUnit.multiplyScalar(scaleFactor);

          scaleDirectionUnitOnObject = new THREE.Vector2(
            -scaleVector.x * cos + scaleVector.y * sin,
            scaleVector.y * cos - scaleVector.x * sin
          );

          newOCoords = {
            tr: {
              x: originalCoords.tr.x,
              y: originalCoords.tr.y,
            },
            br: {
              x: originalCoords.br.x,
              y: originalCoords.br.y,
            },
            bl: {
              x: originalCoords.bl.x + scaleVector.x,
              y: originalCoords.bl.y + scaleVector.y,
            },
            tl: {
              x: originalCoords.tl.x + scaleVector.x,
              y: originalCoords.tl.y + scaleVector.y,
            },
          };
          break;

        case "mr":
          scaleDirection = new THREE.Vector2(
            originalCoords.mr.x - originalCoords.ml.x,
            originalCoords.mr.y - originalCoords.ml.y
          );
          scaleDirectionNorm = vectorNorm(scaleDirection);

          scaleDirectionUnit = new THREE.Vector2(
            scaleDirection.x / scaleDirectionNorm,
            scaleDirection.y / scaleDirectionNorm
          );

          scaleFactor = dotProduct(scaleDirectionUnit, deltaUV);
          scaleVector = scaleDirectionUnit.multiplyScalar(scaleFactor);

          scaleDirectionUnitOnObject = new THREE.Vector2(
            scaleVector.x * cos + scaleVector.y * sin,
            scaleVector.y * cos - scaleVector.x * sin
          );

          newOCoords = {
            tr: {
              x: originalCoords.tr.x + scaleVector.x,
              y: originalCoords.tr.y + scaleVector.y,
            },
            br: {
              x: originalCoords.br.x + scaleVector.x,
              y: originalCoords.br.y + scaleVector.y,
            },
            bl: {
              x: originalCoords.bl.x,
              y: originalCoords.bl.y,
            },
            tl: {
              x: originalCoords.tl.x,
              y: originalCoords.tl.y,
            },
          };
          break;

        case "mt":
          scaleDirection = new THREE.Vector2(
            originalCoords.mt.x - originalCoords.mb.x,
            originalCoords.mt.y - originalCoords.mb.y
          );
          scaleDirectionNorm = vectorNorm(scaleDirection);

          scaleDirectionUnit = new THREE.Vector2(
            scaleDirection.x / scaleDirectionNorm,
            scaleDirection.y / scaleDirectionNorm
          );

          scaleFactor = dotProduct(scaleDirectionUnit, deltaUV);
          scaleVector = scaleDirectionUnit.multiplyScalar(scaleFactor);

          newOCoords = {
            tr: {
              x: originalCoords.tr.x + scaleVector.x,
              y: originalCoords.tr.y + scaleVector.y,
            },
            br: {
              x: originalCoords.br.x,
              y: originalCoords.br.y,
            },
            bl: {
              x: originalCoords.bl.x,
              y: originalCoords.bl.y,
            },
            tl: {
              x: originalCoords.tl.x + scaleVector.x,
              y: originalCoords.tl.y + scaleVector.y,
            },
          };
          break;
        case "mb":
          scaleDirection = new THREE.Vector2(
            originalCoords.mb.x - originalCoords.mt.x,
            originalCoords.mb.y - originalCoords.mt.y
          );
          scaleDirectionNorm = vectorNorm(scaleDirection);

          scaleDirectionUnit = new THREE.Vector2(
            scaleDirection.x / scaleDirectionNorm,
            scaleDirection.y / scaleDirectionNorm
          );

          scaleFactor = dotProduct(scaleDirectionUnit, deltaUV);
          scaleVector = scaleDirectionUnit.multiplyScalar(scaleFactor);

          newOCoords = {
            tr: {
              x: originalCoords.tr.x,
              y: originalCoords.tr.y,
            },
            br: {
              x: originalCoords.br.x + scaleVector.x,
              y: originalCoords.br.y + scaleVector.y,
            },
            bl: {
              x: originalCoords.bl.x + scaleVector.x,
              y: originalCoords.bl.y + scaleVector.y,
            },
            tl: {
              x: originalCoords.tl.x,
              y: originalCoords.tl.y,
            },
          };
          break;
        case "mtr":
          const center = new THREE.Vector2(activeObject.left, activeObject.top);

          objectRotation.current = calculateAngle(
            center,
            initialUVCursor,
            currentUVCursor
          );

          let rotation =
            360 *
            (objectRotation.current / 360 -
              Math.floor(objectRotation.current / 360));

          activeObject.set({
            angle: initialAngle + rotation,
          });
          break;
      }

      if (selectedHandle != "mtr") {
        console.log("ksjadb");
        if (activeObject instanceof fabric.Image) {
          if (
            distanceFrom(newOCoords.tl, newOCoords.tr) < maxScaleAllowed &&
            distanceFrom(newOCoords.tl, newOCoords.tr) > minScaleAllowed &&
            distanceFrom(newOCoords.tr, newOCoords.br) < maxScaleAllowed &&
            distanceFrom(newOCoords.tr, newOCoords.br) > minScaleAllowed
          ) {
            if (
              (Math.sign(scaleFactor) == -1 &&
                vectorNorm(scaleVector) < scaleDirectionNorm) ||
              Math.sign(scaleFactor) != -1
            ) {
              activeObject.set({
                top: originalTop.current + scaleVector.y / 2,
                left: originalLeft.current + scaleVector.x / 2,
                scaleX: distanceFrom(newOCoords.tl, newOCoords.tr) / width,
                scaleY: distanceFrom(newOCoords.tr, newOCoords.br) / height,
              });
            }
          }
        } else if (activeObject instanceof fabric.Textbox) {
          if (selectedHandle == "ml" || selectedHandle == "mr") {
            const newWidth = textBoxWidth + scaleDirectionUnitOnObject.x * 2;

            if (
              !(
                activeObject.textLines.length == 1 &&
                newWidth > activeObject.getLineWidth(0) + 10
              )
            ) {
              activeObject.set({
                width: newWidth,
              });
            }
          }
        }
      }
    } else {
      if (intersection != null) {
        let addGuides = true;
        fabricCanvas.current.forEachObject((obj, index) => {
          if (obj instanceof fabric.Line) {
            addGuides = false;
          }
        });

        const center = canvasW / 2;
        const uvCenter = calculateAverageUV(editingComponent.current);

        if (addGuides) {
          let lineV = new fabric.Line(
            [
              uvCenter.averageU * canvasW,
              0,
              uvCenter.averageU * canvasW,
              canvasW * 2,
            ],
            {
              stroke: "#00bfff81",
              strokeWidth: 2,
              selectable: false,
            }
          );
          let lineH = new fabric.Line(
            [
              0,
              (uvCenter.averageV - 0.05) * canvasH,
              canvasH * 2,
              (uvCenter.averageV - 0.05) * canvasH,
            ],
            {
              stroke: "#00bfff81",
              strokeWidth: 2,
              selectable: false,
            }
          );
          fabricCanvas.current.add(lineV);
          fabricCanvas.current.add(lineH);
        }

        const uvDimensions = getUVDimensions(editingComponent.current);

        let uCoord = originalLeft.current + deltaUV.x;
        let vCoord = originalTop.current + deltaUV.y;

        const tolerance = center / 20;

        const supLimU = uvCenter.averageU * canvasW + tolerance;
        const infLimU = uvCenter.averageU * canvasW - tolerance;

        const supLimV = (uvCenter.averageV - 0.05) * canvasH + tolerance;
        const infLimV = (uvCenter.averageV - 0.05) * canvasH - tolerance;

        if (uCoord < supLimU && uCoord > infLimU) {
          uCoord = uvCenter.averageU * canvasW;
        }
        if (vCoord < supLimV && vCoord > infLimV) {
          vCoord = (uvCenter.averageV - 0.05) * canvasH;
        }

        if (
          uCoord < (uvCenter.averageU + uvDimensions.width / 2) * canvasW &&
          uCoord > (uvCenter.averageU - uvDimensions.width / 2) * canvasW
        ) {
          activeObject.set({
            left: uCoord,
            originX: "center",
            originY: "center",
          });
        }
        if (
          vCoord < (uvCenter.averageV + uvDimensions.height / 2) * canvasH &&
          vCoord > (uvCenter.averageV - uvDimensions.height / 2) * canvasH
        ) {
          activeObject.set({
            top: vCoord,
            originX: "center",
            originY: "center",
          });
        }
      }
    }

    if (activeObject instanceof fabric.Image) {
      const minSide = Math.min(
        activeObject.width * activeObject.scaleX,
        activeObject.height * activeObject.scaleY
      );
      let tolerance = minSide / 10;
      if (tolerance < canvasSize / 100) tolerance = canvasSize / 100;
      activeObject.set({
        cornerSize: tolerance,
        rotatingPointOffset:
          (activeObject.height * activeObject.scaleY) / 2 + tolerance,
      });
      const originalControl = fabric.Object.prototype.controls.mtr;
      fabric.Object.prototype.controls.mtr = new fabric.Control({
        x: 0,
        y: 0,
        offsetY:
          -((height * activeObject.scaleY) / 2) -
          (width * activeObject.scaleX + height * activeObject.scaleY) / 20,
        actionHandler: originalControl.actionHandler,
        withConnection: true,
        actionName: "rotate",
      });
    }

    previousUVCursor.x = currentUVCursor.x;
    previousUVCursor.y = currentUVCursor.y;
    previousMouse.x = currentMouse.x;
    previousMouse.y = currentMouse.y;
    fabricCanvas.current.renderAll();
    updateTexture();
  }
}

function calculateAngle(centralPoint, initialCursor, currentCursor) {
  const vetorInicial = {
    x: initialCursor.x - centralPoint.x,
    y: initialCursor.y - centralPoint.y,
  };

  const vetorAtual = {
    x: currentCursor.x - centralPoint.x,
    y: currentCursor.y - centralPoint.y,
  };

  const anguloInicial = Math.atan2(vetorInicial.y, vetorInicial.x);
  const anguloAtual = Math.atan2(vetorAtual.y, vetorAtual.x);

  let anguloRotacao = anguloAtual - anguloInicial;

  anguloRotacao *= 180 / Math.PI;

  anguloRotacao = (anguloRotacao + 360) % 360;

  return anguloRotacao;
}

function dotProduct(vector1, vector2) {
  return vector1.dot(vector2);
}

function average(a, b) {
  return (a + b) / 2;
}

function vectorNorm(v) {
  return Math.sqrt(Math.pow(v.x, 2) + Math.pow(v.y, 2));
}

function distanceFrom(a, b) {
  let vector = { x: a.x - b.x, y: a.y - b.y };
  return vectorNorm(vector);
}

function rotateVector(v, angle) {
  let x = v.x,
    y = v.y;
  let radians = (angle * Math.PI) / 180;
  let rotatedX = x * Math.cos(radians) - y * Math.sin(radians);
  let rotatedY = x * Math.sin(radians) + y * Math.cos(radians);
  return { x: rotatedX, y: rotatedY };
}
