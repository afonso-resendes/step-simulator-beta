"use client";

//EXTERNAL LIBRARIES
import * as THREE from "three";
import { fabric } from "fabric";
import TWEEN from "@tweenjs/tween.js";

//REACT IMPORTS
import { useEffect, useRef, useState } from "react";
import NextImage from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";

//IMAGES
import galeryIcon from "@/src/imgs/icons/galeryBlack.png";
import textIcon from "@/src/imgs/icons/textIcon.png";
import colorIcon from "@/src/imgs/icons/colorIcon.webp";
import desenhaIcon from "@/src/imgs/icons/paint-brush.png";
import mouse from "@/src/imgs/icons/mouse.png";
import spray from "@/src/imgs/icons/spray.png";
import model1 from "@/src/imgs/hoodie-options/3foto.png";
import tshirt from "@/src/imgs/hoodie-options/tshirt.png";
import arrowBack from "@/src/imgs/hoodie-options/arrowBack.png";
import buildingIcon from "@/src/imgs/icons/buildingIcon.png";
import shareIcon from "@/src/imgs/icons/iconShare.png";

//EXTERNAL FUNTIONS
//THREE
import { createSceneLayout } from "../actions/three/create-scene-layout";
import { loadGLBModel } from "../actions/three/load-glb-model";
import {
  getIntersection,
  getIntersections,
} from "../actions/three/get-intersections";
import { setEditingComponent } from "../actions/three/set-editing-component";
import { storeCanvasAndTexture } from "../actions/canvas/store-canvas-and-texture";

//CANVAS
import { uploadImage } from "../actions/canvas/upload-image";
import { setBGColor } from "../actions/canvas/set-bg-color";
import { selectImage } from "../actions/canvas/select-image";
import { addTextbox } from "../actions/canvas/add-textbox";
import { scaleOrRotateOrMove } from "../actions/canvas/scale-or-rotate";
import { scaleOrRotateOrMove2 } from "../actions/canvas/scale-rotate-or-move";
import { hdri } from "../actions/three/load-hdri";

//ANIMATIONS
import { animateEmissiveColor } from "../actions/animations/animmate-emissive-color";
import { magicLoading } from "../actions/animations/magic-loading";

//MISC
import { getPartName } from "../actions/misc/getPartName";
import { logAllObjectsFromAllCanvases } from "../actions/misc/log-all-objects-frm-all-canvases";
import { calculateArea } from "../actions/misc/calculate-area";

//COMPONENTS
import ImageEditor from "./ImageEditor";
import ColorEditor from "./ColorEditor";
import TextEditor from "./TextEditor";

//STYLE
import styles from "../../styles/threedviewer.module.css";

//FIREBASE
import { getActiveScene } from "../actions/firebasee/get-active-scene";
import { sendData } from "../actions/firebasee/send-data";
import { scaleRotateMove } from "../actions/canvas/scale-rotate-move-new";
import { colors } from "../assets/colors";
import { CenteredPencilBrush, CenteredSprayBrush } from "../classes/brush";

