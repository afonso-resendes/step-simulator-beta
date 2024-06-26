import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import TWEEN from "@tweenjs/tween.js";
import * as THREE from "three";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader";

const ktx2LoaderInstance = (function () {
  let instance;
  return function (renderer) {
    if (!instance) {
      instance = new KTX2Loader()
        .setTranscoderPath("/transcoder/")
        .detectSupport(renderer);
    }
    return instance;
  };
})();

export const loadGLBModel = (
  path,
  scenario,
  setIsLoading,
  renderer,
  callback
) => {
  const loader = new GLTFLoader();
  const ktx2Loader = ktx2LoaderInstance(renderer);

  loader.setKTX2Loader(ktx2Loader);

  /*const albedoFerroPromise = ktx2Loader.load("/albedoFerro.ktx2");
  const normalFerroPromise = ktx2Loader.load("/normalFerro.ktx2");
  const roughnessFerroPromise = ktx2Loader.load("/roughessFerro.ktx2");
  const normalPanoPromise = ktx2Loader.load("/normalPano.ktx2");
  const roughnessPanoPromise = ktx2Loader.load("/roughnessPano.ktx2");
  const transmissionPanoPromise = ktx2Loader.load("/transmissionPano.ktx2");*/

  Promise.all([
    ktx2Loader.loadAsync("/glbs/general-textures/normal.ktx2"),
    ktx2Loader.loadAsync("/glbs/general-textures/roughness.ktx2"),
    ktx2Loader.loadAsync("/glbs/general-textures/transmission.ktx2"),
    ktx2Loader.loadAsync("/glbs/general-textures/tshirt-normal.ktx2"),
    ktx2Loader.loadAsync("/glbs/general-textures/tshirt-roughness.ktx2"),
    ktx2Loader.loadAsync("/glbs/general-textures/tshirt-transmission.ktx2"),
  ])
    .then((textures) => {
      const [
        normalHoodie,
        roughnessHoodie,
        transmissionHoodie,
        normalTshirt,
        roughnessTshirt,
        transmissionTshirt,
      ] = textures;

      const objectNames = []; // Array para armazenar os nomes dos objetos

      loader.load(
        path,
        function (gltf) {
          // Ajuste da posição inicial da cena do modelo
          gltf.scene.position.set(0, -1, 0);
          gltf.scene.traverse(function (child) {
            if (child.isMesh) {
              if (child.name.includes("TEXT")) {
                if (path.includes("tshirt")) {
                  normalTshirt.channel = 2;
                  roughnessTshirt.channel = 2;
                  transmissionTshirt.channel = 2;
                  child.material.normalMap = normalTshirt;
                  child.material.roughnessMap = roughnessTshirt;
                  child.material.transmissionMap = transmissionTshirt;
                  child.material.sheen = 0;
                } else {
                  normalHoodie.channel = 2;
                  roughnessHoodie.channel = 2;
                  transmissionHoodie.channel = 2;
                  child.material.normalMap = normalHoodie;
                  child.material.roughnessMap = roughnessHoodie;
                  child.material.transmissionMap = transmissionHoodie;
                  child.material.sheen = 0;
                }
              }

              child.material.opacity = 0;
              child.material.transparent = true;
              child.material.needsUpdate = true;
              child.material.transmission = 0;
              child.castShadow = true;
              child.receiveShadow = true;

              objectNames.push(child.name); // Adiciona o nome ao array
            }
          });

          // Adiciona a cena completa ao cenário
          scenario.add(gltf.scene);

          // Inicia a animação da escala da cena completa

          new TWEEN.Tween({ x: 0, y: 0, z: 0 })
            .to({ x: 1, y: 1, z: 1 }, 1610)
            .easing(TWEEN.Easing.Exponential.InOut)
            .onUpdate((scale) => {
              gltf.scene.scale.set(scale.x, scale.y, scale.z);
            })
            .delay(200)
            .start();

          new TWEEN.Tween({ opacity: 0 })
            .to({ opacity: 1 }, 2000)
            .easing(TWEEN.Easing.Exponential.InOut)
            .onUpdate((object) => {
              // Update opacity of meshes in gltf.scene
              gltf.scene.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                  child.material.transparent = true; // Ensure material is transparent
                  child.material.opacity = object.opacity;
                }
              });
            })
            .delay(700)
            .start();

          new TWEEN.Tween({ x: 0, y: 0, z: 0 })
            .to({ x: 0, y: Math.PI * 2, z: 0 }, 2000)
            .easing(TWEEN.Easing.Exponential.InOut)
            .onUpdate((rotation) => {
              gltf.scene.rotation.set(rotation.x, rotation.y, rotation.z);
            })
            .delay(700)
            .start();

          setIsLoading(false);
        },
        undefined,
        function (error) {
          setIsLoading(false);
          console.log(error);
        }
      );
      callback();
    })
    .catch((error) => console.error("Failed to load KTX2 textures:", error));
};
