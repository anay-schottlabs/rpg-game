import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { resolveCollisions } from "./collision.js";
import { createFloorArrow, setArrowLit } from "./arrow-icon.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x8fd0e0);

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
sun.position.set(18, 28, 18);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -24;
sun.shadow.camera.right = 24;
sun.shadow.camera.top = 24;
sun.shadow.camera.bottom = -24;
sun.shadow.camera.far = 70;
sun.shadow.bias = -0.0015; // avoids shadow-acne banding on large flat surfaces
scene.add(sun);

// --- Ground -------------------------------------------------------------
// #2cd8b8 is Nature Kit's own "grass" material color (checked directly
// against ground_grass.glb), for visual consistency with Nature Kit assets.
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(200, 200),
  new THREE.MeshStandardMaterial({ color: 0x2cd8b8 }),
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// --- Player (Mage) --------------------------------------------------------
// The Mage rig's raw bind-pose height is ~3.36 units — scaled down to a
// more human-scale ~0.94 units tall.
const PLAYER_SCALE = 0.28;
const PLAYER_RADIUS = 0.3; // collision circle, roughly her shoulder width at PLAYER_SCALE
const PLAYER_SPEED = 2.2; // units/sec — a brisk walk rather than a sprint
const TURN_SPEED = Math.PI * 2.5; // radians/sec — how fast the model turns to face movement
const CAMERA_OFFSET = new THREE.Vector3(0, 9, 9); // fixed angle — translates with the player, never rotates
const LOOK_HEIGHT = 0.6; // roughly chest height at PLAYER_SCALE, so the camera isn't aimed at her feet
const SPAWN = new THREE.Vector3(0, 0, 0);

// --- Spellcasting focus: hold Shift to reveal directional arrows ----------
// No spell logic yet — just the glow + arrow lightup feedback loop.
const FOCUS_ARROW_RADIUS = 1.4; // how far the ring of arrows sits from the player
const focusArrowOffsets = {
  up: new THREE.Vector3(0, 0, -FOCUS_ARROW_RADIUS),
  down: new THREE.Vector3(0, 0, FOCUS_ARROW_RADIUS),
  left: new THREE.Vector3(-FOCUS_ARROW_RADIUS, 0, 0),
  right: new THREE.Vector3(FOCUS_ARROW_RADIUS, 0, 0),
};
const focusArrows = {};
for (const direction of Object.keys(focusArrowOffsets)) {
  const arrow = createFloorArrow(direction, { size: 0.6 });
  arrow.visible = false;
  scene.add(arrow);
  focusArrows[direction] = arrow;
}
let isFocusing = false;
const castSequence = []; // order the arrows were pressed in — not consumed yet

let player = null;
let mixer = null;
let idleAction = null;
let walkAction = null;
let attackAction = null;
let currentAction = null;
let isAttacking = false;
let focusGlowMeshes = [];
const facing = new THREE.Vector3(0, 0, 1);

function setFocusGlowVisible(visible) {
  for (const glow of focusGlowMeshes) glow.visible = visible;
}

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
// below — so only real environment geometry can trigger the effect, never
// her own body.
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

// Adds a slightly-enlarged, backface-only twin of every mesh in `root` —
// the classic inverted-hull outline trick: since only the back faces render,
// the enlarged copy peeks out from behind the real mesh's silhouette as a
// thin rim, giving a "glow" without any post-processing. Starts hidden;
// setFocusGlowVisible() toggles it with the Shift-to-focus state.
function addFocusGlow(root) {
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0x9a6bff,
    side: THREE.BackSide,
    transparent: true,
    opacity: 0.6,
  });

  const meshes = [];
  root.traverse((node) => {
    if (node.isMesh) meshes.push(node);
  });

  const glowMeshes = [];
  for (const mesh of meshes) {
    const glow = mesh.isSkinnedMesh
      ? new THREE.SkinnedMesh(mesh.geometry, glowMaterial)
      : new THREE.Mesh(mesh.geometry, glowMaterial);
    if (mesh.isSkinnedMesh) {
      glow.bindMode = mesh.bindMode;
      glow.bind(mesh.skeleton, mesh.bindMatrix);
    }
    glow.position.copy(mesh.position);
    glow.quaternion.copy(mesh.quaternion);
    glow.scale.copy(mesh.scale).multiplyScalar(1.08);
    glow.visible = false;
    mesh.parent.add(glow);
    glowMeshes.push(glow);
  }
  return glowMeshes;
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
  focusGlowMeshes = addFocusGlow(player);

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

// --- Input (WASD movement, up arrow to attack, Shift to focus-cast) -------
const DIRECTION_KEYS = {
  arrowup: "up",
  arrowdown: "down",
  arrowleft: "left",
  arrowright: "right",
};

const keys = new Set();
window.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();
  keys.add(key);

  if (key === "shift" && !isFocusing) {
    isFocusing = true;
    castSequence.length = 0;
    setFocusGlowVisible(true);
    for (const arrow of Object.values(focusArrows)) {
      arrow.visible = true;
      setArrowLit(arrow, false);
    }
    return;
  }

  // While focusing, arrow keys light up the corresponding arrow instead of
  // steering the camera-relative attack — no spell is cast yet, this just
  // records and displays the sequence.
  if (isFocusing && DIRECTION_KEYS[key]) {
    const direction = DIRECTION_KEYS[key];
    castSequence.push(direction);
    setArrowLit(focusArrows[direction], true);
    return;
  }

  if (key === "arrowup" && attackAction && !isAttacking) {
    isAttacking = true;
    setAction(attackAction);
  }
});
window.addEventListener("keyup", (e) => {
  const key = e.key.toLowerCase();
  keys.delete(key);
  if (key === "shift") {
    isFocusing = false;
    setFocusGlowVisible(false);
    for (const arrow of Object.values(focusArrows)) arrow.visible = false;
  }
});

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

    // Attacking and focus-casting both fully pause movement (position,
    // turning, and the walk/idle animation state) — she stands still until
    // the swing finishes or Shift is released, then whatever was held
    // resumes normally (see the mixer "finished" listener, which clears
    // isAttacking, and the Shift keyup handler, which clears isFocusing).
    if (!isAttacking && !isFocusing && input.moving) {
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

    if (isFocusing) {
      for (const [direction, offset] of Object.entries(focusArrowOffsets)) {
        focusArrows[direction].position.copy(player.position).add(offset);
        focusArrows[direction].position.y = 0.01;
      }
    }

    camera.position.copy(player.position).add(CAMERA_OFFSET);
    camera.lookAt(player.position.x, player.position.y + LOOK_HEIGHT, player.position.z);
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
