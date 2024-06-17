export function isPointInUV(u, v, geometry) {
  const uvAttribute = geometry.attributes.uv;
  const indices = geometry.index ? geometry.index.array : null;

  function isPointInTriangle(px, py, v1, v2, v3) {
    function sub(v, w) {
      return { x: v.x - w.x, y: v.y - w.y };
    }
    function cross(v, w) {
      return v.x * w.y - v.y * w.x;
    }

    var v1p = sub(v1, { x: px, y: py });
    var v2p = sub(v2, { x: px, y: py });
    var v3p = sub(v3, { x: px, y: py });

    var c1 = cross(v2p, v3p);
    var c2 = cross(v3p, v1p);
    var c3 = cross(v1p, v2p);

    return (c1 >= 0 && c2 >= 0 && c3 >= 0) || (c1 <= 0 && c2 <= 0 && c3 <= 0);
  }

  for (let i = 0; i < uvAttribute.count; i += 3) {
    const idx1 = indices ? indices[i] : i;
    const idx2 = indices ? indices[i + 1] : i + 1;
    const idx3 = indices ? indices[i + 2] : i + 2;

    const v1 = { x: uvAttribute.getX(idx1), y: uvAttribute.getY(idx1) };
    const v2 = { x: uvAttribute.getX(idx2), y: uvAttribute.getY(idx2) };
    const v3 = { x: uvAttribute.getX(idx3), y: uvAttribute.getY(idx3) };

    if (isPointInTriangle(u, v, v1, v2, v3)) {
      return true;
    }
  }
  return false;
}
