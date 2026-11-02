import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createLabels } from './labels.js';
import { createCameraMotion } from './motion.js';
import { createVirusMotion } from './virus-motion.js';

// Integration settings: the model is self-contained; no texture/CDN requests.
const MODEL_URL = new URL('../assets/skin-eczema.glb', import.meta.url);
const canvas = document.querySelector('#canvas');
const status = document.querySelector('#status');
const statusText = document.querySelector('#status-text');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
const scene = new THREE.Scene();
scene.background = new THREE.Color('#f3f3f3');
const environment = new RoomEnvironment();
const pmrem = new THREE.PMREMGenerator(renderer);
const environmentTarget = pmrem.fromScene(environment, 0.04);
scene.environment = environmentTarget.texture;
const DEFAULT_LIGHTING = 0.65;
scene.environmentIntensity = 0.65 * DEFAULT_LIGHTING;
environment.dispose();
pmrem.dispose();
const hemisphere = new THREE.HemisphereLight(0xffffff, 0xb9a48d, 1.5 * DEFAULT_LIGHTING);
scene.add(hemisphere);
const key = new THREE.DirectionalLight(0xffeee3, 2.2 * DEFAULT_LIGHTING);
key.position.set(-3, 5, 4);
scene.add(key);
const fill = new THREE.DirectionalLight(0xffffff, 0.8 * DEFAULT_LIGHTING);
fill.position.set(4, 2, -3);
scene.add(fill);
const MODEL_DISPLAY_SCALE = 1.32;
const camera = new THREE.PerspectiveCamera(36, 1, 0.001, 100);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.autoRotateSpeed = 0.65;
// Polar angle is measured down from vertical: keep the camera above the skin.
controls.minPolarAngle = THREE.MathUtils.degToRad(35);
controls.maxPolarAngle = THREE.MathUtils.degToRad(80);
controls.enablePan = false;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const motion = createCameraMotion(camera, controls, reducedMotion);
let radius = 1;
let ready = false;
let labels;
let virusMotion;
let previous = performance.now();
function resize() {
  const { width, height } = canvas.getBoundingClientRect();
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  // Lift the model by 4% of the viewport height; projected labels follow.
  camera.setViewOffset(width, height, 0, height * 0.04, width, height);
  camera.updateProjectionMatrix();
}
function stopRotation() {
  controls.autoRotate = false;
  document.querySelector('#rotate').setAttribute('aria-pressed', 'false');
}
function setView(top = false, animate = ready) {
  stopRotation();
  const vertical = THREE.MathUtils.degToRad(camera.fov / 2);
  const horizontal = Math.atan(Math.tan(vertical) * camera.aspect);
  const distance = radius / Math.sin(Math.min(vertical, horizontal)) * 1.12 / MODEL_DISPLAY_SCALE;
  const position = top
    ? new THREE.Vector3().setFromSpherical(new THREE.Spherical(distance, controls.minPolarAngle, controls.getAzimuthalAngle()))
    : new THREE.Vector3(-1.15, 0.95, 1.55).normalize().multiplyScalar(distance);
  motion.to(position, new THREE.Vector3(), animate ? 1050 : 0);
}
function zoom(factor) {
  motion.cancel();
  const offset = camera.position.clone().sub(controls.target);
  offset.setLength(THREE.MathUtils.clamp(offset.length() * factor, controls.minDistance, controls.maxDistance));
  camera.position.copy(controls.target).add(offset);
  controls.update();
}
resize();
window.addEventListener('resize', () => {
  resize();
  if (ready) {
    const rotating = controls.autoRotate;
    setView(false, false);
    controls.autoRotate = rotating;
    document.querySelector('#rotate').setAttribute('aria-pressed', String(rotating));
  }
});
canvas.addEventListener('webglcontextlost', event => {
  event.preventDefault();
  status.className = 'error';
  statusText.textContent = 'The graphics connection was lost. Reload the page to continue.';
  document.querySelectorAll('button').forEach(button => button.disabled = true);
});
try {
  const gltf = await createModelLoader().loadAsync(MODEL_URL.href, progress => {
    statusText.textContent = progress.total ? `Loading skin model… ${Math.round(progress.loaded / progress.total * 100)}%` : 'Loading skin model…';
  });
  const model = gltf.scene;
  const bounds = new THREE.Box3().setFromObject(model);
  const center = bounds.getCenter(new THREE.Vector3());
  radius = bounds.getBoundingSphere(new THREE.Sphere()).radius;
  model.position.sub(center);
  scene.add(model);
  model.updateMatrixWorld(true);
  virusMotion = createVirusMotion(model, reducedMotion);
  document.querySelector('#viewer').dataset.spinningViruses = String(virusMotion.count);
  const skinMesh = model.getObjectByName('Bad_Skin') || model.getObjectByName('Bad_Skin_1');
  if (!skinMesh) throw new Error('The eczema skin mesh could not be found.');
  labels = await createLabels({ model: skinMesh, pathogen: model.getObjectByName('Virus_4'), camera, controls, canvas, bounds: new THREE.Box3().setFromObject(skinMesh), motion });
  camera.near = radius / 1000;
  camera.far = radius * 100;
  camera.updateProjectionMatrix();
  // Prevent zooming through the surface, which could expose the inside/bottom.
  controls.minDistance = radius * 1.35;
  controls.maxDistance = radius * 12;
  setView();
  ready = true;
  controls.autoRotate = !reducedMotion.matches;
  document.querySelector('#rotate').setAttribute('aria-pressed', String(controls.autoRotate));
  status.className = 'ready';
  statusText.textContent = '3D model ready';
  document.querySelectorAll('button').forEach(button => button.disabled = false);
  if (!document.fullscreenEnabled) document.querySelector('#fullscreen').hidden = true;
} catch (error) {
  console.error('Skin model failed to load:', error);
  status.className = 'error';
  statusText.textContent = 'The skin model could not load. Check assets/skin-eczema.glb and serve this folder over HTTP.';
}
document.querySelector('#lighting').addEventListener('input', event => {
  const value = Number(event.target.value) / 100;
  scene.environmentIntensity = 0.65 * value;
  hemisphere.intensity = 1.5 * value;
  key.intensity = 2.2 * value;
  fill.intensity = 0.8 * value;
  document.querySelector('#lighting-value').textContent = `${event.target.value}%`;
});
document.querySelector('#reset').addEventListener('click', () => setView());
document.querySelector('#top').addEventListener('click', () => setView(true));
document.querySelector('#zoom-in').addEventListener('click', () => zoom(0.8));
document.querySelector('#zoom-out').addEventListener('click', () => zoom(1.25));
document.querySelector('#rotate').addEventListener('click', () => {
  motion.cancel();
  controls.autoRotate = !controls.autoRotate;
  document.querySelector('#rotate').setAttribute('aria-pressed', String(controls.autoRotate));
});
reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) stopRotation(); });
document.querySelector('#fullscreen').addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.querySelector('#viewer').requestFullscreen();
  } catch { statusText.textContent = 'Full screen is unavailable in this browser.'; }
});
document.addEventListener('fullscreenchange', () => {
  const fullScreen = document.fullscreenElement === document.querySelector('#viewer');
  scene.background.set(fullScreen ? '#ffffff' : '#f3f3f3');
  document.querySelector('#fullscreen').textContent = fullScreen ? 'Exit full screen' : 'Full screen';
  resize();
});
renderer.setAnimationLoop(now => {
  const delta = Math.min((now - previous) / 1000, 0.1);
  previous = now;
  if (document.hidden) return;
  motion.update(now);
  controls.update(delta);
  virusMotion?.update(delta);
  renderer.render(scene, camera);
  labels?.update();
});

function createModelLoader() {
  return new GLTFLoader();
}
