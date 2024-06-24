//REACT
import React, { useRef, useState, useEffect, forwardRef } from "react";
import NextImage from "next/image";

//STYLES
import styles from "../../styles/texteditor.module.css";
import { fontList } from "../assets/fonts";

//ICONS
import deleteIcon from "../../imgs/icons/binIcon.png";
import textAlignIcon from "../../imgs/icons/textIconalign.png";
import alignRightIcon from "../../imgs/icons/alignRight.png";
import alignLeftIcon from "../../imgs/icons/alignLeft.png";
import alignMiddletIcon from "../../imgs/icons/alignMiddle.png";

//ASSETS
import { colors } from "../assets/colors";

const TextEditor = forwardRef(
  (
    {
      fabricCanvas,
      activeObject,
      closeTabs,
      updateTexture,
      fontFamily,
      setFontFamily,
      addTextbox,
      fontSize,
      setFontSize,
      textAlign,
      setTextAlign,
      fillColor,
      setFillColor,
      editingComponent,
      editZoneRefChild,
      editZoneRef,
      forceClose,
      setActiveObject,
      canvasSize,
      setActiveText,
    },
    ref
  ) => {
    //VARIABLES////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    const [width, setWidth] = useState(activeObject ? activeObject.width : "");
    const [text, setText] = useState(activeObject ? activeObject.text : "");
    const [fill, setFill] = useState(
      activeObject ? activeObject.fill : "#000000"
    );

    const [deleteBtn, setDeleteBtn] = useState(false);
    const [displayTexts, setDisplayTexts] = useState(false);
    const [textBoxes, setTextBoxes] = useState([]);
    const editZoneRefText = useRef(null);
    const textAreaRef = useRef(null);
    const textZoneRef = useRef(null);
    let previousTextAreaHeight;
    const textsList = useRef(null);

    const [windowHeightAdjust, setWindowHeightAdjust] = useState(false);

    //FUNCTIONS//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    const handleDelete = () => {
      setDeleteBtn(!deleteBtn);
      if (fabricCanvas.current && activeObject) {
        fabricCanvas.current.remove(activeObject);
        fabricCanvas.current.discardActiveObject();
        fabricCanvas.current.renderAll();
        updateTexture();
        closeTabs();
        setActiveObject(null);
        handleClose();
      }
    };

    const handleTextChange = (e) => {
      const newText = e.target.value;

      if (fabricCanvas.current && activeObject) {
        activeObject.set("text", newText);
        activeObject.set("width", activeObject.getLineWidth(0));
        fabricCanvas.current.renderAll();
      }

      setText(newText);
      updateTexture();
    };

    const handleSizeChange = (e) => {
      let newSize = parseInt(e.target.value);
      console.log(e.target.value);
      let maxFontSize = canvasSize == 1024 ? 250 : 100;
      console.log("maxFontSIze", maxFontSize);

      if (newSize < 0) {
        newSize = 0;
      } else if (newSize > maxFontSize) {
        newSize = maxFontSize;
      }

      if (newSize >= 0 && newSize < canvasSize == 1024 ? 250 : 100) {
        if (fabricCanvas.current && activeObject) {
          setFontSize(newSize);
          activeObject.set({
            fontSize: newSize,
            cornerSize: newSize / 2,
          });
          fabricCanvas.current.renderAll();
        }
        updateTexture();
      }
    };

    const handleFontFamily = (newFontFamily) => {
      if (fabricCanvas.current && activeObject) {
        activeObject.set("fontFamily", newFontFamily);
        fabricCanvas.current.renderAll();
      }

      setFontFamily(newFontFamily);
      updateTexture();
    };

    const handleFill = (newFill) => {
      if (fabricCanvas.current && activeObject) {
        activeObject.set("fill", newFill);
        fabricCanvas.current.renderAll();
      }

      console.log("Active color: ", activeObject);
      setFillColor(newFill); // Atualiza o estado do React para refletir a mudança
      updateTexture(); // Update the texture to reflect the changes
    };

    const handleTextAlign = (newAlign) => {
      if (fabricCanvas.current && activeObject) {
        activeObject.set("textAlign", newAlign);
        fabricCanvas.current.renderAll();
      }

      setTextAlign(newAlign); // Atualiza o estado do React para refletir a mudança
      updateTexture(); // Chamada para atualizar a textura, se necessário
    };

    const handleAddTextBox = (text) => {
      addTextbox(text);
      setTimeout(() => {
        setText("");
      }, 50);
    };

    const handleClose = () => {
      editZoneRefText.current.style.opacity = 0;
      editZoneRefText.current.style.transition =
        "opacity 0.2s cubic-bezier(0.1, 0.1, 0.0, 1.0), scale 0.6s 0.2s cubic-bezier(0.4, 0.7, 0.0, 1.0)";
      editZoneRefChild.current.style.opacity = 0;
      setTimeout(() => {
        closeTabs();
      }, 200);
    };

    const handleSelectText = (index) => {
      fabricCanvas.current._objects.map((obj, i) => {
        if (i == index) {
          fabricCanvas.current.setActiveObject(obj);
          fabricCanvas.current.renderAll();
          setActiveObject(obj);
        }
      });
    };

    //USE EFFECTS/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    useEffect(() => {
      if (fabricCanvas.current && activeObject) {
        if (activeObject instanceof fabric.Textbox) {
          setText(activeObject.text);
          setFontSize(activeObject.fontSize || 15);
          setFillColor(activeObject.fill || "#000000");
          setFontFamily(activeObject.fontFamily);
          setTextAlign(activeObject.textAlign);
          setTimeout(() => {
            textZoneRef.current.style.opacity = 1;
          }, 100);
        } else {
          setText("");
          setFontSize(35);
          setFillColor("#000000");
          setFontFamily("Arial");
          setTextAlign("center");
        }
      }
    }, [activeObject]);

    useEffect(() => {
      if (!editingComponent.current && !activeObject) {
        setText("");
        setFontSize(35);
        setFillColor("#000000");
      }
    }, [editingComponent.current]);

    useEffect(() => {
      setTimeout(() => {
        editZoneRefText.current.style.opacity = 1;
        editZoneRefText.current.style.transition =
          "opacity 0.3s cubic-bezier(0.1, 0.1, 0.0, 1.0), scale 1s cubic-bezier(0.1, 0.7, -0.4, 1.0)";
      }, 10);

      let add = true;
      let textboxNumber = 0;
      if (fabricCanvas.current && !activeObject) {
        fabricCanvas.current.forEachObject(function (obj) {
          if (obj instanceof fabric.Textbox) {
            add = false;
            textboxNumber += 1;
          }
        });

        if (add) {
          handleAddTextBox("O seu texto");
        } else {
          setDisplayTexts(true);
          //const newHeight = 100 + textboxNumber * 120;
          //editZoneRefText.current.style.height = newHeight + "px";
          //editZoneRef.current.style.height = newHeight + "px";
        }
      }
    }, []);

    useEffect(() => {
      if (forceClose) {
        editZoneRefText.current.style.opacity = 0;
        editZoneRefText.current.style.transition =
          "opacity 0.2s cubic-bezier(0.1, 0.1, 0.0, 1.0), scale 0.6s 0.2s cubic-bezier(0.4, 0.7, 0.0, 1.0)";
        editZoneRefChild.current.style.opacity = 1;
        textZoneRef.current.style.opacity = 0;
      }
    }, [forceClose]);

    useEffect(() => {
      if (textAreaRef.current) {
        previousTextAreaHeight = parseInt(textAreaRef.current.style.height);
        textAreaRef.current.style.height = "auto";
        textAreaRef.current.style.height = textAreaRef.current.scrollHeight;

        if (editZoneRefText.current) {
          const newHeight =
            parseInt(editZoneRefText.current.style.height) +
            parseInt(textAreaRef.current.style.height) -
            previousTextAreaHeight;

          //editZoneRefText.current.style.height = newHeight + "px";
        }
      }
      setActiveText(text);
    }, [text, windowHeightAdjust]);

    return (
      <div
        // style={{ height: heightWindow, opacity: 0 }}
        style={{
          height: !activeObject
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
            ? 300 + (text.split("\n").length * 35) / 2
            : 150 + (text.split("\n").length * 35) / 2,
          maskImage:
            !activeObject &&
            "linear-gradient(to bottom, white 85%, transparent 98%)",
          maskSize: !activeObject && "100% 100%",
        }}
        ref={editZoneRefText}
        className={styles.editZoneText}
      >
        <div
          style={{
            height: !activeObject
              ? 50 +
                56 *
                  fabricCanvas.current._objects.filter(
                    (obj) => obj instanceof fabric.Textbox
                  ).length
              : 300,
          }}
          className={styles.maskTexts}
        />
        <div className={styles.nameZone}>
          <button
            className={styles.fileUploadLabealBack}
            onClick={() => {
              //editZoneRef.current.style.height = "369px";
              if (activeObject) {
                if (
                  activeObject.text == "O seu texto" ||
                  activeObject.text == ""
                ) {
                  fabricCanvas.current.remove(activeObject);
                }
                let isThereAnyTextbox = false;
                fabricCanvas.current._objects.forEach((obj) => {
                  if (obj instanceof fabric.Textbox) isThereAnyTextbox = true;
                });
                if (!isThereAnyTextbox) {
                  closeTabs();
                }
                setActiveObject(null);
                fabricCanvas.current.discardActiveObject();
                fabricCanvas.current.renderAll();
                updateTexture();
              } else handleClose();
            }}
          >
            <p
              style={{
                marginTop: window.innerWidth < 715 ? -13 : -15,
                justifyContent: "center",
                fontSize: 12,
                marginLeft: window.innerWidth < 715 ? -5 : -1,
                fontWeight: "1000",
                color: "#edc645",
              }}
            >
              &#8592;
            </p>
          </button>
          <p className={styles.trititle}>Editar Texto</p>
          {fabricCanvas.current && (
            <label
              onClick={() => handleAddTextBox("O seu texto")}
              className={styles.fileUploadLabealAdd}
            >
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
            </label>
          )}
        </div>

        {activeObject && activeObject instanceof fabric.Textbox ? (
          <>
            <div
              className={styles.bottomWindowText}
              style={{
                opacity: 0,
                transition: "opacity .3s cubic-bezier(0,.1,.7,1)",
              }}
              ref={textZoneRef}
            >
              <div
                style={{
                  display: "flex",
                  gap: 5,
                  justifyContent: "space-between",
                }}
                className={styles.input_Trash}
              >
                <textarea
                  placeholder="O seu texto"
                  className={styles.inputText}
                  style={{
                    width: "90%",
                    height: 17 + (text.split("\n").length * 35) / 2,
                    overflowY: "scroll",
                  }}
                  value={text}
                  onChange={handleTextChange}
                  //ref={textAreaRef}
                />

                <button onClick={handleDelete} className={styles.deleteButton}>
                  <NextImage src={deleteIcon} width={25} height={25} />
                </button>
              </div>

              <div className={styles.textHeader}>
                <div className={styles.fontFamily}>
                  <div>
                    <p
                      style={{
                        color: "#666",
                        fontSize: 13,
                        letterSpacing: -0.8,
                        marginBottom: 5,
                        fontFamily: "Inter",
                      }}
                    >
                      Escolha a sua fonte
                    </p>
                    <div>
                      <select
                        className={styles.selectFonts}
                        value={fontFamily}
                        onChange={(e) => {
                          const newFontFamily = e.target.value;
                          handleFontFamily(newFontFamily);
                          fabricCanvas.current.renderAll();
                          updateTexture();
                        }}
                      >
                        {fontList.map((font) => (
                          <option
                            key={font}
                            style={{ fontFamily: font }}
                            className={styles.options}
                            value={font}
                          >
                            {font}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <p
                      style={{
                        color: "#666",
                        fontSize: 13,
                        letterSpacing: -0.8,
                        marginBottom: 5,
                        fontFamily: "Inter",
                        marginLeft: 5,
                      }}
                    >
                      Cor do texto
                    </p>
                    <div>
                      <select
                        className={styles.inputSize}
                        value={fillColor}
                        onChange={(e) => {
                          const newFill = e.target.value;
                          handleFill(newFill);
                          updateTexture();
                        }}
                      >
                        {Object.entries(colors).map(([key, value]) => {
                          return (
                            <option value={value} key={value}>
                              {key}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                </div>
                <div className={styles.alinhamento_Tamanho}>
                  <div>
                    <p
                      style={{
                        color: "#666",
                        fontSize: 13,
                        letterSpacing: -0.8,
                        marginBottom: 5,
                        fontFamily: "Inter",
                      }}
                    >
                      Alinhamento
                    </p>
                    <div className={styles.alignBtns}>
                      <button
                        onClick={() => {
                          const newAlign = "left";
                          handleTextAlign(newAlign);
                        }}
                        className={styles.alignBtn}
                      >
                        <NextImage
                          src={alignLeftIcon}
                          style={{ width: 20, height: 20, marginTop: 4 }}
                          width={20}
                          height={20}
                          alt="Description"
                          className={styles.alignBtnImage}
                        />
                      </button>
                      <button
                        onClick={() => {
                          const newAlign = "center";
                          handleTextAlign(newAlign);
                        }}
                        className={styles.alignBtn}
                      >
                        <NextImage
                          src={alignMiddletIcon}
                          style={{ width: 20, height: 20, marginTop: 4 }}
                          width={20}
                          height={20}
                          alt="Description"
                          className={styles.alignBtnImage}
                        />
                      </button>
                      <button
                        onClick={() => {
                          const newAlign = "right";
                          handleTextAlign(newAlign);
                        }}
                        className={styles.alignBtn}
                      >
                        <NextImage
                          src={alignRightIcon}
                          style={{ width: 20, height: 20, marginTop: 4 }}
                          width={20}
                          height={20}
                          alt="Description"
                          className={styles.alignBtnImage}
                        />
                      </button>
                      <button
                        style={{ opacity: 0 }}
                        className={styles.alignBtn}
                      >
                        <NextImage
                          src={textAlignIcon}
                          style={{ width: 20, height: 20, marginTop: 4 }}
                          width={20}
                          height={20}
                          alt="Description"
                          className={styles.alignBtnImage}
                        />
                      </button>
                    </div>
                  </div>
                  <div className={styles.inputMain}>
                    <p
                      style={{
                        color: "#666",
                        fontSize: 13,
                        letterSpacing: -0.8,
                        marginBottom: 5,
                        fontFamily: "Inter",
                      }}
                    >
                      Tamanho
                    </p>
                    <div>
                      <input
                        className={styles.inputText}
                        value={fontSize}
                        inputMode="numeric"
                        type="number"
                        onChange={handleSizeChange}
                        max={canvasSize == 1024 ? 250 : 100}
                        min={0}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className={styles.noText} ref={textsList}>
            {fabricCanvas.current._objects.map((obj, index) => {
              /*editZoneRef.current.style.height =
                fabricCanvas.current._objects.filter(
                  (obj) => obj instanceof fabric.Textbox
                ).length * 90;*/

              if (obj instanceof fabric.Textbox) {
                return (
                  <div
                    key={index}
                    onClick={() => {
                      fabricCanvas.current.setActiveObject(obj);
                      fabricCanvas.current.renderAll();
                      updateTexture();
                      setActiveObject(obj);
                      handleSelectText(index);
                      setWindowHeightAdjust(!windowHeightAdjust);
                    }}
                    className={styles.textOption}
                  >
                    <p>{obj.text}</p>
                    <p style={{ fontSize: 14 }}>&#8250;</p>
                  </div>
                );
              } else {
                <p className={styles.trititle}>Adicione texto para começar</p>;
              }
            })}
          </div>
        )}
      </div>
    );
  }
);

export default TextEditor;
