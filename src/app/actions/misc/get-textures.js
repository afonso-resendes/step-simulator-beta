import * as THREE from "three";

export function getTextures() {
  const textureLoader = new THREE.TextureLoader();

  // Função auxiliar para carregar texturas com configuração padrão
  function loadTexture(path) {
    let texture = textureLoader.load(path);
    texture.flipY = false; // Define flipY como false diretamente na textura
    return texture;
  }

  let normalMap = loadTexture("/glbs/general-textures/normal.webp");
  let roughnessMap = loadTexture("glbs/general-textures/roughness.png");
  let transmissionMap = loadTexture("glbs/general-textures/transmission.png");

  normalMap.channel = 2;
  roughnessMap.channel = 2;
  transmissionMap.channel = 2;

  return { normalMap, roughnessMap, transmissionMap };
}