const ThreeDViewer = () => {
  //VARIABLES//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //THREE
  let editingComponent = useRef(null);
  //const sceneLayoutRef = useRef(createSceneLayout());
  const sceneRef = useRef(null);
  /*const rendererRef = useRef(sceneLayoutRef.current.renderer);
  const cameraRef = useRef(sceneLayoutRef.current.camera);
  const orbitRef = useRef(sceneLayoutRef.current.orbit);*/
  let orbit;
  const [editingComponentName, setEditingComponentName] = useState("");
  const raycaster = new THREE.Raycaster();
  let currentMouse = new THREE.Vector2();
  let initialMouse = new THREE.Vector2();
  let initialMouseOut = useRef(null);
  let previousUVCursor = new THREE.Vector2();
  let currentUVCursor = new THREE.Vector2();
  let previousMouse = new THREE.Vector2();
  let initialUVCursor = new THREE.Vector2();
  const containerRef = useRef();
  const [fabricTexture, setFabricTexture] = useState(null);
  let selectedMesh = useRef(null);
  let isMouseOutsideModel = useRef(false);

  //FABRIC
  let fabricCanvas = useRef(null);
  const fabricCanvasRef = useRef(null);
  let objectRotation = useRef(0);
  const [activeObject, setActiveObject] = useState(null);
  const [canvasSize, setCanvasSize] = useState(1024);
  let originalLeft = useRef(null);
  let originalTop = useRef(null);
  let originalOCoords = useRef(null);
  let textBoxWidth;
  let initialAngle;
  const [activeText, setActiveText] = useState("");
  let lastPath = useRef(null);

  //CONTROL
  const [escolheBtn, setEscolheBtn] = useState(false);
  const [model, setModel] = useState("0");
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState(false);
  const [inputImage, setInputImage] = useState("");
  const [drawCanvasSize, setDrawCanvasSize] = useState(0);
  let activeObjectRef = useRef(null);

  const editZoneRef = useRef(null);
  const editZoneRefChild = useRef(null);

  let isDragging = false;
  let selectImageResult;

  const [colorEditor, setColorEditor] = useState(false);
  const [imageEditor, setImageEditor] = useState(false);
  const [textEditor, setTextEditor] = useState(false);

  const [imageSrc, setImageSrc] = useState("");

  const backgroundMagic = useRef(null);
  const modelosZone = useRef(null);
  const modelos = useRef(null);
  const titleModels = useRef(null);

  const [docId, setDocId] = useState("");

  const router = useRouter();

  const [clientData, setClientData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [forceClose, setForceClose] = useState(false);

  const [animatedPrice, setAnimatedPrice] = useState("0.00");

  const [success, setSuccess] = useState(false);

  const nextStep =
    clientData.name != "" &&
    clientData.email != "" &&
    clientData.phone != "" &&
    docId != "";

  const [allCanvasData, setAllCanvasData] = useState([]);

  const [windowWidth, setWindowWidth] = useState(0);
  const [windowHeight, setWindowHeight] = useState(0);

  let previousDrawnPath = useRef([]);

  let freeDrawingBrush = useRef(null);

  // Style based on preview state
  const buttonStyle = {
    right: preview
      ? windowWidth < 715
        ? 110
        : 165
      : windowWidth < 715
      ? 25
      : 50,
    backgroundColor: preview ? "rgba(255, 255, 255, 0.9)" : "#fff",
  };

  let editorStyle = {
    height: textEditor
      ? !activeObject
        ? window.innerWidth > 715
          ? 50 +
            56 *
              fabricCanvas.current._objects.filter(
                (obj) => obj instanceof fabric.Textbox
              ).length
          : 50 +
            56 *
              fabricCanvas.current._objects.filter(
                (obj) => obj instanceof fabric.Textbox
              ).length
        : window.innerWidth > 715
        ? 300 + (activeText.split("\n").length * 35) / 2
        : 150 + (activeText.split("\n").length * 35) / 2
      : imageEditor
      ? !activeObject
        ? 60 +
          103.7 *
            Math.floor(
              (fabricCanvas.current._objects.filter(
                (obj) => obj instanceof fabric.Image
              ).length +
                2) /
                3
            )
        : 300
      : colorEditor
      ? 292
      : editZoneRef.current &&
        editZoneRef.current.children[1] &&
        editZoneRef.current.children[1].children[0] &&
        editZoneRef.current.children[1].children[0].children &&
        editZoneRef.current.children[1].children[0].children.length
      ? `${
          100 +
          70 * (editZoneRef.current.children[1].children[0].children.length - 1)
        }px`
      : 0,
    maxHeight: "70vh",
  };

  let lastDUVRecorded = useRef(null);
  let lastDCursorRecorded = useRef(null);
  let lastDeltaUVRecorded = useRef(null);

  //TEXT EDITOR
  const [fillColor, setFillColor] = useState("#000000"); // Default color set to blue
  const [textAlign, setTextAlign] = useState("center");
  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontSize, setFontSize] = useState(35);

  const [showEditZone, setShowEditZone] = useState(false);

  // DRAWING
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const isDrawingRef = useRef(false);
  const [cursorType, setCursorType] = useState("cursor");

  const handleBrushSizeChange = (size) => {
    if (fabricCanvas.current) {
      fabricCanvas.current.freeDrawingBrush.width = parseInt(size, 10);
      fabricCanvas.current.renderAll(); // Redesenhe o canvas para aplicar mudanças visíveis
    }
  };

  const setBrushColor = (color) => {
    if (fabricCanvas.current) {
      fabricCanvas.current.freeDrawingBrush.color = color;
    }
  };

  const setBrushType = (type) => {
    if (!fabricCanvas.current) return;

    let newBrush;

    switch (type) {
      case "pencil":
        newBrush = new CenteredPencilBrush(fabricCanvas.current);
        setCursorType("pencil");
        break;
      case "spray":
        newBrush = new CenteredSprayBrush(fabricCanvas.current);
        setCursorType("spray");
        break;

      case "cursor":
        // Assuming 'cursor' means to toggle off drawing mode
        fabricCanvas.current.isDrawingMode = false;
        setCursorType("cursor");
        return;
      default:
        fabricCanvas.current.isDrawingMode = false;
        return;
    }

    fabricCanvas.current.isDrawingMode = true;
    newBrush.color = fabricCanvas.current.freeDrawingBrush.color;
    newBrush.width = fabricCanvas.current.freeDrawingBrush.width;
    fabricCanvas.current.freeDrawingBrush = newBrush;
    freeDrawingBrush.current = newBrush;
    console.log(newBrush instanceof CenteredPencilBrush);
  };

  // ANIMACAO PARA APARECER TLM EDITZONE
  useEffect(() => {
    if (!preview && editingComponent.current) {
      setShowEditZone(true); // Triggers the sidebar to show
    } else {
      setShowEditZone(false); // Triggers the sidebar to hide
    }
  }, [preview, editingComponent.current]);

  //BROWSER ADJUSTMENTS///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  useEffect(() => {
    const userAgent = window.navigator.userAgent;
    const isChrome =
      /Chrome/.test(userAgent) && /Google Inc/.test(navigator.vendor);
    const isSafari = /Safari/.test(userAgent) && !isChrome;

    if (isSafari) {
      setCanvasSize(512);
      if (window.innerWidth > 715) {
        setDrawCanvasSize((window.innerWidth * 0.4) / 512);
      } else setDrawCanvasSize(window.innerWidth / 512);
    } else {
      setCanvasSize(1024);
      if (window.innerWidth > 715) {
        setDrawCanvasSize((window.innerWidth * 0.4) / 1024);
      } else setDrawCanvasSize(window.innerWidth / 1024);
    }

    const updateWindowWidth = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    };

    updateWindowWidth();

    isDrawingRef.current = false;

    window.addEventListener("resize", updateWindowWidth);

    return () => {
      window.removeEventListener("resize", updateWindowWidth);
    };
  }, []);

  //IMAGE URL///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  useEffect(() => {
    if (activeObject && activeObject instanceof fabric.Image) {
      const imageSrc = activeObject.getSrc();
      setImageSrc(imageSrc);
      imageEditorTab();
    } else if (activeObject && activeObject instanceof fabric.Textbox) {
      textEditorTab();
    }
  }, [activeObject]);

  //LOAD CANVAS///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  useEffect(() => {
    fabricCanvas.current = new fabric.Canvas("fabric-canvas", {
      width: canvasSize,
      height: canvasSize,
      backgroundColor: "#fff",
    });

    fabricCanvas.current.freeDrawingBrush.color = "#000000";
    fabricCanvas.current.freeDrawingBrush.width = 10;
    fabricCanvas.current.perPixelTargetFind = true;

    const texture = new THREE.CanvasTexture(fabricCanvas.current.lowerCanvasEl);
    texture.flipY = false;
    texture.colorSpace = THREE.SRGBColorSpace;

    setFabricTexture(texture);

    return () => fabricCanvas.current.dispose();
  }, [canvasSize]);

  // DRAWING MODE
  // const handleDrawingMode = () => {
  //   if (!isDrawingMode) {
  //     if (canvasDrawingRef.current) canvasDrawingRef.current.style.scale = 1.4;
  //   }
  // };

  //MAIN USEEFFECT///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  useEffect(() => {
    if (!fabricTexture) return;

    //CREATE SCENE
    const sceneLayout = createSceneLayout();
    const scene = sceneLayout.scene;
    sceneRef.current = scene;
    const renderer = sceneLayout.renderer;
    const camera = sceneLayout.camera;
    orbit = sceneLayout.orbit;
    containerRef.current.appendChild(renderer.domElement);

    const url =
      model == 1
        ? "/glbs/meshes/hoodie11.glb"
        : model == 2
        ? "/final-tshirt.glb"
        : null;

    if (
      model == 1 ||
      model == 2 ||
      model == 3 ||
      model == 4 ||
      model == 5 ||
      model == 6
    )
      loadGLBModel(url, scene, setIsLoading, renderer, () => {});

    const animate = () => {
      requestAnimationFrame(animate);
      TWEEN.update();
      orbit.update();

      renderer.render(scene, camera);
    };
    animate();

    //FUNCTIONS//////////////////////////////////////////////////////////////////////////
    function onWindowResize(x) {
      camera.aspect =
        x == "w"
          ? window.innerWidth / window.innerHeight
          : containerRef.current.style.width /
            containerRef.current.style.height;
      camera.updateProjectionMatrix();
      x == "w"
        ? renderer.setSize(window.innerWidth, window.innerHeight)
        : renderer.setSize(
            containerRef.current.style.width,
            containerRef.current.style.width
          );

      fabricCanvasRef.current.style.transitionDelay = "0s";

      setDrawCanvasSize(
        window.innerWidth > 715
          ? (window.innerWidth * 0.4) / canvasSize
          : window.innerWidth / canvasSize
      );
      setWindowHeight(window.innerHeight);
      setWindowWidth(window.innerWidth);
    }

    //ACTIONS////////////////////////////////////////////////////////////////////////////
    function onMouseDown(e) {
      let numberOfFbricTextures = 0;
      scene.children.forEach((child) => {
        if (child instanceof THREE.Group) {
          child.children.forEach((mesh) => {
            if (mesh.material.map == fabricTexture) numberOfFbricTextures += 1;
          });
        }
      });

      const isTouchEvent = e.type.includes("touch");
      const x = isTouchEvent ? e.touches[0].clientX : e.clientX;
      const y = isTouchEvent ? e.touches[0].clientY : e.clientY;

      const diferenceWidth = window.innerWidth / 2;

      const offsetX = containerRef.current.getBoundingClientRect().left;

      initialMouse = new THREE.Vector2(
        ((x - offsetX) / window.innerWidth) * 2 - 1,
        -(y / window.innerHeight) * 2 + 1
      );
      const intersections = getIntersections(
        raycaster,
        camera,
        scene,
        initialMouse
      );

      //INTERSETA
      if (intersections.length > 0) {
        //orbit.enabled = false;
        const intersectionResult = intersections[0];
        const clickedMesh = intersectionResult.object;
        selectedMesh.current = clickedMesh;

        scene.children.forEach((child) => {
          if (child instanceof THREE.Group) {
            child.children.forEach((mesh) => {
              mesh.material.emissive.setRGB(0, 0, 0);
            });
          }
        });

        let animate = false;
        //EXISTE EDITING COMPONENT ATIVO
        if (
          editingComponent.current &&
          editingComponent.current != clickedMesh
        ) {
          storeCanvasAndTexture(
            editingComponent,
            fabricCanvas.current,
            canvasSize
          );

          closeAllTabs();

          animate = true;
          setEditingComponent(
            clickedMesh,
            fabricTexture,
            fabricCanvas,
            updateTexture,
            setEditingComponentName,
            animate,
            canvasSize
          );
        }
        if (!editingComponent.current) {
          animate = true;
          setEditingComponent(
            clickedMesh,
            fabricTexture,
            fabricCanvas,
            updateTexture,
            setEditingComponentName,
            animate,
            canvasSize
          );
        }

        //setTimeout(() => {
        selectImageResult = selectImage(
          intersectionResult,
          previousUVCursor,
          previousMouse,
          fabricCanvas,
          objectRotation,
          initialUVCursor,
          updateTexture,
          canvasSize,
          originalLeft,
          originalTop,
          originalOCoords
        );
        const selectedObject = fabricCanvas.current.getActiveObject();

        if (selectedObject) {
          isDragging = true;
          orbit.enabled = false;
          objectRotation.current = selectedObject.angle;
          initialAngle = selectedObject.angle;
          setActiveObject(selectedObject);
          textBoxWidth = selectedObject.width;

          if (selectedObject instanceof fabric.Image) {
            imageEditorTab();
          } else if (selectedObject instanceof fabric.Textbox) {
            setTimeout(() => {
              textEditorTab();
            }, 800);
          }
        } else {
          setTimeout(() => {
            setActiveObject(null);
            editZoneRefChild.current.style.opacity = "1";
            setForceClose(true);
            closeAllTabs();
          }, 100);
        }
        if (!isDrawingRef.current) openEditor();
        //}, 10);

        //NÃO INTERSETA
      } else {
        selectedMesh.current = !isDrawingRef.current
          ? null
          : editingComponent.current;
        if (editingComponent.current && !isDrawingRef.current)
          storeCanvasAndTexture(
            editingComponent,
            fabricCanvas.current,
            canvasSize
          );
        closeEditor();
        if (!isDrawingRef.current) {
          editingComponent.current = null;
          fabricCanvas.current.discardActiveObject();
          setActiveObject(null);
          fabricCanvas.current.renderAll();
        }
        setShowEditZone(false);

        editZoneRefChild.current.style.opacity = "1";
      }

      editingComponent.current = selectedMesh.current;
    }

    const onMouseMove = (e) => {
      if (!isDragging) return;

      const x = e.clientX;
      const y = e.clientY;
      handleMove(x, y);
    };

    const onTouchMove = (e) => {
      if (e.touches.length > 0) {
        const x = e.touches[0].clientX;
        const y = e.touches[0].clientY;
        handleMove(x, y);
      }
    };

    const handleMove = (x, y) => {
      if (!isDragging || orbit.enabled) return;
      orbit.enabled = false;
      const offsetX = containerRef.current.getBoundingClientRect().left;

      scaleRotateMove(
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
        orbit,
        offsetX
      );
    };

    function onMouseUp(e) {
      isDragging = false;
      orbit.enabled = true;
      isMouseOutsideModel.current = false;
      fabricCanvas.current.forEachObject((obj, index) => {
        if (obj.selectable == false) {
          fabricCanvas.current.remove(obj);
        }
      });
      fabricCanvas.current.renderAll();
      updateTexture();
    }

    //LISTENERS////////////////////////////////////////////////////////////////////////////
    window.addEventListener("resize", () => onWindowResize("w"));
    containerRef.current.addEventListener("resize", () => onWindowResize("c"));
    containerRef.current.addEventListener("mousedown", onMouseDown);
    containerRef.current.addEventListener("mousemove", onMouseMove);
    containerRef.current.addEventListener("mouseup", onMouseUp);
    containerRef.current.addEventListener("touchstart", onMouseDown, {
      passive: true,
    });
    containerRef.current.addEventListener("touchmove", onTouchMove, {
      passive: true,
    });
    containerRef.current.addEventListener("touchend", onMouseUp, {
      passive: true,
    });

    fabricCanvas.current.on("path:created", (e) => {
      lastPath.current = e.path;
      console.log(e.path);
      let path = e.path;
      previousDrawnPath.current.push(path);
      setActiveObject(e.path);
      fabricCanvas.current.renderAll();
      updateTexture();
    });

    function isInputActive() {
      const activeElement = document.activeElement;
      return (
        activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA" ||
          activeElement.tagName === "SELECT" ||
          activeElement.isContentEditable)
      );
    }

    document.addEventListener("keydown", function (event) {
      // Check if 'Ctrl' key is pressed and 'Z' key is pressed
      if ((event.ctrlKey || event.metaKey) && event.key === "z") {
        event.preventDefault(); // Prevent the default browser action (optional)
        // Your code to handle 'Ctrl+Z' here

        if (isDrawingRef.current) undo();
      }

      if (event.key === "Backspace" || event.key === "Delete") {
        if (!isInputActive()) {
          console.log("puu");
          const activeObjects = fabricCanvas.current.getActiveObjects();
          activeObjects.forEach((object) => {
            fabricCanvas.current.remove(object);
            setActiveObject(null);
            closeAllTabs();
            fabricCanvas.current.renderAll();
            updateTexture();
          });
        }
      }
    });

    /*fabricCanvas.current.on("object:modified", (e) => {
      const activeObj = e.target;
      if (
        activeObj instanceof fabric.Image ||
        activeObj instanceof fabric.Path
      ) {
        const minSide = Math.min(
          activeObj.width * activeObj.scaleX,
          activeObj.height * activeObj.scaleY
        );
        let tolerance = minSide / 10;
        if (tolerance < canvasSize / 100) tolerance = canvasSize / 100;
        activeObj.set({
          cornerSize: tolerance,
          rotatingPointOffset:
            (activeObj.height * activeObj.scaleY) / 2 + tolerance,
        });
        const originalControl = fabric.Object.prototype.controls.mtr;
        fabric.Object.prototype.controls.mtr = new fabric.Control({
          x: 0,
          y: 0,
          offsetY:
            -((activeObj.height * activeObj.scaleY) / 2) -
            (activeObj.width * activeObj.scaleX +
              activeObj.height * activeObj.scaleY) /
              20,
          actionHandler: originalControl.actionHandler,
          withConnection: true,
          actionName: "rotate",
        });
      }
    });*/

    return () => {
      renderer.domElement.remove();
      renderer.dispose();
      window.removeEventListener("resize", () => onWindowResize("w"));
      if (containerRef.current) {
        containerRef.current.removeEventListener("mousedown", onMouseDown);
        containerRef.current.removeEventListener("mousemove", onMouseMove);
        containerRef.current.removeEventListener("mouseup", onMouseUp);
        containerRef.current.removeEventListener("touchstart", onMouseDown);
        containerRef.current.removeEventListener("touchmove", onTouchMove);
        containerRef.current.removeEventListener("touchend", onMouseUp);
        containerRef.current.removeEventListener("resize", () =>
          onWindowResize("c")
        );
      }
    };
  }, [escolheBtn]);

  useEffect(() => {
    activeObjectRef.current = activeObject;
  }, [activeObject]);

  //FUNCTIONS///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  const updateTexture = () => {
    if (fabricTexture) fabricTexture.needsUpdate = true;
  };

  const openEditor = () => {
    setForceClose(false);
    if (editZoneRef.current) {
      setTimeout(() => {
        editZoneRef.current.style.right = "50px";
        editZoneRef.current.style.opacity = 1;
        editZoneRef.current.style.scale = 1;
        editZoneRef.current.style.filter = "none";
        editZoneRef.current.style.top = "110px";
        editZoneRef.current.style.scale = 1;
        const newHeight =
          100 +
          100 *
            (editZoneRef.current.children[1].children[0].children.length - 1);
      }, 10);
    }
  };

  const closeEditor = () => {
    closeAllTabs();
    setTimeout(() => {
      setForceClose(true);
    }, 100);

    if (editZoneRef.current) {
      editZoneRefChild.current.style.opacity = "1";
      editZoneRef.current.style.right = "-300px";
      editZoneRef.current.style.scale = 0;
      editZoneRef.current.style.opacity = 0;
      editZoneRef.current.style.filter = "blur(25px)";
      editZoneRef.current.style.top = "150px";
    }
  };

  const closeAllTabs = () => {
    closeColorEditor();
    closeImageEditor();
    closeTextEditor();
  };

  const colorEditorTab = () => {
    setForceClose(false);
    setColorEditor(true);
    setTextEditor(false);
    setImageEditor(false);
    editZoneRefChild.current.style.opacity = "0";
    editZoneRefChild.current.style.transition =
      "all 0.1s cubic-bezier(0.1, 0.7, 0.0, 1.0)";
  };

  const imageEditorTab = () => {
    setForceClose(false);
    setColorEditor(false);
    setTextEditor(false);
    setImageEditor(true);
    editZoneRefChild.current.style.opacity = "0";
    editZoneRefChild.current.style.transition =
      "opacity 0.1s cubic-bezier(0.1, 0.7, 0.0, 1.0)";
  };

  const textEditorTab = () => {
    setForceClose(false);
    setColorEditor(false);
    setTimeout(() => {
      setTextEditor(true);
    }, 50);

    editZoneRefChild.current.style.opacity = "0";
  };

  const closeColorEditor = () => {
    setColorEditor(false);
    fabricCanvas.current.discardActiveObject();
    fabricCanvas.current.renderAll();
    updateTexture();
    setActiveObject(null);
    editZoneRefChild.current.style.opacity = 1;
  };

  const closeTextEditor = () => {
    setTextEditor(false);
    fabricCanvas.current.discardActiveObject();
    fabricCanvas.current.renderAll();
    updateTexture();
    setActiveObject(null);
    editZoneRefChild.current.style.opacity = 1;
  };

  const closeImageEditor = () => {
    setImageEditor(false);
    fabricCanvas.current.discardActiveObject();
    fabricCanvas.current.renderAll();
    updateTexture();
    setActiveObject(null);
    editZoneRefChild.current.style.opacity = 1;
  };

  const handleBGColorChange = (color) => {
    setBGColor(color, editingComponent, fabricCanvas, updateTexture);
  };

  const handelUploadImage = (e) => {
    uploadImage(
      e,
      editingComponent,
      fabricCanvas,
      updateTexture,
      canvasSize,
      canvasSize
    );
    setTimeout(() => {
      setActiveObject(fabricCanvas.current.getActiveObject());
      imageEditorTab();
      setInputImage("");
    }, 100);
  };

  const handleAddTextBox = (text) => {
    addTextbox(
      text,
      fabricCanvas,
      updateTexture,
      editingComponent,
      fontSize,
      fontFamily,
      fillColor,
      textAlign,
      setActiveObject,
      canvasSize
    );
    fabricCanvas.current.getActiveObject();
  };

  const handleIndirectUpload = (e) => {
    uploadImage(e, editingComponent, fabricCanvas, updateTexture, canvasSize);
    setTimeout(() => {
      setInputImage("");
      const selectedObject = fabricCanvas.current.getActiveObject();
      setActiveObject(selectedObject);
      imageEditorTab();
    }, 100);
  };

  const handleFileUpload = () => {
    let upload = true;
    fabricCanvas.current._objects.forEach((object) => {
      if (object instanceof fabric.Image) {
        upload = false;
      }
    });
    if (upload) {
      document.getElementById("fileInput").click();
    } else imageEditorTab();
  };

  const handleChange = (e) => {
    setClientData({
      ...clientData,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(() => {
    isDrawingRef.current = isDrawingMode;
  }, [isDrawingMode]);

  const undo = () => {
    if (isDrawingRef) {
      const lastIndex = previousDrawnPath.current.length - 1;
      const lastPath = previousDrawnPath.current[lastIndex];
      previousDrawnPath.current.pop();
      fabricCanvas.current.remove(lastPath);
      fabricCanvas.current.renderAll();
      updateTexture();
    }
  };

  return (
    <>
      {isLoading && (
        <div className={styles.loadingContainer}>
          <p>A carregar...</p>
        </div>
      )}
      <div
        style={{
          width: "100%",
          height: "100%",
          marginRight: isDrawingMode ? "50%" : 0,
          transition: "all 0.7s cubic-bezier(0.4, 0.0, 0.6, 1.0)",
        }}
        ref={containerRef}
      />
      <>
        <div ref={editZoneRef} className={styles.editZone} style={editorStyle}>
          <div className={styles.nameZone}>
            <button onClick={closeEditor} className={styles.fileUploadLabeal}>
              <p
                style={{
                  marginTop: -14,
                  fontSize: 12.5,
                  fontFamily: "Arial",
                  color: "#ed2828aa",
                  fontWeight: "1000",
                  alignSelf: "center",
                  justifyContent: "center",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                &#10005;
              </p>
            </button>
            <div>
              <p className={styles.trititle}>
                A Costumizar{" "}
                <b className={styles.subtitle}>
                  {editingComponent.current
                    ? getPartName(editingComponent.current.name)
                    : ""}
                </b>
              </p>
            </div>

            <button
              className={styles.fileUploadLabeal}
              style={{ opacity: 0 }}
            />
          </div>

          <div className={styles.editHeader} ref={editZoneRefChild}>
            <div>
              {editingComponentName.includes("COR") ? (
                <button
                  onClick={colorEditorTab}
                  className={styles.divAreaEspecifica}
                  style={{ borderWidth: 0 }}
                >
                  <div className={styles.divIcon}>
                    <NextImage
                      src={colorIcon}
                      width={20}
                      height={20}
                      alt="step"
                    />
                  </div>
                  <div>
                    <p className={styles.titleText}>Cor</p>
                    <p className={styles.infoText}>
                      Dá um toque final ao teu produto.
                    </p>
                  </div>
                </button>
              ) : (
                <>
                  {editingComponentName.includes("MIX") ? (
                    <>
                      <button
                        onClick={handleFileUpload}
                        className={styles.divAreaEspecifica}
                      >
                        <div className={styles.divIcon}>
                          <NextImage
                            src={galeryIcon}
                            width={20}
                            height={20}
                            alt="step"
                          />
                        </div>
                        <div>
                          <p className={styles.titleText}>Imagem</p>
                          <p className={styles.infoText}>
                            Remover cores e alterar os atributos.
                          </p>
                        </div>
                      </button>

                      <input
                        type="file"
                        id="fileInput"
                        style={{ display: "none" }}
                        value={inputImage}
                        onChange={handleIndirectUpload}
                      />
                      <button
                        onClick={textEditorTab}
                        className={styles.divAreaEspecifica}
                      >
                        <div className={styles.divIcon}>
                          <NextImage
                            src={textIcon}
                            width={20}
                            height={20}
                            alt="step"
                          />
                        </div>
                        <div>
                          <p className={styles.titleText}>Texto</p>
                          <p className={styles.infoText}>
                            Cor, fontes, tamanhos e alinhamentos.
                          </p>
                        </div>
                      </button>
                      <button
                        onClick={colorEditorTab}
                        className={styles.divAreaEspecifica}
                      >
                        <div className={styles.divIcon}>
                          <NextImage
                            src={colorIcon}
                            width={20}
                            height={20}
                            alt="step"
                          />
                        </div>
                        <div>
                          <p className={styles.titleText}>Cor</p>
                          <p className={styles.infoText}>
                            Dá um toque final ao teu produto.
                          </p>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setIsDrawingMode(true);
                          closeEditor();
                        }}
                        className={styles.divAreaEspecifica}
                        style={{ borderWidth: 0 }}
                      >
                        <div className={styles.divIcon}>
                          <NextImage
                            src={desenhaIcon}
                            width={20}
                            height={20}
                            alt="step"
                          />
                        </div>
                        <div>
                          <p className={styles.titleText}>Desenha</p>
                          <p className={styles.infoText}>
                            Dá os teus toques especiais de artista.
                          </p>
                        </div>
                      </button>
                    </>
                  ) : (
                    <>
                      {editingComponentName.includes("IMP") && (
                        <>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImage}
                            style={{
                              padding: "50px",
                              backgroundColor: "#234567",
                              position: "absolute",
                              top: "100px",
                            }}
                          />
                        </>
                      )}
                    </>
                  )}
                  {editingComponentName.includes("NOT") && (
                    <p
                      style={{ marginTop: 75, textAlign: "center" }}
                      className={styles.infoText}
                    >
                      Não é possível personalizar esta área
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <div
          style={{
            opacity: isDrawingMode ? 1 : 1,
            /*right: isDrawingMode
              ? windowWidth < 750
                ? 0
                : `-80px`
              : windowWidth < 750
              ? 0
              : 10000,*/
            transitionDelay: isDrawingMode ? "2.05s" : "0s",
            width: canvasSize,
            height: canvasSize,
            zIndex:
              windowWidth < 750
                ? !isDrawingMode
                  ? -1
                  : 10000000000
                : 10000000000,
            transform:
              windowWidth > 715
                ? windowWidth > 900
                  ? `scale(${drawCanvasSize})`
                  : `scale(${drawCanvasSize * 0.8})`
                : `scale(${(windowWidth * 0.95) / canvasSize})`,
            marginLeft: isDrawingMode
              ? windowWidth > 715
                ? "56.5vw"
                : 0
              : "10000px",
          }}
          ref={fabricCanvasRef}
          className={styles.canvasDrawingContainer}
        >
          <canvas
            id="fabric-canvas"
            className={styles.canvasDrawing}
            style={{
              width: "100%",
            }}
          />
        </div>

        {isDrawingMode && (
          <>
            <div className={styles.paintingBoard}>
              <div className={styles.headerOptions}>
                <header className={styles.xIconUndo}>
                  <h1
                    onClick={() => {
                      setIsDrawingMode(false);
                    }}
                    className={styles.xIcon}
                  >
                    &#10005;
                  </h1>
                  <button className={styles.drawingButtonUndo} onClick={undo}>
                    <NextImage
                      width={20}
                      height={20}
                      src={arrowBack}
                      alt="Step"
                    />
                  </button>
                </header>
                <input
                  className={styles.scaleInput}
                  type="range"
                  min="1"
                  max="50"
                  defaultValue="10"
                  onChange={(e) => handleBrushSizeChange(e.target.value)}
                />
              </div>

              <div className={styles.canvasBrushesZone}>
                <div className={styles.firstBtns}>
                  <button
                    className={styles.drawingButton}
                    onClick={() => setBrushType("cursor")}
                    style={{
                      backgroundColor:
                        cursorType == "cursor" ? "#000" : "#f2f2f2",
                    }}
                  >
                    <NextImage
                      alt="Step"
                      width={20}
                      height={20}
                      src={mouse}
                      style={{
                        filter: cursorType == "cursor" ? "invert()" : "none",
                      }}
                    />
                  </button>
                  <button
                    className={styles.drawingButton}
                    onClick={() => setBrushType("pencil")}
                    style={{
                      backgroundColor:
                        cursorType == "pencil" ? "#000" : "#f2f2f2",
                    }}
                  >
                    <NextImage
                      alt="Step"
                      width={25}
                      height={25}
                      src={desenhaIcon}
                      style={{
                        filter: cursorType == "pencil" ? "invert()" : "none",
                      }}
                    />
                  </button>
                  <button
                    className={styles.drawingButton}
                    onClick={() => setBrushType("spray")}
                    style={{
                      backgroundColor:
                        cursorType == "spray" ? "#000" : "#f2f2f2",
                    }}
                  >
                    <NextImage
                      alt="Step"
                      width={20}
                      height={20}
                      src={spray}
                      style={{
                        filter: cursorType == "spray" ? "invert()" : "none",
                      }}
                    />
                  </button>

                  {/* <button
                    className={styles.drawingButton}
                    onClick={removePathFromCanvas}
                  >
                    <NextImage
                      alt="Step"
                      width={20}
                      height={20}
                      src={arrowBack}
                    />
                  </button> */}
                  <div className={styles.paleteDeCoresDrawing}>
                    {Object.values(colors).map((color, index) => (
                      <button
                        key={index}
                        style={{ backgroundColor: color }}
                        className={styles.paleteCorBtn}
                        onClick={() => setBrushColor(color)}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ height: 50 }}></div>
            </div>
            <div className={styles.paintingBoard2}></div>
            <div className={styles.paintingBoard3}></div>
            <div className={styles.paintingBoard4}></div>
            <div className={styles.paintingBoard5}></div>
            <div className={styles.paintingBoard6}></div>
            <div className={styles.paintingBoard7}></div>
            <div className={styles.paintingBoard8}></div>
            <div className={styles.paintingBoard9}></div>
            <div className={styles.paintingBoard10}></div>
            <div className={styles.paintingBoard11}></div>
            <div className={styles.paintingBoard12}></div>
            <div className={styles.paintingBoard13}></div>
            <div className={styles.paintingBoard14}></div>
            <div className={styles.paintingBoard15}></div>
            <div className={styles.paintingBoard16}></div>
            <div className={styles.paintingBoard17}></div>
            <div className={styles.paintingBoard18}></div>
            <div className={styles.paintingBoard19}></div>
          </>
        )}

        {!preview && editingComponent.current && (
          <div
            style={{ right: showEditZone ? "11px" : "-75px" }}
            className={styles.editZoneTlm}
          >
            <div className={styles.mainBtns}>
              <button onClick={handleFileUpload}>
                <NextImage src={galeryIcon} width={20} height={20} />
              </button>
              <button onClick={textEditorTab}>
                <NextImage src={textIcon} width={20} height={20} />
              </button>
              <button onClick={colorEditorTab}>
                <NextImage src={colorIcon} width={20} height={20} />
              </button>
              <button
                onClick={() => {
                  setIsDrawingMode(true);
                  closeEditor();
                }}
              >
                <NextImage src={desenhaIcon} width={20} height={20} />
              </button>
            </div>
          </div>
        )}
      </>
      {success == false && (
        <>
          <div className={styles.priceBtnMain}>
            {preview && (
              <button
                className={styles.priceBtn}
                style={{
                  opacity: nextStep ? "1" : "0.5",
                  pointerEvents: nextStep ? "auto" : "none",
                }}
                onClick={() => {
                  nextStep &&
                    (setSuccess(true),
                    sendData(allCanvasData, docId, clientData));
                }}
              >
                {nextStep ? "Continuar" : "Aguarde"}
              </button>
            )}
          </div>

          <div className={styles.exportBtnNot}>
            <button
              onClick={() => {
                if (editingComponent.current) {
                  storeCanvasAndTexture(
                    editingComponent,
                    fabricCanvas.current,
                    canvasSize
                  );
                }
                setIsDrawingMode(false);
                getActiveScene(
                  setDocId,
                  setAllCanvasData,
                  clientData,
                  model,
                  sceneRef
                );
                calculateArea(sceneRef, setAnimatedPrice);
                setPreview(!preview);
                setTimeout(() => {
                  closeEditor();
                }, 200);
                closeAllTabs();
              }}
              style={buttonStyle}
            >
              {preview ? (
                windowWidth < 715 ? (
                  <p
                    style={{
                      color: "#000",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    &#8592;
                  </p>
                ) : (
                  <p
                    style={{
                      color: "#666",
                      marginTop: 7.5,
                      letterSpacing: -0.6,
                      fontFamily: "Inter",
                    }}
                  >
                    Voltar à personalização
                  </p>
                )
              ) : windowWidth < 715 ? (
                "->"
              ) : (
                "Concluído"
              )}
            </button>
          </div>
        </>
      )}

      {colorEditor && (
        <ColorEditor
          handleBGColorChange={handleBGColorChange}
          closeEditor={closeColorEditor}
          editingComponent={editingComponent}
          editZoneRef={editZoneRef}
          editZoneRefChild={editZoneRefChild}
          forceClose={forceClose}
        />
      )}

      {imageEditor && (
        <ImageEditor
          fabricCanvas={fabricCanvas}
          updateTexture={updateTexture}
          closeImageEditor={closeImageEditor}
          activeObject={activeObject}
          uploadImage={handelUploadImage}
          setImageSrc={setImageSrc}
          imageSrc={imageSrc}
          editZoneRef={editZoneRef}
          editZoneRefChild={editZoneRefChild}
          editingComponent={editingComponent}
          forceClose={forceClose}
          setActiveObject={setActiveObject}
          inputImage={inputImage}
          setInputImage={setInputImage}
        />
      )}

      {textEditor && (
        <TextEditor
          fabricCanvas={fabricCanvas}
          updateTexture={updateTexture}
          closeTabs={closeTextEditor}
          addTextbox={handleAddTextBox}
          fontFamily={fontFamily}
          setFontFamily={setFontFamily}
          activeObject={activeObject}
          fontSize={fontSize}
          setFontSize={setFontSize}
          textAlign={textAlign}
          setTextAlign={setTextAlign}
          fillColor={fillColor}
          setFillColor={setFillColor}
          editingComponent={editingComponent}
          editZoneRefChild={editZoneRefChild}
          editZoneRef={editZoneRef}
          forceClose={forceClose}
          setActiveObject={setActiveObject}
          canvasSize={canvasSize}
          setActiveText={setActiveText}
        />
      )}

      {escolheBtn == false && (
        <div ref={backgroundMagic} className={styles.modelsZone}>
          <div ref={modelosZone} className={styles.modelsList}>
            <h1 ref={titleModels} className={styles.title}>
              {windowWidth > 715 ? (
                <b>Escolhe o teu modelo</b>
              ) : (
                <b>
                  Escolhe <br></br>o teu<br></br> modelo
                </b>
              )}
            </h1>
            <div ref={modelos} className={styles.modelosBtns}>
              <button
                className={styles.modeloBtn}
                onClick={() => {
                  setModel("1");
                  magicLoading(backgroundMagic, modelos, titleModels);
                  setTimeout(() => {
                    setEscolheBtn(true);
                  }, 800);
                }}
              >
                <NextImage
                  src={model1}
                  className={styles.modelosImgs}
                  width={150}
                  height={150}
                />
              </button>

              <button
                className={styles.modeloBtn}
                onClick={() => {
                  setModel("6");
                  magicLoading(backgroundMagic, modelos, titleModels);
                  setTimeout(() => {
                    setEscolheBtn(true);
                  }, 800);
                }}
              >
                <NextImage
                  src={tshirt}
                  className={styles.modelosImgs}
                  width={150}
                  height={150}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {preview == true && (
        <div className={styles.checkoutZone}>
          {success === false ? (
            <>
              <div className={styles.modelsList}>
                <p
                  className={styles.subtitle}
                  style={{
                    textAlign: "center",
                    fontSize: 15,
                  }}
                >
                  PREÇO TOTAL ESTIMADO (POR UN.)
                </p>

                <h1
                  id="precoFinal"
                  className={styles.title}
                  style={{
                    textAlign: "center",
                    marginBottom: 15,
                    fontSize: 100,
                    color: "#fff",
                    fontWeight: 800,
                    letterSpacing: -3.2,
                    marginTop: -15,
                    marginLeft: 0,
                  }}
                >
                  €{animatedPrice}
                </h1>
              </div>

              <div className={styles.inputsFormMain}>
                <h1
                  className={styles.subtitle}
                  style={{
                    textAlign: "center",
                    fontSize: 15,
                    color: "#8c8c8c",
                  }}
                >
                  INFORMAÇÕES DE ENVIO
                </h1>
                <div className={styles.inputsForm}>
                  <input
                    className={styles.inputForm}
                    placeholder="Nome"
                    name="name"
                    value={clientData.name}
                    onChange={handleChange}
                  />
                  <input
                    className={styles.inputForm}
                    placeholder="Email"
                    name="email"
                    value={clientData.email}
                    onChange={handleChange}
                  />
                  <input
                    className={styles.inputForm}
                    placeholder="Telemóvel"
                    name="phone"
                    value={clientData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className={styles.successOrderMain}>
                <h1 className={styles.successOrderText}>
                  Personalização submetida com sucesso
                </h1>
                {/* <p
                  style={{ marginTop: -10, marginBottom: 35 }}
                  className={styles.successOrderSubText}
                >
                  Iremos entrar em contacto consigo muito brevemente
                </p> */}
                <div className={styles.finalBtns}>
                  {docId != "" ? (
                    <button
                      className={styles.btnPreviewLink}
                      onClick={() => router.push(`/visualize/${docId}`)}
                      target={"_blank"}
                    >
                      <NextImage src={shareIcon} width={20} height={20} />
                      <p>Abrir link de pré-visualização</p>
                    </button>
                  ) : (
                    <button className={styles.btnBuildLink}>
                      <NextImage src={buildingIcon} width={20} height={20} />
                      <p>A criar o teu link de pré-visualização</p>
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default ThreeDViewer;
