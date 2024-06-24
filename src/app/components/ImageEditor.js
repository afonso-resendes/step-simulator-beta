//REACT IMPORTS
import React, {
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useState,
} from "react";
import NextImage from "next/image";

//STYLES
import styles from "../../styles/imageeditor.module.css";

//ICONS
import deleteIcon from "../../imgs/icons/binIcon.png";
import mirrorIcon from "../../imgs/icons/mirrorIcon.png";
import removeIcon from "../../imgs/icons/removeIcon.png";

const ImageEditor = forwardRef(
  (
    {
      closeImageEditor,
      fabricCanvas,
      updateTexture,
      activeObject,
      imageSrc,
      setImageSrc,
      uploadImage,
      editZoneRef,
      editingComponent,
      editZoneRefChild,
      forceClose,
      setActiveObject,
      inputImage,
      setInputImage,
    },
    ref
  ) => {
    //VARIABLES////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    const initialHeight = window.innerWidth <= 715 ? 140 : 292;
    const [heightWindow, setHeightWindow] = useState(initialHeight);
    const [picker, setPicker] = useState(false);
    const [removeBtn, setRemoveBtn] = useState(true);
    const [deleteBtn, setDeleteBtn] = useState(false);

    const [opacityHint, setOpacityHint] = useState(1);
    const [opacityHintText, setOpacityHintText] = useState(1);
    const [widthHint, setWidthHint] = useState(190);
    const [displayHint, setDisplayHint] = useState("flex");
    const [fontHint, setFontHint] = useState(12);

    const [colorToRemove, setColorToRemove] = useState(null);
    const canvasRef = useRef(null);

    const [showCanvas, setShowCanvas] = useState(false);

    const [windowCanvas, setWindowCanvas] = useState(0);

    const imgRef = useRef(new Image());

    const editZoneImgRef = useRef();

    //FUNCTIONS///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    const handleRemoverCor = () => {
      setPicker(true);
      setShowCanvas(true);
      loadImageOnCanvas();
      setHeightWindow(window.innerWidth < 715 ? window.innerHeight * 0.8 : 450);
      editZoneRef.current.style.height = `450px`;
      /*editZoneRef.current.style.transition =
        "all 0.3s cubic-bezier(0.1, 0.7, 0.0, 1.0)";*/
      editZoneImgRef.current.style.height = `450px`;
      editZoneImgRef.current.style.transition = "all 0.3s ease-in-out";
    };

    const handleFlipH = () => {
      if (fabricCanvas.current.getActiveObject()) {
        const obj = fabricCanvas.current.getActiveObject();
        obj.set({
          flipX: !obj.flipX,
        });
        fabricCanvas.current.renderAll();
        updateTexture();
      }
    };

    const handleDelete = () => {
      setDeleteBtn(!deleteBtn);
      if (fabricCanvas.current && activeObject) {
        fabricCanvas.current.remove(activeObject);
        fabricCanvas.current.discardActiveObject();
        fabricCanvas.current.renderAll();
        updateTexture();
        closeImageEditor();
        setActiveObject(null);
        handleCloseImageEditor();
      }
    };

    const handleHoverHint = () => {
      setOpacityHintText(0);

      setTimeout(() => {
        setOpacityHint(0);
        setWidthHint(0);
      }, 400);
    };

    const handleLeaveHint = () => {
      setTimeout(() => {
        setOpacityHint(1);
        setWidthHint(190);
        setOpacityHintText(1);
      }, 5000);
    };

    const removeColor = () => {
      if (!colorToRemove || !canvasRef.current) return;

      editZoneRef.current.style.height = "500px";
      /*editZoneRef.current.style.transition =
        "all 0.3s cubic-bezier(0.1, 0.7, 0.0, 1.0)";*/
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const [rToRemove, gToRemove, bToRemove] = colorToRemove
        .split(",")
        .map(Number);

      for (let i = 0; i < data.length; i += 4) {
        if (
          isWithinRange(data[i], rToRemove) &&
          isWithinRange(data[i + 1], gToRemove) &&
          isWithinRange(data[i + 2], bToRemove)
        ) {
          data[i + 3] = 0; // Torna o pixel transparente
        }
      }

      ctx.putImageData(imageData, 0, 0);
      const editedImageData = canvas.toDataURL();
      setImageSrc(editedImageData); // Atualiza a fonte da imagem com a imagem editada
      removeBgImgCanva(editedImageData);
    };

    const pickColor = (event) => {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const scaleX = imgRef.current.naturalWidth / rect.width; // Proporção de escala em X
      const scaleY = imgRef.current.naturalHeight / rect.height; // Proporção de escala em Y
      const x = (event.clientX - rect.left) * scaleX; // Coordenada X ajustada
      const y = (event.clientY - rect.top) * scaleY; // Coordenada Y ajustada

      const ctx = canvas.getContext("2d");
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      setColorToRemove(`${pixel[0]},${pixel[1]},${pixel[2]}`);
    };

    const loadImageOnCanvas = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        const img = imgRef.current;
        img.src = imageSrc;
        img.onload = () => {
          window.innerWidth > 715
            ? setWindowCanvas(311)
            : setWindowCanvas(window.innerWidth - 50);

          const canvasWidth = img.width;
          const aspectRatio = img.height / img.width;
          const canvasHeight = canvasWidth * aspectRatio;

          canvas.width = canvasWidth;
          canvas.height = canvasHeight;

          ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
        };
      }
    };

    const adjustHeight = () => {
      const newHeight = window.innerWidth <= 715 ? 150 : 292;
      setHeightWindow(newHeight);
    };

    const exportCanvasAsImage = () => {
      const originalBg = fabricCanvas.backgroundColor;
      fabricCanvas.backgroundColor = "#fff";
      fabricCanvas.renderAll();

      const dataURL = fabricCanvas.toDataURL({
        format: "png",
        quality: 1.0,
      });

      fabricCanvas.backgroundColor = originalBg;
      fabricCanvas.renderAll();

      return dataURL;
    };

    const isWithinRange = (value, target) => {
      const tolerance = 16.1;
      return value >= target - tolerance && value <= target + tolerance;
    };

    const removeBgImgCanva = (newImg) => {
      const canvas = fabricCanvas.current;

      if (activeObject && activeObject instanceof fabric.Image) {
        const originalProps = {
          left: activeObject.left,
          top: activeObject.top,
          angle: activeObject.angle,
          scaleX: activeObject.scaleX,
          scaleY: activeObject.scaleY,
          originX: "center",
          originY: "center",
          flipX: activeObject.flipX,
        };

        /*const existingImage = canvas
          .getObjects()
          .find((obj) => obj instanceof fabric.Image && obj !== activeObject);
        if (existingImage) {
          canvas.remove(existingImage);
        }*/

        fabric.Image.fromURL(newImg, (newImgObj) => {
          newImgObj.set({
            ...originalProps,
            width: newImgObj.width,
            height: newImgObj.height,
            scaleX: originalProps.scaleX,
            scaleY: originalProps.scaleY,
            cornerSize: 15,
            borderColor: "transparent",
            cornerColor: "rgba(0, 0, 0, 0.2)",
            transparentCorners: false,
            cornerStyle: "circle",
          });

          canvas.remove(activeObject);
          canvas.add(newImgObj);
          canvas.setActiveObject(newImgObj);
          canvas.renderAll();
          updateTexture();
        });
      }
    };

    const handleCloseImageEditor = () => {
      if (editZoneImgRef) {
        editZoneImgRef.current.style.opacity = 0;
        editZoneImgRef.current.style.scale = "0";
        editZoneImgRef.current.style.transition =
          "opacity 0.2s cubic-bezier(0.1, 0.1, 0.0, 1.0), scale 0.6s 0.2s cubic-bezier(0.4, 0.7, 0.0, 1.0)";
      }

      editZoneRefChild.current.style.opacity = "0";

      setTimeout(() => {
        closeImageEditor();
      }, 200);
    };

    //USE EFFECTS////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    useEffect(() => {
      if (ref) {
        ref.current = { exportCanvasAsImage };
      }
    }, [ref, exportCanvasAsImage]);

    useEffect(() => {
      loadImageOnCanvas();
      if (activeObject && activeObject.type == "image") setRemoveBtn(true);
    }, [activeObject]);

    useEffect(() => {
      if (showCanvas) {
        loadImageOnCanvas();
      }
    }, [showCanvas, imageSrc]);

    useEffect(() => {
      setTimeout(() => {
        if (editZoneImgRef) {
          editZoneImgRef.current.style.opacity = 1;
          editZoneImgRef.current.style.transition =
            "opacity 0.3s cubic-bezier(0.1, 0.1, 0.0, 1.0), scale 1s cubic-bezier(0.1, 0.7, -0.4, 1.0)";
        }
      }, 10);
      window.addEventListener("resize", adjustHeight);

      console.log(
        fabricCanvas.current._objects.filter(
          (obj) => obj instanceof fabric.Image
        ).length
      );

      return () => {
        window.removeEventListener("resize", adjustHeight);
      };
    }, []);

    useEffect(() => {
      console.log(forceClose);
      if (forceClose) {
        if (editZoneImgRef) {
          editZoneImgRef.current.style.opacity = 0;
          editZoneImgRef.current.style.transition =
            "opacity 0.2s cubic-bezier(0.1, 0.1, 0.0, 1.0), scale 0.6s 0.2s cubic-bezier(0.4, 0.7, 0.0, 1.0)";
        }

        editZoneRefChild.current.style.opacity = 1;
        console.log(forceClose);
      }
    }, [forceClose]);

    return (
      <div
        style={{
          height: !activeObject
            ? window.innerHeight > 715
              ? 65 +
                103.7 *
                  Math.floor(
                    (fabricCanvas.current._objects.filter(
                      (obj) => obj instanceof fabric.Image
                    ).length +
                      2) /
                      3
                  )
              : 150
            : 292,
          opacity: 0,
          maxHeight: "70vh",
          maskImage:
            !activeObject && window.innerHeight > 715
              ? "linear-gradient(to bottom, white 85%, transparent 98%)"
              : "linear-gradient(to right, white 85%, transparent 98%) linear-gradient(to left, white 85%, transparent 98%)",
          maskSize: !activeObject && "100% 100%",
        }}
        ref={editZoneImgRef}
        className={styles.editZoneImg}
      >
        <div className={styles.nameZone}>
          <button
            className={styles.fileUploadLabealBack}
            onClick={() => {
              picker
                ? (setPicker(false),
                  editZoneImgRef
                    ? (editZoneImgRef.current.style.height =
                        window.innerWidth < 715 ? "auto" : "292px")
                    : {})
                : activeObject
                ? (setActiveObject(null),
                  fabricCanvas.current.discardActiveObject(),
                  fabricCanvas.current.renderAll(),
                  updateTexture())
                : handleCloseImageEditor();
              setShowCanvas(false);
              /*editZoneRef.current.style.transition =
                "all 0.3s cubic-bezier(0.1, 0.7, 0.0, 1.0)";*/
            }}
          >
            <p
              style={{
                marginTop: window.innerWidth < 715 ? -13 : -15,
                justifyContent: "center",
                fontSize: 12,
                marginLeft: window.innerWidth < 715 ? -5 : -1,
                color: "#edc645",
                fontWeight: "1000",
              }}
            >
              &#8592;
            </p>
          </button>
          <p className={styles.trititle}>Editar Imagem</p>
          <label className={styles.fileUploadLabealAdd}>
            <p
              style={{
                marginTop: -13,
                marginLeft: -1,
                fontSize: 15,
                color: "#00bfff",
                fontWeight: "1000",
              }}
            >
              +
            </p>
            <input
              type="file"
              onChange={uploadImage}
              value={inputImage}
              style={{ display: "none" }}
            />
          </label>
        </div>

        <div className={styles.menuPicker}>
          {activeObject && activeObject instanceof fabric.Image ? (
            <>
              {!picker && (
                <>
                  <div className={styles.editImageMain}>
                    <div>
                      <button
                        className={styles.divAreaEspecifica}
                        style={{ borderWidth: 0 }}
                        onClick={handleRemoverCor}
                      >
                        <div className={styles.divIcon}>
                          <NextImage
                            src={removeIcon}
                            width={25}
                            height={25}
                            alt="step"
                          />
                        </div>
                        <div>
                          <p className={styles.titleText}>Remover Cor</p>
                          <p className={styles.infoText}>
                            Remove cores das tuas imagens.
                          </p>
                        </div>
                      </button>
                      <button
                        className={styles.divAreaEspecifica}
                        style={{ borderWidth: 0 }}
                        onClick={handleFlipH}
                      >
                        <div className={styles.divIcon}>
                          <NextImage
                            src={mirrorIcon}
                            width={25}
                            height={25}
                            alt="step"
                          />
                        </div>
                        <div>
                          <p className={styles.titleText}>Espelhar Imagem</p>
                          <p className={styles.infoText}>
                            Vê a tua imagem espelhada
                          </p>
                        </div>
                      </button>
                    </div>
                    <button
                      onClick={handleDelete}
                      className={styles.deleteButtonImage}
                    >
                      <NextImage src={deleteIcon} width={25} height={25} />
                    </button>
                  </div>

                  <div className={styles.editImageMainMobile}>
                    <button
                      className={styles.divAreaEspecifica}
                      style={{ borderWidth: 0 }}
                      onClick={handleRemoverCor}
                    >
                      <div className={styles.divIcon}>
                        <NextImage
                          src={removeIcon}
                          width={25}
                          height={25}
                          alt="step"
                        />
                      </div>
                    </button>
                    <button
                      className={styles.divAreaEspecifica}
                      style={{ borderWidth: 0 }}
                      onClick={handleFlipH}
                    >
                      <div className={styles.divIcon}>
                        <NextImage
                          src={mirrorIcon}
                          width={25}
                          height={25}
                          alt="step"
                        />
                      </div>
                    </button>
                    <button
                      className={styles.divAreaEspecifica}
                      style={{ borderWidth: 0 }}
                      onClick={handleDelete}
                    >
                      <div className={styles.divIcon}>
                        <NextImage
                          src={deleteIcon}
                          width={25}
                          height={25}
                          alt="step"
                        />
                      </div>
                    </button>
                  </div>
                </>
              )}
            </>
          ) : (
            <div
              style={{
                height:
                  103.7 *
                  Math.floor(
                    (fabricCanvas.current._objects.filter(
                      (obj) => obj instanceof fabric.Image
                    ).length +
                      2) /
                      3
                  ),
              }}
            >
              <input
                type="file"
                onChange={uploadImage}
                style={{
                  width: 311,
                  position: "absolute",
                  height: 380,
                  top: 0,
                  zIndex: -1,
                  opacity: 0,
                }}
              />
              <div
                style={{
                  height:
                    window.innerWidth > 715
                      ? !activeObject
                        ? 105.7 *
                          Math.floor(
                            (fabricCanvas.current._objects.filter(
                              (obj) => obj instanceof fabric.Image
                            ).length +
                              2) /
                              3
                          )
                        : 240
                      : 100,
                  width: window.innerWidth > 715 ? "auto" : "100vw",
                }}
                className={styles.imageList}
              >
                {fabricCanvas.current._objects.map((obj, index) => {
                  if (obj instanceof fabric.Image) {
                    return (
                      <div
                        className={styles.imageContainer}
                        key={index}
                        onClick={() => {
                          fabricCanvas.current.setActiveObject(obj);
                          fabricCanvas.current.renderAll();
                          updateTexture();
                          setActiveObject(obj);
                        }}
                      >
                        <NextImage
                          src={obj._element.currentSrc}
                          layout="fill"
                          objectFit="contain"
                          objectPosition="center"
                        />
                      </div>
                    );
                  } else {
                    <div className={styles.noText}>
                      <p className={styles.trititle}>
                        Selecione uma imagem para começar
                      </p>
                    </div>;
                  }
                })}
              </div>
            </div>
          )}

          <>
            {activeObject && picker && (
              <div>
                <div
                  style={{
                    opacity: opacityHint,
                    transition: "all 0.4s ease-in-out",
                    width: widthHint,
                    display: displayHint,
                  }}
                  className={styles.hintText}
                  onMouseOver={handleHoverHint}
                  onMouseLeave={handleLeaveHint}
                  onMouseUp={handleLeaveHint}
                >
                  <NextImage src={removeIcon} width={15} height={15} />
                  <p
                    style={{
                      color: "#333",
                      textAlign: "center",
                      opacity: opacityHintText,
                      fontSize: fontHint,
                      letterSpacing: -0.4,
                    }}
                    className={styles.trititle}
                  >
                    Clique em cima da cor
                  </p>
                </div>

                <div className={styles.bottomWindow}>
                  <button
                    style={{
                      backgroundColor: "#fff",
                      boxShadow: "0px 0px 35px rgba(0, 0, 0, 0.05)",
                    }}
                    className={styles.fecharBtn}
                    onClick={removeColor}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        alignSelf: "center",
                        textAlign: "center",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          backgroundColor: `rgb(${colorToRemove})`,
                          borderRadius: 100,
                          border: "1pxn solid #f2f2f2",
                          boxShadow: "0 0 15px rgba(0, 0, 0, 0.1)",
                        }}
                      ></div>
                      Remover Cor
                    </div>
                  </button>
                </div>
              </div>
            )}

            {showCanvas && (
              <div
                style={{
                  width: windowCanvas,
                  justifyContent: "center",
                  backgroundColor: "#f9f9f9",
                  borderRadius: 10,
                  border: "1px solid transparent",
                  boxShadow: "0 0 15px rgba(0, 0, 0, 0.1)",
                  marginTop: 10,
                  marginBottom: 55,
                }}
                className={styles.canvasScroll}
              >
                <canvas
                  ref={canvasRef}
                  onClick={pickColor}
                  style={{
                    cursor: "crosshair",
                    borderRadius: 15,
                    width: "100%",
                    border: "1px solid transparent",
                    justifyContent: "center",
                    display: showCanvas ? "block" : "none",
                  }}
                />
              </div>
            )}
          </>
        </div>
      </div>
    );
  }
);

export default ImageEditor;
