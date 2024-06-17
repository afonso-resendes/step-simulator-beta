function getIntersections(raycaster, camera, scene, mouse) {
  raycaster.setFromCamera(mouse, camera);
  let intersections = raycaster.intersectObjects(scene.children, true);
  return intersections;
}

function getIntersection(raycaster, camera, object, mouse) {
  raycaster.setFromCamera(mouse, camera);
  let intersection = raycaster.intersectObject(object, false);
  return intersection;
}

export { getIntersection, getIntersections };
