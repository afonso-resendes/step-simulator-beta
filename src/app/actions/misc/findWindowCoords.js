import * as THREE from "three";

export function windowCoords(uv, mesh, camera) {
  const geometry = mesh.geometry;
  const uvAttribute = geometry.getAttribute("uv");
  const positionAttribute = geometry.getAttribute("position");
  let vector = new THREE.Vector3();

  // Find nearest face or use predefined face indices (example for one face)
  let faceIndex = 0; // Index of the face, assume first face for simplification
  let a = positionAttribute.getX(faceIndex);
  let b = positionAttribute.getY(faceIndex);
  let c = positionAttribute.getZ(faceIndex);
  let uvA = new THREE.Vector2().fromBufferAttribute(uvAttribute, a);
  let uvB = new THREE.Vector2().fromBufferAttribute(uvAttribute, b);
  let uvC = new THREE.Vector2().fromBufferAttribute(uvAttribute, c);

  // Barycentric coordinates for UV interpolation
  const baryCoord = barycentric(uv, uvA, uvB, uvC);

  // Interpolate position using barycentric coordinates
  let posA = new THREE.Vector3().fromBufferAttribute(positionAttribute, a);
  let posB = new THREE.Vector3().fromBufferAttribute(positionAttribute, b);
  let posC = new THREE.Vector3().fromBufferAttribute(positionAttribute, c);
  vector = posA
    .multiplyScalar(baryCoord[0])
    .add(
      posB.multiplyScalar(baryCoord[1]).add(posC.multiplyScalar(baryCoord[2]))
    );
  console.log(vector);

  // Transform to world coordinates
  vector.applyMatrix4(mesh.matrixWorld);
  console.log(vector);

  // Transform to clip space
  vector.project(camera);

  console.log(vector);

  // Convert clip space coordinates to window coordinates
  const x = (vector.x + 1) / 2;
  const y = (-vector.y + 1) / 2;

  return { x, y };
}

// Calculate barycentric coordinates (you need to define this according to your needs)
function barycentric(p, a, b, c) {
  // This is a placeholder function; you will need to implement this based on actual math
  return [1 / 3, 1 / 3, 1 / 3]; // Simplified, usually requires solving linear equations
}
