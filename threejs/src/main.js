import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { buildCastle } from "./castle.js";
import { buildSurroundings } from "./surroundings.js";
import { resolveCollisions } from "./collision.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x8fd0e0);

// A far plane of 1000 for a scene that only spans ~30 units starved the
// depth buffer of precision and caused z-fighting (visible as flickering
// stripes where the moat met the ground plane). Tightened to fit the scene.
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 150);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- Lighting ---------------------------------------------------------
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const sun = new THREE.DirectionalLight(0xffffff, 1.2);
sun.position.set(10, 20, 10);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -20;
sun.shadow.camera.right = 20;
sun.shadow.camera.top = 20;
sun.shadow.camera.bottom = -20;
sun.shadow.bias = -0.0015; // avoids shadow-acne banding on large flat tiled surfaces (e.g. the moat)
scene.add(sun);

// --- Ground -------------------------------------------------------------
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(200, 200),
  new THREE.MeshStandardMaterial({ color: 0x4a9c4a }),
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

buildCastle(scene);
buildSurroundings(scene);

// --- Player (Mage) --------------------------------------------------------
// The Mage rig's raw bind-pose height is ~3.36 units, but Castle Kit's own
// grid is much smaller (wall = 1.31 units tall) — Kenney world kits and
// KayKit characters aren't modeled to the same scale by default. Scaling
// the character down to ~1 unit tall (roughly level with, or a bit under,
// the wall) is what makes her fit the castle instead of towering over it.
const PLAYER_SCALE = 0.28; // ~0.94 units tall at this scale
const PLAYER_RADIUS = 0.3; // collision circle, roughly her shoulder width at PLAYER_SCALE
const PLAYER_SPEED = 2.2; // units/sec — ~2.3x her own height per second, a brisk walk rather than a sprint
const TURN_SPEED = Math.PI * 2.5; // radians/sec — how fast the model turns to face movement
const CAMERA_OFFSET = new THREE.Vector3(0, 9, 9); // fixed angle — translates with the player, never rotates
const LOOK_HEIGHT = 0.6; // roughly chest height at PLAYER_SCALE, so the camera isn't aimed at her feet
const SPAWN = new THREE.Vector3(0, 0, 0); // castle center — there's no way out, so start inside

let player = null;
let mixer = null;
let idleAction = null;
let walkAction = null;
let attackAction = null;
let currentAction = null;
let isAttacking = false;
const facing = new THREE.Vector3(0, 0, 1);

// Adds a flat-grey "ghost" twin of every mesh in `root`, sharing the same
// geometry (and, for skinned meshes, the same skeleton — so it deforms
// identically with zero extra animation work).
//
// The ghost's visibility can't be decided by comparing against the main
// depth buffer — that buffer also contains the player's OWN other meshes
// (hat over hair, hand over robe, etc.), so any part overlapped by another
// part of herself read as "occluded" and stayed grey even in the open.
// Instead each ghost fragment is compared against `envDepthTexture`, a
// depth buffer rendered once a frame with the player hidden — see tick()
// below — so only real environment geometry (a wall) can trigger the
// effect, never her own body.
const envDepthUniforms = {
  envDepth: { value: null },
  resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
};

function addXRaySilhouette(root) {
  const ghostMaterial = new THREE.MeshBasicMaterial({
    color: 0x888888,
    transparent: true,
    opacity: 0.55,
    depthTest: false,
    depthWrite: false,
  });
  ghostMaterial.onBeforeCompile = (shader) => {
    shader.uniforms.envDepth = envDepthUniforms.envDepth;
    shader.uniforms.resolution = envDepthUniforms.resolution;
    shader.fragmentShader = `
      uniform sampler2D envDepth;
      uniform vec2 resolution;
    ${shader.fragmentShader}`.replace(
      "void main() {",
      `void main() {
        vec2 screenUV = gl_FragCoord.xy / resolution;
        float envZ = texture2D(envDepth, screenUV).x;
        if (gl_FragCoord.z <= envZ) discard; // not behind any real environment geometry here
      `,
    );
  };

  const meshes = [];
  root.traverse((node) => {
    if (node.isMesh) meshes.push(node);
  });

  for (const mesh of meshes) {
    const ghost = mesh.isSkinnedMesh
      ? new THREE.SkinnedMesh(mesh.geometry, ghostMaterial)
      : new THREE.Mesh(mesh.geometry, ghostMaterial);
    if (mesh.isSkinnedMesh) {
      ghost.bindMode = mesh.bindMode;
      ghost.bind(mesh.skeleton, mesh.bindMatrix);
    }
    ghost.position.copy(mesh.position);
    ghost.quaternion.copy(mesh.quaternion);
    ghost.scale.copy(mesh.scale);
    ghost.renderOrder = 999;
    mesh.parent.add(ghost);
  }
}

const envDepthTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);
envDepthTarget.depthTexture = new THREE.DepthTexture(window.innerWidth, window.innerHeight);
envDepthUniforms.envDepth.value = envDepthTarget.depthTexture;

window.addEventListener("resize", () => {
  envDepthTarget.setSize(window.innerWidth, window.innerHeight);
  envDepthUniforms.resolution.value.set(window.innerWidth, window.innerHeight);
});

