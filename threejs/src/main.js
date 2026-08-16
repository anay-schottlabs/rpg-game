import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { resolveCollisions } from "./collision.js";
import { createFloorArrow, setArrowLit } from "./arrow-icon.js";
import { createFocusParticles } from "./focus-particles.js";
import { createDashEffects } from "./dash-effects.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x8fd0e0);

const BASE_FOV = 50;
const camera = new THREE.PerspectiveCamera(BASE_FOV, window.innerWidth / window.innerHeight, 0.1, 150);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// A gentle screen warp + chromatic fringing that ramps in while focus-casting
// (driven by uStrength, see tick()) — at uStrength 0 the math collapses to
// an identity pass, so it costs nothing outside of casting.
const MagicDistortionShader = {
  uniforms: {
    tDiffuse: { value: null },
    uStrength: { value: 0 },
    uTime: { value: 0 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uStrength;
    uniform float uTime;
    varying vec2 vUv;
    void main() {
      vec2 centered = vUv - 0.5;
      float dist = length(centered);

      float ripple = sin(dist * 24.0 - uTime * 4.0);
      vec2 uv = vUv - centered * ripple * uStrength * 0.03;

      vec2 aberration = centered * uStrength * 0.012;
      float r = texture2D(tDiffuse, uv + aberration).r;
      float g = texture2D(tDiffuse, uv).g;
      float b = texture2D(tDiffuse, uv - aberration).b;
      vec3 color = vec3(r, g, b);

      float vignette = smoothstep(0.9, 0.3, dist);
      color = mix(color, color * vignette, uStrength * 0.5);

      gl_FragColor = vec4(color, 1.0);
    }
  `,
};

const magicDistortionPass = new ShaderPass(MagicDistortionShader);
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(magicDistortionPass);
composer.addPass(new OutputPass());

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
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
// No spell logic yet — just the slow-mo/zoom/distortion + arrow lightup feel.
const FOCUS_ARROW_RADIUS = 1.4; // how far the ring of arrows sits from the player
const FOCUS_TIME_SCALE = 0.2; // player movement/turning/animation speed while focusing
const FOCUS_FOV = 36; // camera zooms in toward this FOV while focusing
const FOCUS_BLEND_SPEED = 5; // how fast the zoom/distortion ramp in and out
const ARROW_LIT_DURATION_MS = 250; // how long a pressed arrow flashes lit before turning back off
const focusArrowOffsets = {
  up: new THREE.Vector3(0, 0, -FOCUS_ARROW_RADIUS),
  down: new THREE.Vector3(0, 0, FOCUS_ARROW_RADIUS),
  left: new THREE.Vector3(-FOCUS_ARROW_RADIUS, 0, 0),
  right: new THREE.Vector3(FOCUS_ARROW_RADIUS, 0, 0),
};
const focusArrows = {};
const arrowLitTimers = {}; // direction -> pending setTimeout id that turns it back off
for (const direction of Object.keys(focusArrowOffsets)) {
  const arrow = createFloorArrow(direction, { size: 0.6 });
  arrow.visible = false;
  scene.add(arrow);
  focusArrows[direction] = arrow;
}
let isFocusing = false;
let focusBlend = 0; // smoothed 0..1 toward isFocusing, drives zoom/distortion
const castSequence = []; // order the arrows were pressed in — not consumed yet

// --- Dash spell: double-tap the direction you're moving in, then release
// Shift, to dash that way. The two taps don't have to be identical — each
// just has to match whichever way she's currently moving at the moment of
// that press — diagonal movement (e.g. W+D) requires both matching arrow
// keys pressed (in either order) to complete that tap.
const DASH_DISTANCE = 3.2; // units covered by a dash
const DASH_DURATION = 0.16; // seconds
const REQUIRED_DASH_TAPS = 2;
let dashTapCount = 0;
let dashDirectionKeys = null; // Set<"up"|"down"|"left"|"right"> the taps last matched
const pressedThisTap = new Set(); // arrow-key directions pressed toward the current tap
let isDashing = false;
let dashTimer = 0;
const dashStartPos = new THREE.Vector3();
const dashTargetPos = new THREE.Vector3();
let dashAfterimageCooldown = 0;
let dashDistortionKick = 0; // extra screen-warp punch on top of focusBlend, decays after a dash

function currentMovementDirections() {
  const dirs = new Set();
  if (keys.has("w")) dirs.add("up");
  if (keys.has("s")) dirs.add("down");
  if (keys.has("a")) dirs.add("left");
  if (keys.has("d")) dirs.add("right");
  return dirs;
}

function directionSetsEqual(a, b) {
  if (a.size !== b.size) return false;
  for (const value of a) if (!b.has(value)) return false;
  return true;
}

// Same up=-Z/down=+Z/left=-X/right=+X convention as ARROW_DIRECTIONS and
// getInputVector's WASD mapping.
function directionSetToVector(dirs) {
  const v = new THREE.Vector3();
  if (dirs.has("up")) v.z -= 1;
  if (dirs.has("down")) v.z += 1;
  if (dirs.has("left")) v.x -= 1;
  if (dirs.has("right")) v.x += 1;
  return v.lengthSq() > 0 ? v.normalize() : null;
}

function startDash(directionKeys) {
  const dir = directionSetToVector(directionKeys);
  if (!dir || !player) return;

  isDashing = true;
  dashTimer = 0;
  dashAfterimageCooldown = 0;
  dashStartPos.copy(player.position);
  dashTargetPos.copy(player.position).addScaledVector(dir, DASH_DISTANCE);
  resolveCollisions(dashTargetPos, PLAYER_RADIUS);

  facing.copy(dir);
  player.rotation.y = Math.atan2(dir.x, dir.z);
  setAction(walkAction);

  dashEffects.spawnBurst(player.position, dir);
  dashDistortionKick = 1;
}

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
    ghost.userData.isEffectMesh = true; // skip when dash-effects.js snapshots the player
    mesh.parent.add(ghost);
  }
}

const FOCUS_GLOW_COLOR = 0xffdd44; // warm gold — shared by the outline rim and the sparkle particles

// Shared by every glow mesh below so tick() can pulse opacity on one
// material instead of walking the whole list every frame.
const focusGlowMaterial = new THREE.MeshBasicMaterial({
  color: FOCUS_GLOW_COLOR,
  side: THREE.BackSide,
  transparent: true,
  opacity: 0.75,
});

// Adds a noticeably-enlarged, backface-only twin of every mesh in `root` —
// the classic inverted-hull outline trick: since only the back faces render,
// the enlarged copy peeks out from behind the real mesh's silhouette as a
// thick rim, giving a "glow" without any post-processing. Starts hidden;
// setFocusGlowVisible() toggles it with the Shift-to-focus state.
function addFocusGlow(root) {
  const meshes = [];
  root.traverse((node) => {
    if (node.isMesh) meshes.push(node);
  });

  const glowMeshes = [];
  for (const mesh of meshes) {
    const glow = mesh.isSkinnedMesh
      ? new THREE.SkinnedMesh(mesh.geometry, focusGlowMaterial)
      : new THREE.Mesh(mesh.geometry, focusGlowMaterial);
    if (mesh.isSkinnedMesh) {
      glow.bindMode = mesh.bindMode;
      glow.bind(mesh.skeleton, mesh.bindMatrix);
    }
    glow.position.copy(mesh.position);
    glow.quaternion.copy(mesh.quaternion);
    glow.scale.copy(mesh.scale).multiplyScalar(1.3);
    glow.visible = false;
    glow.userData.isEffectMesh = true; // skip when dash-effects.js snapshots the player
    mesh.parent.add(glow);
    glowMeshes.push(glow);
  }
  return glowMeshes;
}

// Sparkle motes that spawn around the player and rise while focusing — the
// actual "emanating" part of the glow, on top of the static outline rim.
const focusParticles = createFocusParticles(FOCUS_GLOW_COLOR);
scene.add(focusParticles.group);

// Spark burst + frozen-pose afterimage trail for the dash spell (see startDash below).
const dashEffects = createDashEffects(FOCUS_GLOW_COLOR);
scene.add(dashEffects.group);

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
  const alreadyDown = keys.has(key);
  keys.add(key);

  if (key === "shift" && !isFocusing && !isDashing) {
    isFocusing = true;
    castSequence.length = 0;
    dashTapCount = 0;
    dashDirectionKeys = null;
    pressedThisTap.clear();
    setFocusGlowVisible(true);
    for (const [direction, arrow] of Object.entries(focusArrows)) {
      clearTimeout(arrowLitTimers[direction]);
      arrow.visible = true;
      setArrowLit(arrow, false);
    }
    return;
  }

  // While focusing, arrow keys flash the corresponding arrow lit (then back
  // off after ARROW_LIT_DURATION_MS) instead of steering the camera-relative
  // attack — no spell is cast yet, this just records and displays the
  // sequence as it's pressed.
  if (isFocusing && DIRECTION_KEYS[key]) {
    const direction = DIRECTION_KEYS[key];
    castSequence.push(direction);
    setArrowLit(focusArrows[direction], true);
    clearTimeout(arrowLitTimers[direction]);
    arrowLitTimers[direction] = setTimeout(() => {
      setArrowLit(focusArrows[direction], false);
    }, ARROW_LIT_DURATION_MS);

    // Dash tap-matching: ignore OS key-repeat (alreadyDown) so holding a key
    // doesn't rack up taps by itself — only fresh presses count. A press in
    // a direction she isn't currently moving (or isn't moving at all) is a
    // miss and resets progress; otherwise it contributes toward the current
    // tap, which completes once every direction of her current movement has
    // been pressed (both arrows together for a diagonal).
    if (!alreadyDown) {
      const movementDirs = currentMovementDirections();
      if (movementDirs.size === 0 || !movementDirs.has(direction)) {
        dashTapCount = 0;
        pressedThisTap.clear();
      } else {
        pressedThisTap.add(direction);
        if (directionSetsEqual(pressedThisTap, movementDirs)) {
          dashTapCount += 1;
          dashDirectionKeys = new Set(movementDirs);
          pressedThisTap.clear();
        }
      }
    }
    return;
  }

  if (key === "arrowup" && attackAction && !isAttacking && !isDashing) {
    isAttacking = true;
    setAction(attackAction);
  }
});
window.addEventListener("keyup", (e) => {
  const key = e.key.toLowerCase();
  keys.delete(key);
  if (key === "shift") {
    if (isFocusing && dashTapCount >= REQUIRED_DASH_TAPS && dashDirectionKeys) {
      startDash(dashDirectionKeys);
    }
    isFocusing = false;
    dashTapCount = 0;
    dashDirectionKeys = null;
    pressedThisTap.clear();
    setFocusGlowVisible(false);
    for (const [direction, arrow] of Object.entries(focusArrows)) {
      clearTimeout(arrowLitTimers[direction]);
      arrow.visible = false;
    }
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
let elapsedTime = 0;

function tick() {
  requestAnimationFrame(tick);
  const dt = clock.getDelta();
  elapsedTime += dt;

  // The camera zoom/distortion ramp runs in real time regardless, but the
  // player's own movement, turning, and animation slow way down while
  // focusing — "she's moving through syrup while the world stays normal
  // speed" is the read we're going for.
  focusBlend += ((isFocusing ? 1 : 0) - focusBlend) * Math.min(1, dt * FOCUS_BLEND_SPEED);
  const effectiveDt = isFocusing ? dt * FOCUS_TIME_SCALE : dt;

  dashDistortionKick = Math.max(0, dashDistortionKick - dt * 3);

  if (player) {
    const input = getInputVector();

    if (isDashing) {
      // Dashing owns position for its short duration — always real-time
      // (focus, and its slow-mo, has already ended by the time a dash
      // starts) and eased so it launches fast and eases into the landing.
      dashTimer += dt;
      const t = Math.min(1, dashTimer / DASH_DURATION);
      const eased = 1 - Math.pow(1 - t, 3);
      player.position.lerpVectors(dashStartPos, dashTargetPos, eased);
      resolveCollisions(player.position, PLAYER_RADIUS);

      dashAfterimageCooldown -= dt;
      if (dashAfterimageCooldown <= 0) {
        dashAfterimageCooldown = 0.025;
        dashEffects.spawnAfterimage(player);
      }

      if (t >= 1) isDashing = false;
    } else if (!isAttacking && input.moving) {
      // Attacking fully pauses movement; focus-casting only slows it (via
      // effectiveDt above) — she can still walk around while lighting up
      // arrows mid-cast.
      player.position.x += input.x * PLAYER_SPEED * effectiveDt;
      player.position.z += input.z * PLAYER_SPEED * effectiveDt;
      resolveCollisions(player.position, PLAYER_RADIUS);
      facing.set(input.x, 0, input.z);
      const targetAngle = Math.atan2(facing.x, facing.z);
      const delta = angleDelta(player.rotation.y, targetAngle);
      const maxStep = TURN_SPEED * effectiveDt;
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
      focusGlowMaterial.opacity = 0.6 + Math.sin(elapsedTime * 6) * 0.15;
    }
    // Both run every frame (not just while active) so particles/afterimages
    // already in flight finish their arc instead of vanishing abruptly.
    focusParticles.update(dt, player.position, isFocusing);
    dashEffects.update(dt);

    camera.position.copy(player.position).add(CAMERA_OFFSET);
    camera.lookAt(player.position.x, player.position.y + LOOK_HEIGHT, player.position.z);
  }

  camera.fov = THREE.MathUtils.lerp(BASE_FOV, FOCUS_FOV, focusBlend);
  camera.updateProjectionMatrix();
  magicDistortionPass.uniforms.uStrength.value = Math.max(focusBlend, dashDistortionKick);
  magicDistortionPass.uniforms.uTime.value = elapsedTime;

  if (mixer) mixer.update(effectiveDt);

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

  composer.render();
}
tick();
