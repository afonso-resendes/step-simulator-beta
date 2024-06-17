import { getDownloadURL, ref, uploadString } from "firebase/storage";
import { getPartName } from "./getPartName";
import { storage } from "@/src/firebase";

const logAllObjectsFromAllCanvases = async (fabricCanvases, clientData) => {
    const customizationData = [];

    for (const canvas of fabricCanvases) {
      if (!canvas) {
        continue;
      }

      const objects = canvas.getObjects();

      const component = {
        part: getPartName(canvas.part),
        color: canvas.backgroundColor,
        images: [],
        texts: [],
      };

      for (const obj of objects) {
        if (
          obj.type === "image" &&
          obj._element &&
          obj._element.src.startsWith("data:image")
        ) {
          const imageData = obj._element.src.split(";base64,").pop();
          const imageName = `image_${Date.now()}.png`;
          const imagePath = `images/${imageName}`;
          const imageRef = ref(storage, imagePath);

          try {
            await uploadString(imageRef, imageData, "base64");

            const downloadURL = await getDownloadURL(imageRef);

            component.images.push(downloadURL);
          } catch (error) {
            console.error("Error uploading image:", error);
          }
        } else if (obj.type === "textbox") {
          component.texts.push({
            text: obj.text,
            fontFamily: obj.fontFamily,
            color: obj.fill,
          });
        }
      }

      customizationData.push(component);
    }

    sendData(customizationData, clientData);

    return customizationData;
};

const sendData = async (data, clientData) => {

    const mergedData = { data, clientData };

    try {
      const response = await fetch(
        "https://allkits-server.onrender.com/sendEmail",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          }, 
          body: JSON.stringify(mergedData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send data");
      }

      const responseData = await response.text();
      console.log(responseData);
    } catch (error) {
      console.error("Error:", error);
    }
  };

export {logAllObjectsFromAllCanvases}