const loader = new GLTFLoader();
loader.load("/assets/characters/adventurers/Characters/Mage.glb", (gltf) => {
  player = gltf.scene;
  player.position.copy(SPAWN);
  player.scale.setScalar(PLAYER_SCALE);
  player.traverse((node) => {
    if (node.isMesh) node.castShadow = true;
  });
  scene.add(player);
  addXRaySilhouette(player);

  mixer = new THREE.AnimationMixer(player);
  const idleClip = THREE.AnimationClip.findByName(gltf.animations, "Idle");
  const walkClip = THREE.AnimationClip.findByName(gltf.animations, "Walking_A");
  const attackClip = THREE.AnimationClip.findByName(gltf.animations, "2H_Melee_Attack_Slice");
  idleAction = mixer.clipAction(idleClip);
  walkAction = mixer.clipAction(walkClip);
  attackAction = mixer.clipAction(attackClip);
  attackAction.setLoop(THREE.LoopOnce);
  attackAction.clampWhenFinished = true;
  currentAction = idleAction;
  idleAction.play();

  mixer.addEventListener("finished", (e) => {
    if (e.action === attackAction) isAttacking = false;
  });
});

function setAction(next) {
  if (currentAction === next) return;
  currentAction.fadeOut(0.15);
  next.reset().fadeIn(0.15).play();
  currentAction = next;
}

// --- Camera mode (press V to toggle) ---------------------------------------
// "follow" is the normal player camera. "fixed" is a static elevated
// overview of the whole castle + surroundings, for looking at the layout
// rather than playing — pick a spot, it doesn't track the player at all.
// Untested against a real render (see commit message) — the numbers below
// are a starting guess, tune to taste.
let cameraMode = "follow";
const FIXED_CAMERA_POS = new THREE.Vector3(0, 55, 55);
const FIXED_CAMERA_TARGET = new THREE.Vector3(0, 0, 0);

// --- Input (WASD movement, up arrow to attack, V to toggle camera) --------
const keys = new Set();
window.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();
  keys.add(key);
  if (key === "arrowup" && attackAction && !isAttacking) {
    isAttacking = true;
    setAction(attackAction);
  }
  if (key === "v") {
    cameraMode = cameraMode === "follow" ? "fixed" : "follow";
  }
});
window.addEventListener("keyup", (e) => keys.delete(e.key.toLowerCase()));

function getInputVector() {
  let x = 0;
  let z = 0;
  if (keys.has("w")) z -= 1;
  if (keys.has("s")) z += 1;
  if (keys.has("a")) x -= 1;
  if (keys.has("d")) x += 1;
  const len = Math.hypot(x, z);
  if (len > 0) {
    x /= len;
    z /= len;
  }
  return { x, z, moving: len > 0 };
}

// Shortest signed distance from angle `a` to angle `b`, wrapped to [-PI, PI],
// so turning from e.g. -170° to 170° takes the short way through 180° rather
// than spinning almost all the way around.
function angleDelta(a, b) {
  let diff = (b - a) % (Math.PI * 2);
  if (diff > Math.PI) diff -= Math.PI * 2;
  if (diff < -Math.PI) diff += Math.PI * 2;
  return diff;
}

// --- Main loop ------------------------------------------------------------
const clock = new THREE.Clock();

function tick() {
  requestAnimationFrame(tick);
  const dt = clock.getDelta();

  if (player) {
    const input = getInputVector();

    // Attacking fully pauses movement (position, turning, and the walk/idle
    // animation state) — she stands still through the swing, then whatever
    // was held resumes normally once it finishes (see the mixer "finished"
    // listener above, which clears isAttacking).
    if (!isAttacking && input.moving) {
      player.position.x += input.x * PLAYER_SPEED * dt;
      player.position.z += input.z * PLAYER_SPEED * dt;
      resolveCollisions(player.position, PLAYER_RADIUS);
      facing.set(input.x, 0, input.z);
      const targetAngle = Math.atan2(facing.x, facing.z);
      const delta = angleDelta(player.rotation.y, targetAngle);
      const maxStep = TURN_SPEED * dt;
      player.rotation.y += THREE.MathUtils.clamp(delta, -maxStep, maxStep);
      setAction(walkAction);
    } else if (!isAttacking && idleAction) {
      setAction(idleAction);
    }

    if (cameraMode === "follow") {
      camera.position.copy(player.position).add(CAMERA_OFFSET);
      camera.lookAt(player.position.x, player.position.y + LOOK_HEIGHT, player.position.z);
    } else {
      camera.position.copy(FIXED_CAMERA_POS);
      camera.lookAt(FIXED_CAMERA_TARGET);
    }
  }

  if (mixer) mixer.update(dt);

  // Environment-only depth pre-pass for the X-ray silhouette (see
  // addXRaySilhouette above) — player hidden so her own meshes can never
  // occlude each other in the comparison, restored immediately after.
  if (player) {
    player.visible = false;
    renderer.setRenderTarget(envDepthTarget);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    player.visible = true;
  }

  renderer.render(scene, camera);
}
tick();
