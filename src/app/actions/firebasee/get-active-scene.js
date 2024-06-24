import * as THREE from "three";

import { addDoc, collection } from "firebase/firestore";
import {
  ref,
  uploadString,
  getDownloadURL,
  uploadBytes,
} from "firebase/storage";

import { storage, db } from "@/src/firebase";

async function getActiveScene(
  setDocId,
  setAllCanvasData,
  clientData,
  model,
  sceneRef
) {
  const dataL = await getFabricData(setAllCanvasData, sceneRef);
  console.log("EEE", dataL);
  try {
    const response = await fetch(
      "https://allkits-server.onrender.com/convertSceneToText",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sceneData: dataL,
          clientData,
          model: model,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to convert scene to JSON");
    }

    const data = await response.json();
    const id = data.docId;

    setDocId(id);
  } catch (error) {
    console.error("Error:", error);
  }
}

const getFabricData = async (setAllCanvasData, sceneRef) => {
  const allCanvasData = [];
  let group;

  sceneRef.current.children.forEach((child) => {
    if (child instanceof THREE.Group) {
      group = child;
    }
  });
  let fabricCanvases = [];
  group.children.forEach((mesh) => {
    if (mesh.userData && mesh.userData.canvas) {
      console.log(mesh.userData.canvas);
      fabricCanvases.push(mesh.userData.canvas);
    }
  });

  for (const canvas of fabricCanvases) {
    const objects = canvas.getObjects();
    const canvasData = {
      width: canvas.width,
      height: canvas.height,
      backgroundColor: canvas.backgroundColor,
      texts: [],
      images: [],
      paths: [],
      part: canvas.part,
    };

    for (const obj of objects) {
      if (obj.type === "textbox") {
        canvasData.texts.push({
          text: obj.text,
          fontFamily: obj.fontFamily,
          fontSize: obj.fontSize,
          color: obj.fill,
          top: obj.top,
          left: obj.left,
          width: obj.width,
          textAlign: obj.textAlign,
          index: canvas._objects.indexOf(obj),
        });
      } else if (
        obj.type === "image" &&
        obj._element &&
        obj._element.src.startsWith("data:image")
      ) {
        console.log("tem imagem");
        const baseImage = obj._element.src;

        const imageData = obj._element.src.split(";base64,").pop();
        const imageName = `image_${Date.now()}.png`;
        const imagePath = `images/${imageName}`;
        const imageRef = ref(storage, imagePath);

        try {
          await uploadString(imageRef, imageData, "base64");
          const base64 = await addDocument(baseImage);

          const downloadURL = await getDownloadURL(imageRef);

          canvasData.images.push({
            url: downloadURL,
            base64: base64,
            scaleX: obj.scaleX,
            scaleY: obj.scaleY,
            top: obj.top,
            left: obj.left,
            width: obj.width,
            height: obj.height,
            angle: obj.angle ? obj.angle : 0,
            flipX: obj.flipX ? obj.flipX : false,
            index: canvas._objects.indexOf(obj),
          });
        } catch (error) {
          console.error("Error uploading image:", error);
        }
      } else if (obj instanceof fabric.Path) {
        canvasData.paths.push({
          path: obj.path,
          left: obj.left,
          top: obj.top,
          fill: obj.fill,
          stroke: obj.stroke,
          strokeWidth: obj.strokeWidth,
          strokeLineCap: obj.strokeLineCap,
          strokeLineJoin: obj.strokeLineJoin,
          strokeDashArray: obj.strokeDashArray,
        });
      }
    }

    allCanvasData.push(canvasData);
  }

  setAllCanvasData(allCanvasData);
  return allCanvasData;
};

const addDocument = async (value) => {
  try {
    const docRef = await addDoc(collection(db, "base64"), {
      base64: value,
    });
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    return null; // Return null in case of error
  }
};

export { getActiveScene };
