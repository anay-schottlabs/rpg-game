import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { resolveCollisions } from "./collision.js";
import { createFloorArrow, setArrowLit, setArrowError } from "./arrow-icon.js";
import { createFocusParticles } from "./focus-particles.js";
import { createDashEffects } from "./dash-effects.js";
import { createShockwaveEffect } from "./shockwave-effects.js";
import { createStoneEdgeEffect, STONE_EDGE_LINE_LENGTH } from "./stone-edge-effects.js";
import { createHealthBar } from "./health-bar.js";
import { createNetwork } from "./network.js";
import { createRemotePlayer } from "./remote-player.js";
import { createConnectMenu } from "./connect-menu.js";
import { createDeathOverlay } from "./death-overlay.js";
import { distanceToPoint, distanceToSegment, SHOCKWAVE_DAMAGE, SHOCKWAVE_HIT_RADIUS, STONE_EDGE_DAMAGE, STONE_EDGE_HIT_HALF_WIDTH } from "./combat.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x8fd0e0);

const healthBar = createHealthBar({ max: 100 });

// --- Multiplayer (Trystero, P2P — see network.js for the message shapes) --
const RESPAWN_SECONDS = 3;
const network = createNetwork();
const connectMenu = createConnectMenu({
  onConnect: (roomId) => network.connect(roomId),
  onDisconnect: () => network.disconnect(),
});
const deathOverlay = createDeathOverlay();
const remotePlayers = new Map(); // peerId -> RemotePlayer
let gltfTemplate = null; // the loaded Mage gltf (scene + animations), cached so remote avatars can clone it without a second fetch
let isDead = false;
let hitFlash = 0; // 0..1, decays — drives damageVignettePass's transient punch on taking a hit
let networkSendTimer = 0;
const NETWORK_SEND_INTERVAL = 1 / 15; // throttle local state broadcasts to ~15/s

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") connectMenu.toggle();
});

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
// High threshold keeps this cheap-and-global rather than a true selective
// bloom: only very bright/emissive pixels (the lit arrows, focus particles,
// glow rim, dash sparks) are hot enough to catch it, so the sunlit ground
// and buildings stay unaffected — "a tiny bit" of bloom on the magic bits.
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.4, 0.35, 0.85);

