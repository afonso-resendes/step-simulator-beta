"use client";
//REACT
import React, { useEffect, useRef, useState } from "react";
import NextImage from "next/image";

//FABRIC
import { fabric } from "fabric";

//IMGS
import logoStep from "../../../../public/logoStep.png";
import copyIcon from "../../../imgs/icons/copy.png";

//THREE
import * as THREE from "three";
import { loadGLBModel } from "../../actions/three/load-glb-model";
import { createSceneLayout } from "../../actions/three/create-scene-layout";
import TWEEN from "@tweenjs/tween.js";

//FIREBASE
import { fetchScene } from "../../actions/firebasee/fetch-scene";
import { getBase64Data } from "../../actions/firebasee/get-base-64-data";

//STYLES
import styles from "@/src/app/visualize/[id]/visualize.module.css";

const Visualize = ({ params }) => {
  const canvasRefs = useRef({});
  const containerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [objectNames, setObjectNames] = useState([]);
  let orbit;

  const model = params.id[params.id.length - 1];
  console.log(model);

  const modelUrls = {
    1: "/glbs/meshes/hoodie11.glb",
    2: "/tshirt.glb",
  };

  const url = modelUrls[model] || null;

  const mesh = useRef(null);

  useEffect(() => {
    const textures = 0; //getTextures();

    const initializeCanvas = async (scene) => {
      const sceneDataArray = await fetchScene(params);

      if (!sceneDataArray || !Array.isArray(sceneDataArray)) {
        return;
      }
      sceneDataArray.forEach((sceneData, index) => {
        const {
          width,
          height,
          backgroundColor,
          texts,
          images,
          paths,
          pathsWithCircles,
          part,
        } = sceneData;

        const canvas = new fabric.Canvas(`${part}`, {
          width,
          height,
        });

        canvas.setBackgroundColor(
          backgroundColor,
          canvas.renderAll.bind(canvas)
        );

        canvas.backgroundColor = backgroundColor;

        if (texts && texts.length > 0) {
          texts.forEach(
            async ({
              text,
              fontFamily,
              color,
              top,
              left,
              fontSize,
              width,
              textAlign,
              index,
            }) => {
              const textObject = new fabric.Textbox(text, {
                fontFamily,
                fontSize,
                fill: color,
                left,
                top,
                width,
                originX: "center",
                originY: "center",
                textAlign,
                index: index,
              });
              canvas.add(textObject);
            }
          );
        }

        if (images && images.length > 0) {
          images.forEach(
            async ({
              base64,
              top,
              left,
              width,
              height,
              scaleX,
              scaleY,
              angle,
              flipX,
              index,
            }) => {
              const base64String = await getBase64Data(base64);
              if (base64String) {
                fabric.Image.fromURL(
                  base64String,
                  (img) => {
                    img.set({
                      left,
                      top,
                      scaleX,
                      scaleY,
                      width,
                      height,
                      angle,
                      originX: "center",
                      originY: "center",
                      flipX,
                      index: index,
                    });

                    canvas.add(img);
                    //canvas.renderAll();
                  },
                  { crossOrigin: "anonymous" } // Add crossOrigin to handle CORS if needed
                );
              }
            }
          );
        }

        if (paths && paths.length >= 1) {
          paths.forEach(
            async ({
              path,
              stroke,
              strokeWidth,
              strokeLineCap,
              strokeLineJoin,
              left,
              top,
              width,
              height,
              pathOffset,
              objects,
            }) => {
              let newPath = new fabric.Path(path);
              newPath.set({
                path,
                stroke,
                strokeWidth,
                strokeLineCap,
                strokeLineJoin,
                left,
                top,
                width,
                height,
                pathOffset,
                fill: "transparent",
                originX: "center",
                originY: "center",
              });

              console.log(newPath);

              canvas.add(newPath);
            }
          );
        }

        if (pathsWithCircles && pathsWithCircles.length >= 1) {
          console.log(pathsWithCircles);
          pathsWithCircles.forEach(async ({ objects }) => {
            objects.forEach((circle) => {
              let newCircle = new fabric.Circle();

              newCircle.set({
                width: circle.width,
                height: circle.height,
                left: circle.left,
                top: circle.top,
                fill: circle.fill,
              });

              canvas.add(newCircle);
            });
          });
        }
        canvas.renderAll();

        canvasRefs.current[`${part}`] = canvas;
      });

      setTimeout(() => {
        scene.children.forEach((child) => {
          if (child instanceof THREE.Group) {
            child.children.forEach((meshh) => {
              if (Object.keys(canvasRefs.current).includes(meshh.name)) {
                mesh.current = meshh;
                const canvas = canvasRefs.current[meshh.name];
                console.log(canvas);

                canvas._objects.sort((a, b) => a.index - b.index);
                canvas.renderAll();

                try {
                  const newTexture = new THREE.CanvasTexture(
                    canvasRefs.current[meshh.name].lowerCanvasEl
                  );

                  newTexture.flipY = false;
                  newTexture.colorSpace = THREE.SRGBColorSpace;
                  mesh.current.material.map = newTexture;
                  mesh.current.material.map.needsUpdate = true;
                } catch (error) {
                  console.error("Error creating texture:", error);
                }
              }
            });
          }
        });

        animate();
      }, 3000);
    };

    const sceneLayout = createSceneLayout();
    const scene = sceneLayout.scene;
    const camera = sceneLayout.camera;
    const renderer = sceneLayout.renderer;
    orbit = sceneLayout.orbit;
    loadGLBModel(url, scene, setIsLoading, textures, renderer, () => {
      setTimeout(() => {
        initializeCanvas(scene);
      }, 1500);
    });
    containerRef.current.appendChild(renderer.domElement);

    initializeCanvas(scene);

    const animate = () => {
      requestAnimationFrame(animate);

      TWEEN.update();
      orbit.update();
      renderer.render(scene, camera);
    };

    //animate();

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener("resize", onWindowResize);

    return () => {
      window.removeEventListener("resize", onWindowResize);
      renderer.domElement.remove();
      renderer.dispose();
    };
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(`http://localhost:3000/visualize/${params.id}`)
      .then(
        () => {
          alert("Link de pré-visualização copiado com sucesso!"); // Optionally show a message
        },
        (err) => {
          console.error("Não foi possível copiar o link: ", err); // Error handling
        }
      );
  };

  return (
    <>
      <div ref={containerRef}></div>

      <button onClick={copyToClipboard} className={styles.copiaTextMain}>
        <NextImage src={copyIcon} width={17} height={17} />
        <p className={styles.copiaText} style={{ zIndex: "1000" }}>
          Copia o link para poderes partilhar a tua obra!
        </p>
      </button>
      <div className={styles.poweredTextMain}>
        <p className={styles.poweredText}>Powered by</p>
        <NextImage
          className={styles.poweredLogo}
          src={logoStep}
          width={105}
          height={45}
        />
      </div>
    </>
  );
};

export default Visualize;