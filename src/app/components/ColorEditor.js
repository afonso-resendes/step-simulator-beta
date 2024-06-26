import React, { useState, forwardRef, useRef, useEffect } from "react";
import styles from "../../styles/coloreditor.module.css";
import { colors } from "../assets/colors";

const ColorEditor = forwardRef(
  (
    {
      handleBGColorChange,
      closeEditor,
      editingComponent,
      editZoneRef,
      editZoneRefChild,
      forceClose,
    },
    ref
  ) => {
    const [heightWindow, setHeightWindow] = useState(292);

    const editZoneRefColor = useRef(null);

    const handleClose = () => {
      editZoneRefColor.current.style.opacity = 0;
      editZoneRefColor.current.style.transition =
        "opacity 0.2s cubic-bezier(0.1, 0.1, 0.0, 1.0), scale 0.6s 0.2s cubic-bezier(0.4, 0.7, 0.0, 1.0)";
      editingComponent.current.name.includes("COR")
        ? (editZoneRef.current.style.height = "130px")
        : (editZoneRef.current.style.height = "369px");
      editZoneRefChild.current.style.opacity = 0;

      setTimeout(() => {
        closeEditor();
      }, 200);
    };

    useEffect(() => {
      setTimeout(() => {
        editZoneRefColor.current.style.opacity = 1;
        editZoneRefColor.current.style.transition =
          "opacity 0.3s cubic-bezier(0.1, 0.1, 0.0, 1.0), scale 1s cubic-bezier(0.1, 0.7, -0.4, 1.0)";
      }, 10);
    }, []);

    useEffect(() => {
      if (forceClose) {
        editZoneRefColor.current.style.opacity = 0;
        editZoneRefColor.current.style.transition =
          "opacity 0.2s cubic-bezier(0.1, 0.1, 0.0, 1.0), scale 0.6s 0.2s cubic-bezier(0.4, 0.7, 0.0, 1.0)";
      }
    }, [forceClose]);

    return (
      <>
        <div
          style={{ height: heightWindow, opacity: 0 }}
          ref={editZoneRefColor}
          className={styles.editZoneCor}
        >
          <div className={styles.nameZone}>
            <button
              className={styles.fileUploadLabealBack}
              onClick={handleClose}
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

            <p className={styles.trititle}>Editar cor</p>
            <label
              style={{ opacity: 0 }}
              className={styles.fileUploadLabealAdd}
            >
              <p
                style={{
                  marginTop: -13,
                  marginLeft: -1,
                  fontSize: 15,
                  color: "#fff",
                }}
              >
                +
              </p>
            </label>
          </div>

          {/*<div className={styles.coresDisposalTlm}>*/}
          <div
            style={{ marginTop: window.innerWidth > 750 ? 75 : 70 }}
            className={styles.coresDisposal}
          >
            {Object.values(colors).map((color, index) => (
              <button
                key={index}
                style={{ backgroundColor: color }}
                className={styles.addCorBtn}
                onClick={() => handleBGColorChange(color)}
              />
            ))}
          </div>
          {/*</div>*/}
        </div>
      </>
    );
  }
);

export default ColorEditor;
