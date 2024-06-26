import { fabric } from "fabric";

export class CenteredPencilBrush extends fabric.PencilBrush {
  constructor(canvas) {
    super(canvas);
  }

  // Override the createPath method to set originX and originY to 'center'
  createPath(pathData) {
    const path = new fabric.Path(pathData, {
      fill: null,
      stroke: this.color,
      strokeWidth: this.width,
      strokeLineCap: this.strokeLineCap,
      strokeLineJoin: this.strokeLineJoin,
      strokeDashArray: this.strokeDashArray,
      originX: "center",
      originY: "center",
      cornerColor: "rgba(0, 0, 0, 0.4)",
      cornerStyle: "circle",
      transparentCorners: false,
    });

    // Reposition path to center
    const boundingRect = path.getBoundingRect();
    path.set({
      left: boundingRect.left + boundingRect.width / 2,
      top: boundingRect.top + boundingRect.height / 2,
    });

    return path;
  }
}

export class CenteredSprayBrush extends fabric.SprayBrush {
  constructor(canvas) {
    super(canvas);
  }

  // Override the createPath method to set originX and originY to 'center'
  createPath(pathData) {
    const path = new fabric.Path(pathData, {
      fill: null,
      stroke: this.color,
      strokeWidth: this.width,
      strokeLineCap: this.strokeLineCap,
      strokeLineJoin: this.strokeLineJoin,
      strokeDashArray: this.strokeDashArray,
      originX: "center",
      originY: "center",
      cornerColor: "rgba(0, 0, 0, 0.4)",
      cornerStyle: "circle",
      transparentCorners: false,
    });

    // Reposition path to center
    const boundingRect = path.getBoundingRect();
    path.set({
      left: boundingRect.left + boundingRect.width / 2,
      top: boundingRect.top + boundingRect.height / 2,
    });

    return path;
  }
}
