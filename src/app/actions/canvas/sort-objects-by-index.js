export function sortObjectsByIndex(canvas) {
  for (let i in canvas._objects) {
    for (let j = i + 1; j < canvas._objects.length; j++) {
      let object = canvas._objects[i];
      let nextObject = canvas._objects[i];
      console.log(object);

      if (object.index > nextObject.index) {
        canvas.bringForward(object);
        console.log(object, "was brought forward");
      }
    }
  }
}