// A red vignette that builds in as missing health grows (uIntensity), plus a
// transient punch on the exact frame a hit lands (uHitFlash, decays like
// effectDistortionKick elsewhere) — the "distortion and red blurs as players
// take more damage" feedback.
const DamageVignetteShader = {
  uniforms: {
    tDiffuse: { value: null },
    uIntensity: { value: 0 },
    uHitFlash: { value: 0 },
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
    uniform float uIntensity;
    uniform float uHitFlash;
    varying vec2 vUv;
    void main() {
      vec2 centered = vUv - 0.5;
      float dist = length(centered);
      vec4 color = texture2D(tDiffuse, vUv);

      float vignette = smoothstep(0.25, 0.85, dist);
      float redAmount = clamp(vignette * uIntensity * 0.7 + uHitFlash * 0.5, 0.0, 1.0);
      color.rgb = mix(color.rgb, vec3(0.5, 0.02, 0.02), redAmount);

      gl_FragColor = color;
    }
  `,
};
const damageVignettePass = new ShaderPass(DamageVignetteShader);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(bloomPass);
composer.addPass(magicDistortionPass);
composer.addPass(damageVignettePass);
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
// keys pressed (in either order) to complete that tap. Nothing flashes red
// (or otherwise interrupts her) while she's pressing keys, but ANY press
// that doesn't match her current movement — even one mixed in among
// otherwise-correct taps — invalidates the whole cast; it's only reported
// (via the red flash) once Shift is released.
const DASH_DISTANCE = 3.2; // units covered by a dash
const DASH_DURATION = 0.16; // seconds
const REQUIRED_DASH_TAPS = 2;
let dashTapCount = 0;
let dashDirectionKeys = null; // Set<"up"|"down"|"left"|"right"> the taps last matched
let standStillDirection = null; // while stationary, the single direction the first press locked onto — the second press must match this, not just itself
const pressedThisTap = new Set(); // arrow-key directions pressed toward the current tap
let anyDirectionPressed = false; // whether *any* arrow was pressed this focus — distinguishes "no attempt" from "wrong attempt"
let dashSequenceValid = true; // flips false the moment any mismatched key is pressed, for the rest of this focus
let isDashing = false;
let dashTimer = 0;
const dashStartPos = new THREE.Vector3();
const dashTargetPos = new THREE.Vector3();
let dashAfterimageCooldown = 0;
let effectDistortionKick = 0; // extra screen-warp punch on top of focusBlend, decays after a dash/shockwave
let cameraShake = 0; // 0..1, decays after a big impact (the shockwave's ground contact)

const DASH_ERROR_FLASH_MS = 220; // how long arrows flash red after a fizzled cast
let dashErrorFlashTimer = null;

// Flashes every focus arrow red then hides them — called once Shift is
// released on an attempted-but-incomplete cast (see the keyup handler).
function flashDashError() {
  clearTimeout(dashErrorFlashTimer);
  for (const [direction, arrow] of Object.entries(focusArrows)) {
    clearTimeout(arrowLitTimers[direction]);
    setArrowError(arrow, true);
  }
  dashErrorFlashTimer = setTimeout(() => {
    for (const arrow of Object.values(focusArrows)) {
      setArrowError(arrow, false);
      arrow.visible = false;
    }
  }, DASH_ERROR_FLASH_MS);
}

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

// Collapses a facing vector to whichever of the 4 arrow directions it's
// closest to (dominant axis wins), same convention as above.
function vectorToDirection(v) {
  if (Math.abs(v.x) > Math.abs(v.z)) return v.x > 0 ? "right" : "left";
  return v.z > 0 ? "down" : "up";
}

const OPPOSITE_DIRECTION = { up: "down", down: "up", left: "right", right: "left" };

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
  effectDistortionKick = 1;
  network.sendCast({ type: "dash", pos: player.position.toArray(), dir: dir.toArray() });
}

// --- Shockwave spell: press up, right, down, left (in exactly that order,
// nothing else mixed in) then release Shift. Unlike the dash this doesn't
// care what she's moving — it's a fixed sequence, checked by comparing the
// full castSequence array once Shift is released.
const SHOCKWAVE_SEQUENCE = ["up", "right", "down", "left"];
// The rig has no dedicated "slam the staff into the ground" clip — checked
// every animation on the Mage by scrubbing the mixer and sampling the
// 2H_Staff bone's world-space height frame-by-frame in the browser.
// 1H_Melee_Attack_Chop was the best match: a real windup-then-fast-strike
// arc (unlike e.g. Spellcast_Raise, which just eases back to rest). Its
// staff height bottoms out at t=0.87s of its 1.07s duration — that's the
// contact frame the shockwave effect is timed to, not just "play on cast".
const SHOCKWAVE_ANIMATION_NAME = "1H_Melee_Attack_Chop";
const SHOCKWAVE_CONTACT_TIME = 0.87;
let isShockwaving = false;
let shockwaveAction = null;
let shockwaveContactTimer = 0;
let shockwaveEffectFired = false; // whether the ring/burst has gone off yet for the in-progress cast

function sequenceMatches(sequence, pattern) {
  return sequence.length === pattern.length && sequence.every((value, i) => value === pattern[i]);
}

function triggerShockwave() {
  if (!player) return;
  isShockwaving = true;
  shockwaveContactTimer = 0;
  shockwaveEffectFired = false;
  if (shockwaveAction) setAction(shockwaveAction);
}

// --- Stone Edge spell: press the direction she's facing twice, then the
// opposite direction once (exactly that, nothing else mixed in), then
// release Shift. The required sequence is snapshotted from her facing when
// focus starts — e.g. facing "up" means the cast is up, up, down — so it
// always lines up with the direction the crystal line actually erupts in
// (see stoneEdgeEffect.trigger(player.position, facing) below). A line of
// crystal spikes erupts away from her, ending in a bigger final spike —
// see stone-edge-effects.js. Doesn't correspond to a measured
// animation-contact frame like the shockwave (it's a channeled cast, not a
// strike) — timed instead to land a beat after the staff-raise gesture starts.
const STONE_EDGE_ANIMATION_NAME = "Spellcast_Raise";
const STONE_EDGE_TRIGGER_TIME = 0.5;
let stoneEdgeSequence = null; // Set at focus-start from facing; null means "not available this focus"
const stoneEdgeFacing = new THREE.Vector3(); // facing, snapshotted at focus-start alongside stoneEdgeSequence
let isStoneEdging = false;
let stoneEdgeAction = null;
let stoneEdgeContactTimer = 0;
let stoneEdgeEffectFired = false;

function triggerStoneEdge() {
  if (!player) return;
  isStoneEdging = true;
  stoneEdgeContactTimer = 0;
  stoneEdgeEffectFired = false;
  if (stoneEdgeAction) setAction(stoneEdgeAction);
}

let player = null;
let mixer = null;
let idleAction = null;
let walkAction = null;
let deathAction = null;
let currentAction = null;
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

// Expanding ring + spark burst for the shockwave spell (see triggerShockwave above).
const shockwaveEffect = createShockwaveEffect(FOCUS_GLOW_COLOR);
scene.add(shockwaveEffect.group);

// Traveling line of crystal spikes for the Stone Edge spell (see triggerStoneEdge above).
const stoneEdgeEffect = createStoneEdgeEffect(FOCUS_GLOW_COLOR);
scene.add(stoneEdgeEffect.group);

const envDepthTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);
envDepthTarget.depthTexture = new THREE.DepthTexture(window.innerWidth, window.innerHeight);
envDepthUniforms.envDepth.value = envDepthTarget.depthTexture;

window.addEventListener("resize", () => {
  envDepthTarget.setSize(window.innerWidth, window.innerHeight);
  envDepthUniforms.resolution.value.set(window.innerWidth, window.innerHeight);
});

const loader = new GLTFLoader();
loader.load(`${import.meta.env.BASE_URL}assets/characters/adventurers/Characters/Mage.glb`, (gltf) => {
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
  const deathClip = THREE.AnimationClip.findByName(gltf.animations, "Death_A");
  const shockwaveClip = THREE.AnimationClip.findByName(gltf.animations, SHOCKWAVE_ANIMATION_NAME);
  const stoneEdgeClip = THREE.AnimationClip.findByName(gltf.animations, STONE_EDGE_ANIMATION_NAME);
  idleAction = mixer.clipAction(idleClip);
  walkAction = mixer.clipAction(walkClip);
  deathAction = mixer.clipAction(deathClip);
  deathAction.setLoop(THREE.LoopOnce);
  deathAction.clampWhenFinished = true;
  shockwaveAction = mixer.clipAction(shockwaveClip);
  shockwaveAction.setLoop(THREE.LoopOnce);
  shockwaveAction.clampWhenFinished = true;
  stoneEdgeAction = mixer.clipAction(stoneEdgeClip);
  stoneEdgeAction.setLoop(THREE.LoopOnce);
  stoneEdgeAction.clampWhenFinished = true;
  currentAction = idleAction;
  idleAction.play();

  mixer.addEventListener("finished", (e) => {
    if (e.action === shockwaveAction) isShockwaving = false;
    if (e.action === stoneEdgeAction) isStoneEdging = false;
  });

  gltfTemplate = gltf; // cached so remote-player.js can clone it without a second network fetch
});

function setAction(next) {
  if (currentAction === next) return;
  currentAction.fadeOut(0.15);
  next.reset().fadeIn(0.15).play();
  currentAction = next;
}

// --- Death / respawn --------------------------------------------------
function handleDeath() {
  if (isDead || !player) return;
  isDead = true;
  if (deathAction) setAction(deathAction);
  deathOverlay.show(RESPAWN_SECONDS);
  network.sendDeath({ pos: player.position.toArray() });
  setTimeout(handleRespawn, RESPAWN_SECONDS * 1000);
}

function handleRespawn() {
  if (!player) return;
  isDead = false;
  player.position.copy(SPAWN);
  healthBar.setHealth(healthBar.max);
  deathOverlay.hide();
  if (idleAction) setAction(idleAction);
  network.sendRespawn({ pos: SPAWN.toArray() });
}

// --- Multiplayer wiring -------------------------------------------------
network.onPeerJoin = (peerId) => {
  if (!gltfTemplate || remotePlayers.has(peerId)) return;
  const remote = createRemotePlayer({ THREE, scene, gltfTemplate, scale: PLAYER_SCALE });
  remotePlayers.set(peerId, remote);
  connectMenu.setPeerCount(remotePlayers.size);
};

network.onPeerLeave = (peerId) => {
  const remote = remotePlayers.get(peerId);
  if (remote) {
    remote.dispose();
    remotePlayers.delete(peerId);
  }
  connectMenu.setPeerCount(remotePlayers.size);
};

network.onState = (data, peerId) => {
  const remote = remotePlayers.get(peerId);
  if (!remote) return;
  remote.setTargetTransform(data.pos, data.rotY);
  remote.setHealthRatio(data.health / healthBar.max);
  if (data.alive) remote.setAction(data.action); // don't fight the death pose while they're down
};

network.onCast = (data, peerId) => {
  const remote = remotePlayers.get(peerId);
  if (!remote) return;
  const origin = new THREE.Vector3(data.pos[0], data.pos[1], data.pos[2]);
  const dir = new THREE.Vector3(data.dir[0], data.dir[1], data.dir[2]);
  if (data.type === "dash") {
    dashEffects.spawnBurst(origin, dir);
  } else if (data.type === "shockwave") {
    shockwaveEffect.trigger(origin);
    remote.playCastAnimation("shockwave");
  } else if (data.type === "stoneEdge") {
    stoneEdgeEffect.trigger(origin, dir);
    remote.playCastAnimation("stoneEdge");
  }
};

network.onHit = (data) => {
  if (isDead) return;
  healthBar.damage(data.amount);
  hitFlash = 1;
  cameraShake = Math.max(cameraShake, 0.6);
  if (healthBar.value <= 0) handleDeath();
};

network.onDeath = (data, peerId) => {
  remotePlayers.get(peerId)?.playDeath();
};

network.onRespawn = (data, peerId) => {
  const remote = remotePlayers.get(peerId);
  if (!remote) return;
  remote.object3D.position.set(data.pos[0], data.pos[1], data.pos[2]);
  remote.setTargetTransform(data.pos, remote.object3D.rotation.y);
  remote.playRespawn();
};

// --- Input (WASD movement, Shift to focus-cast) ---------------------------
const DIRECTION_KEYS = {
  arrowup: "up",
  arrowdown: "down",
  arrowleft: "left",
  arrowright: "right",
};

const keys = new Set();
window.addEventListener("keydown", (e) => {
  if (connectMenu.isOpen) return; // room-code input handles its own keys; don't move the player while typing

  const key = e.key.toLowerCase();
  const alreadyDown = keys.has(key);
  keys.add(key);

  if (key === "shift" && !isFocusing && !isDashing && !isShockwaving && !isStoneEdging && !isDead) {
    isFocusing = true;
    castSequence.length = 0;
    dashTapCount = 0;
    dashDirectionKeys = null;
    pressedThisTap.clear();
    anyDirectionPressed = false;
    dashSequenceValid = true;
    standStillDirection = null;
    const facingDir = vectorToDirection(facing);
    stoneEdgeSequence = [facingDir, facingDir, OPPOSITE_DIRECTION[facingDir]];
    stoneEdgeFacing.copy(facing);
    setFocusGlowVisible(true);
    clearTimeout(dashErrorFlashTimer);
    for (const [direction, arrow] of Object.entries(focusArrows)) {
      clearTimeout(arrowLitTimers[direction]);
      arrow.visible = true;
      setArrowLit(arrow, false);
    }
    return;
  }

  // While focusing, arrow keys flash the corresponding arrow lit (then back
  // off after ARROW_LIT_DURATION_MS) — no spell is cast yet, this just
  // records and displays the sequence as it's pressed. She's free to press
  // any arrow she wants here; nothing is validated (or flashes red) until
  // Shift is released — see the keyup handler below.
  if (isFocusing && DIRECTION_KEYS[key]) {
    const direction = DIRECTION_KEYS[key];
    castSequence.push(direction);
    setArrowLit(focusArrows[direction], true);
    clearTimeout(arrowLitTimers[direction]);
    arrowLitTimers[direction] = setTimeout(() => {
      setArrowLit(focusArrows[direction], false);
    }, ARROW_LIT_DURATION_MS);

    // Dash tap-matching: ignore OS key-repeat (alreadyDown) so holding a key
    // doesn't rack up taps by itself — only fresh presses count. While she's
    // moving, a press has to match her current movement direction (both
    // arrows together for a diagonal). While standing still there's no
    // movement to match against, so the *first* press locks in a target
    // direction (no diagonal chord possible here, since nothing indicates
    // one was intended) and the second press has to match THAT SAME
    // direction — not just match itself, or any two different arrows
    // (e.g. the shockwave's up/right/down/left) would each trivially
    // complete their own "tap" and always resolve to a dash. A press that
    // doesn't match the reference is quietly noted (dashSequenceValid)
    // rather than shown — it doesn't disrupt her taps in progress, but it
    // means the cast can't succeed even if she goes on to complete a
    // valid-looking double-tap.
    if (!alreadyDown) {
      anyDirectionPressed = true;
      const movementDirs = currentMovementDirections();
      if (movementDirs.size > 0) {
        if (movementDirs.has(direction)) {
          pressedThisTap.add(direction);
          if (directionSetsEqual(pressedThisTap, movementDirs)) {
            dashTapCount += 1;
            dashDirectionKeys = new Set(movementDirs);
            pressedThisTap.clear();
          }
        } else {
          dashSequenceValid = false;
        }
      } else if (standStillDirection === null || direction === standStillDirection) {
        standStillDirection = direction;
        dashTapCount += 1;
        dashDirectionKeys = new Set([direction]);
      } else {
        dashSequenceValid = false;
      }
    }
    return;
  }
});
window.addEventListener("keyup", (e) => {
  if (connectMenu.isOpen) return;

  const key = e.key.toLowerCase();
  keys.delete(key);
  if (key === "shift") {
    const dashFired =
      isFocusing && dashSequenceValid && dashTapCount >= REQUIRED_DASH_TAPS && dashDirectionKeys;
    const shockwaveFired = isFocusing && !dashFired && sequenceMatches(castSequence, SHOCKWAVE_SEQUENCE);
    const stoneEdgeFired =
      isFocusing && !dashFired && !shockwaveFired && !!stoneEdgeSequence && sequenceMatches(castSequence, stoneEdgeSequence);

    if (dashFired) startDash(dashDirectionKeys);
    else if (shockwaveFired) triggerShockwave();
    else if (stoneEdgeFired) triggerStoneEdge();

    isFocusing = false;
    dashTapCount = 0;
    dashDirectionKeys = null;
    pressedThisTap.clear();
    setFocusGlowVisible(false);

    // Only flash if she actually pressed an arrow this focus but it didn't
    // add up to a spell — letting go of Shift without touching the arrows
    // at all isn't a failed cast, it's just not casting.
    if (!dashFired && !shockwaveFired && !stoneEdgeFired && anyDirectionPressed) {
      flashDashError();
    } else {
      for (const [direction, arrow] of Object.entries(focusArrows)) {
        clearTimeout(arrowLitTimers[direction]);
        arrow.visible = false;
      }
    }
    anyDirectionPressed = false;
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

  effectDistortionKick = Math.max(0, effectDistortionKick - dt * 3);

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
    } else if (!isShockwaving && !isStoneEdging && !isDead && input.moving) {
      // Casting a shockwave or Stone Edge fully pauses movement;
      // focus-casting only slows it (via effectiveDt above) — she can still
      // walk around while lighting up arrows mid-cast.
      player.position.x += input.x * PLAYER_SPEED * effectiveDt;
      player.position.z += input.z * PLAYER_SPEED * effectiveDt;
      resolveCollisions(player.position, PLAYER_RADIUS);
      facing.set(input.x, 0, input.z);
      const targetAngle = Math.atan2(facing.x, facing.z);
      const delta = angleDelta(player.rotation.y, targetAngle);
      const maxStep = TURN_SPEED * effectiveDt;
      player.rotation.y += THREE.MathUtils.clamp(delta, -maxStep, maxStep);
      setAction(walkAction);
    } else if (!isShockwaving && !isStoneEdging && !isDead && idleAction) {
      setAction(idleAction);
    }

    if (isFocusing) {
      for (const [direction, offset] of Object.entries(focusArrowOffsets)) {
        focusArrows[direction].position.copy(player.position).add(offset);
        focusArrows[direction].position.y = 0.01;
      }
      focusGlowMaterial.opacity = 0.6 + Math.sin(elapsedTime * 6) * 0.15;
    }

    // Fires the ring/burst at the animation's actual contact frame rather
    // than the instant the cast starts — see SHOCKWAVE_CONTACT_TIME above.
    if (isShockwaving && !shockwaveEffectFired) {
      shockwaveContactTimer += dt;
      if (shockwaveContactTimer >= SHOCKWAVE_CONTACT_TIME) {
        shockwaveEffectFired = true;
        shockwaveEffect.trigger(player.position);
        effectDistortionKick = 1;
        cameraShake = 1;
        network.sendCast({ type: "shockwave", pos: player.position.toArray(), dir: [0, 0, 0] });
        for (const [peerId, remote] of remotePlayers) {
          if (distanceToPoint(player.position, remote.object3D.position) <= SHOCKWAVE_HIT_RADIUS) {
            network.sendHit(peerId, { amount: SHOCKWAVE_DAMAGE, sourceType: "shockwave" });
          }
        }
      }
    }

    if (isStoneEdging && !stoneEdgeEffectFired) {
      stoneEdgeContactTimer += dt;
      if (stoneEdgeContactTimer >= STONE_EDGE_TRIGGER_TIME) {
        stoneEdgeEffectFired = true;
        stoneEdgeEffect.trigger(player.position, stoneEdgeFacing);
        effectDistortionKick = 1;
        cameraShake = 0.7;
        network.sendCast({ type: "stoneEdge", pos: player.position.toArray(), dir: stoneEdgeFacing.toArray() });
        const lineEnd = player.position.clone().addScaledVector(stoneEdgeFacing, STONE_EDGE_LINE_LENGTH);
        for (const [peerId, remote] of remotePlayers) {
          if (distanceToSegment(remote.object3D.position, player.position, lineEnd) <= STONE_EDGE_HIT_HALF_WIDTH) {
            network.sendHit(peerId, { amount: STONE_EDGE_DAMAGE, sourceType: "stoneEdge" });
          }
        }
      }
    }

    // Run every frame (not just while active) so particles/afterimages/spikes
    // already in flight finish their arc instead of vanishing abruptly.
    focusParticles.update(dt, player.position, isFocusing);
    dashEffects.update(dt);
    shockwaveEffect.update(dt);
    stoneEdgeEffect.update(dt);

    camera.position.copy(player.position).add(CAMERA_OFFSET);
    camera.lookAt(player.position.x, player.position.y + LOOK_HEIGHT, player.position.z);
    if (cameraShake > 0) {
      camera.position.x += (Math.random() - 0.5) * cameraShake * 0.5;
      camera.position.y += (Math.random() - 0.5) * cameraShake * 0.3;
      camera.position.z += (Math.random() - 0.5) * cameraShake * 0.5;
    }

    if (network.connected) {
      networkSendTimer += dt;
      if (networkSendTimer >= NETWORK_SEND_INTERVAL) {
        networkSendTimer = 0;
        network.sendState({
          pos: player.position.toArray(),
          rotY: player.rotation.y,
          action: currentAction === walkAction ? "walk" : "idle",
          health: healthBar.value,
          alive: !isDead,
        });
      }
    }
  }

  for (const remote of remotePlayers.values()) remote.update(dt);

  cameraShake = Math.max(0, cameraShake - dt * 4);
  hitFlash = Math.max(0, hitFlash - dt * 2.5);

  camera.fov = THREE.MathUtils.lerp(BASE_FOV, FOCUS_FOV, focusBlend);
  camera.updateProjectionMatrix();
  magicDistortionPass.uniforms.uStrength.value = Math.max(focusBlend, effectDistortionKick);
  magicDistortionPass.uniforms.uTime.value = elapsedTime;
  damageVignettePass.uniforms.uIntensity.value = 1 - healthBar.value / healthBar.max;
  damageVignettePass.uniforms.uHitFlash.value = hitFlash;

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
