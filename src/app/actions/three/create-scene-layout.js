import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { hdri } from "./load-hdri";

export function createSceneLayout() {
  const renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(2);
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf4f4f4);

  const camera = new THREE.PerspectiveCamera(
    35,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 25;
  camera.position.y = -5;

  /*const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const areaLightFrontLeft = new THREE.RectAreaLight(0xffffff, 0.4, 10, 10);
  areaLightFrontLeft.position.set(5, -2, 5);
  areaLightFrontLeft.lookAt(0, 0, 0);
  scene.add(areaLightFrontLeft);

  const areaLightFrontRight = new THREE.RectAreaLight(0xffffff, 0.4, 10, 10);
  areaLightFrontRight.position.set(-5, -2, 5);
  areaLightFrontRight.lookAt(0, 0, 0);
  scene.add(areaLightFrontRight);

  const areaLightBack = new THREE.RectAreaLight(0xffffff, 0.4, 10, 10);
  areaLightBack.position.set(0, -2, -5);
  areaLightBack.lookAt(0, 0, 0);
  scene.add(areaLightBack);*/

  // const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  // scene.add(ambientLight);
  // ambientLight.lookAt(0, 0, 0);
  // const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
  // scene.add(hemisphereLight);

  const ambientLight = new THREE.AmbientLight(0xffffff, 2); // luz para se ver à frente

  const directionLight = new THREE.DirectionalLight(0xffffff, 0.5); // luz para se ver à frente
  const directionLightTRAS = new THREE.DirectionalLight(0xffffff, 0.5); // luz para se ver à frente
  directionLight.position.set(0, 5, 20);
  directionLightTRAS.position.set(0, -5, -20);
  directionLight.lookAt(0, 0, 0);
  directionLightTRAS.lookAt(0, 0, 0);

  const spotlight = new THREE.SpotLight(0xffffff, 3, 0, Math.PI / 3, 0.5, 1.5); // luz para se ver à frente
  const spotlightTRAS = new THREE.SpotLight(
    0xffffff,
    3,
    0,
    Math.PI / 3,
    0.5,
    1
  ); // luz para se ver à frente
  spotlight.position.set(0, 5, 5);
  spotlightTRAS.position.set(0, 5, -5);
  spotlight.lookAt(0, 0, 0);
  spotlightTRAS.lookAt(0, 0, 0);
  spotlight.castShadow = true;
  spotlightTRAS.castShadow = true;

  scene.add(ambientLight);
  scene.add(directionLight);
  scene.add(directionLightTRAS);
  scene.add(spotlight);
  scene.add(spotlightTRAS);

  const orbit = new OrbitControls(camera, renderer.domElement);
  orbit.target.set(0, 0, 0);
  orbit.enableDamping = true;
  orbit.dampingFactor = 0.161;
  orbit.screenSpacePanning = false;
  orbit.maxPolarAngle = Math.PI / 1.61; // nao deixa ir o user ver por baixo do hoodie, so o suficiente
  orbit.mouseButtons = {
    LEFT: THREE.MOUSE.ROTATE,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: null,
  };
  orbit.enablePan = false;
  orbit.enabled = true;
  orbit.minDistance = 10;
  orbit.maxDistance = 35;

  //scene.fog = new THREE.FogExp2(0xf4f4f4, 0.0161);

  // scene.environment = hdri("/hdri5.exr", renderer, scene);
  // scene.environmentIntensity = 2.7;

  return {
    scene: scene,
    renderer: renderer,
    orbit: orbit,
    camera: camera,
  };
}
