// --- Setup ---------------------------------------------------------------

const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const spellbookEl = document.getElementById("spellbook");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// --- Input -----------------------------------------------------------------

const keys = {
  w: false,
  a: false,
  s: false,
  d: false,
  shift: false,
  e: false,
  q: false,
};

window.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();
  if (key in keys) keys[key] = true;
});

window.addEventListener("keyup", (e) => {
  const key = e.key.toLowerCase();
  if (key in keys) keys[key] = false;
});

// `keys` is declared with `const` at the top level of a classic script, so
// (unlike `var`) it does NOT automatically become `window.keys` — but the
// multiplayer module scripts need to read it, and modules can only see true
// globals. This is one of a handful of explicit bridges across that
// classic-script/module boundary; see js/multiplayer/peer-sync.js.
window.keys = keys;

// --- World shape -------------------------------------------------------------

// The world is a circle, not a rectangle. Movement is capped well short of
// WORLD_RADIUS (see PLAYER_MAX_RADIUS), so there's always a deep band of
// forest between the player and the true edge — approaching the boundary
// reads as "the trees get thicker," never as a hard stop into empty ground.
const WORLD_RADIUS = 2700;
const WORLD_CENTER = { x: WORLD_RADIUS, y: WORLD_RADIUS };
const PLAYER_MAX_RADIUS = 2400;

const CLEARING_RADIUS = 260; // no trees inside this ring around the campfire
const RING_END = 420; // trees ramp up to full density by this radius
const WALL_START = 2150; // the dense boundary forest begins here
const WALL_END = 3300; // extends well past WORLD_RADIUS so wide screens never see past it

function distFromCenter(x, y) {
  return Math.hypot(x - WORLD_CENTER.x, y - WORLD_CENTER.y);
}

// Uniform-area sample of an annulus around the world center. Routed through
// RNG (see js/rng.js) rather than bare Math.random() because everything
// world generation touches must be reproducible from a shared seed so every
// player in a multiplayer session generates an identical world.
function sampleAnnulus(rMin, rMax) {
  const r = Math.sqrt(rMin * rMin + RNG.random() * (rMax * rMax - rMin * rMin));
  const theta = RNG.random() * Math.PI * 2;
  return { x: WORLD_CENTER.x + Math.cos(theta) * r, y: WORLD_CENTER.y + Math.sin(theta) * r };
}

// Places items one at a time, skipping any that fail a density check or land
// too close to something already placed, and records accepted ones in the
// shared spatial index so later categories avoid them too.
function scatterWithDensity({ count, maxAttempts, sample, densityAt, footprintRadius, overlapAllowance, build }) {
  const results = [];
  let attempts = 0;
  while (results.length < count && attempts < maxAttempts) {
    attempts++;
    const { x, y } = sample();
    const density = densityAt ? densityAt(x, y) : 1;
    if (density <= 0) continue;
    if (density < 1 && RNG.random() > density) continue;

    const item = build(x, y);
    const radius = footprintRadius(item);
    if (spatialIndex.hasOverlap(x, y, radius, overlapAllowance)) continue;

    spatialIndex.insert(x, y, radius);
    results.push(item);
  }
  return results;
}

// --- Player movement & rendering (shared with multiplayer) -----------------

const PLAYER_BASE_SPEED = 220; // pixels per second
const DASH_SPEED_MULTIPLIER = 2.6;
const DASH_DURATION = 0.18; // seconds the burst itself lasts
const DASH_COOLDOWN = 0.6; // seconds before another dash can start
const CAST_SPEED_MULTIPLIER = 0.12; // drastic slowdown while channeling a spell

// Pure movement step used by both the local Player class below AND, in
// multiplayer, js/multiplayer/host-sim.js — which drives every remote
// player through this exact same function every frame so movement rules
// are identical no matter who's simulating whom. `state` is mutated in
// place ({x,y,facingX,facingY,dashTimeLeft,dashCooldownLeft,isCasting}).
// `input` is {dx,dy,shift,e} where dx/dy are raw -1/0/1 axis intent.
function simulatePlayerMovement(state, input, dt) {
  const hasInput = input.dx !== 0 || input.dy !== 0;
  state.isCasting = input.e;

  if (state.dashCooldownLeft > 0) state.dashCooldownLeft -= dt;
  if (state.dashTimeLeft > 0) state.dashTimeLeft -= dt;

  if (hasInput) {
    // Normalize so diagonal movement isn't faster, and keep the exact
    // (possibly diagonal) direction for the facing indicator.
    const len = Math.hypot(input.dx, input.dy);
    const dx = input.dx / len;
    const dy = input.dy / len;
    state.facingX = dx;
    state.facingY = dy;

    // Holding shift while moving triggers a quick speed burst, capped by a
    // cooldown. Casting locks that out — you plant your feet to channel.
    if (!state.isCasting && input.shift && state.dashCooldownLeft <= 0) {
      state.dashTimeLeft = DASH_DURATION;
      state.dashCooldownLeft = DASH_COOLDOWN;
    }

    let speed = state.dashTimeLeft > 0 ? PLAYER_BASE_SPEED * DASH_SPEED_MULTIPLIER : PLAYER_BASE_SPEED;
    if (state.isCasting) speed = PLAYER_BASE_SPEED * CAST_SPEED_MULTIPLIER;

    state.x += dx * speed * dt;
    state.y += dy * speed * dt;
  }

  const dist = distFromCenter(state.x, state.y);
  if (dist > PLAYER_MAX_RADIUS) {
    const scale = PLAYER_MAX_RADIUS / dist;
    state.x = WORLD_CENTER.x + (state.x - WORLD_CENTER.x) * scale;
    state.y = WORLD_CENTER.y + (state.y - WORLD_CENTER.y) * scale;
  }
}
window.simulatePlayerMovement = simulatePlayerMovement; // bridge for host-sim.js

// Shared visual for any player-shaped thing: the local player, or a remote
// player rendered from multiplayer state. `state` needs at minimum
// {x,y,facingX,facingY}; radius/color/dashTimeLeft/isCasting are optional.
function drawPlayerLike(ctx, camera, state) {
  const screenX = state.x - camera.x;
  const screenY = state.y - camera.y;
  const radius = state.radius || 14;
  const color = state.color || "#e0b64a";

  // Shadow
  ctx.beginPath();
  ctx.ellipse(screenX, screenY + radius * 0.7, radius * 0.8, radius * 0.35, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
  ctx.fill();

  // Dash streak — fades out behind the player over the burst's duration.
  const dashTimeLeft = state.dashTimeLeft || 0;
  if (dashTimeLeft > 0) {
    const t = Math.min(1, dashTimeLeft / DASH_DURATION);
    ctx.save();
    ctx.globalAlpha = 0.4 * t;
    ctx.beginPath();
    ctx.ellipse(
      screenX - state.facingX * radius * 1.6,
      screenY - state.facingY * radius * 1.6,
      radius * 1.1,
      radius * 0.55,
      Math.atan2(state.facingY, state.facingX),
      0,
      Math.PI * 2
    );
    ctx.fillStyle = "#f0e6b0";
    ctx.fill();
    ctx.restore();
  }

  // Body
  ctx.beginPath();
  ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = "#5a3d1c";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Facing indicator — follows the exact movement vector (including
  // diagonals), so it sits on a corner rather than snapping to a side.
  ctx.beginPath();
  ctx.arc(screenX + state.facingX * radius * 0.6, screenY + state.facingY * radius * 0.6, 3, 0, Math.PI * 2);
  ctx.fillStyle = "#3a2a10";
  ctx.fill();
}

class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 14;
    this.facingX = 0;
    this.facingY = 1; // default: facing down
    this.color = "#e0b64a";
    this.dashTimeLeft = 0;
    this.dashCooldownLeft = 0;
    this.isCasting = false;
  }

  update(dt) {
    const input = {
      dx: (keys.d ? 1 : 0) - (keys.a ? 1 : 0),
      dy: (keys.s ? 1 : 0) - (keys.w ? 1 : 0),
      shift: keys.shift,
      e: keys.e,
    };
    simulatePlayerMovement(this, input, dt);
  }

  draw(ctx, camera) {
    drawPlayerLike(ctx, camera, this);
  }
}

// --- World generation (deferred) --------------------------------------------

// Nothing below is generated at load time anymore — it all depends on RNG,
// which must be seeded first (solo play seeds it with real randomness;
// hosting/joining seeds it with a shared value so everyone's world matches).
// js/lobby.js calls window.startGame() once a mode has been chosen.
let spatialIndex, terrainNoise;
let trees, foliage, mushrooms, rocks, ambientDetails;
let campfire, player;

function pickTreeType() {
  const r = RNG.random();
  if (r < 0.7) return "common";
  if (r < 0.92) return "elder";
  return "dead";
}

function treeFootprintRadius(tree) {
  return ((ForestAssets.TREE_VIEWBOX.width * tree.scale) / 2) * 0.75;
}

// Interior forest: absent inside the campfire clearing, fading in through a
// ring just past it ("only a bit on the outside... circular formation"),
// full density from there until the boundary wall begins.
function treeRingDensity(x, y) {
  const d = distFromCenter(x, y);
  if (d < CLEARING_RADIUS) return 0;
  if (d < RING_END) return (d - CLEARING_RADIUS) / (RING_END - CLEARING_RADIUS);
  return 1;
}

function pickFoliageType() {
  const r = RNG.random();
  if (r < 0.08) return "bush";
  if (r < 0.45) return "tallGrass";
  if (r < 0.75) return "fern";
  return "flowers";
}

function pickClearingFoliageType() {
  return RNG.random() < 0.6 ? "tallGrass" : "flowers";
}

function pickWallFoliageType() {
  const r = RNG.random();
  if (r < 0.35) return "bush";
  if (r < 0.75) return "tallGrass";
  return "fern";
}

function foliageFootprintRadius(item) {
  const asset = ForestAssets.foliage[item.type];
  return ((asset.width * item.scale) / 2) * 0.7;
}

function pickMushroomType() {
  const r = RNG.random();
  if (r < 0.35) return "redCap";
  if (r < 0.65) return "tawnyCap";
  if (r < 0.85) return "blueCap";
  return "cluster";
}

function mushroomFootprintRadius(item) {
  const asset = ForestAssets.mushrooms[item.type];
  return ((asset.width * item.scale) / 2) * 0.7;
}

function pickRockVariant() {
  const r = RNG.random();
  const size = r < 0.55 ? "small" : r < 0.85 ? "medium" : "large";
  const pool = ForestAssets.rocks.filter((v) => v.size === size);
  return pool[Math.floor(RNG.random() * pool.length)];
}

function rockFootprintRadius(item) {
  return ((item.variant.width * item.scale) / 2) * 0.55;
}

function pickAmbientType() {
  const r = RNG.random();
  if (r < 0.4) return "fallenLog";
  if (r < 0.7) return "stump";
  return "twigPile";
}

function ambientFootprintRadius(item) {
  const asset = ForestAssets.ambient[item.type];
  return ((asset.width * item.scale) / 2) * 0.6;
}

function generateWorld() {
  spatialIndex = WorldGen.createSpatialIndex(160);
  terrainNoise = WorldGen.createValueNoise2D();

  // --- Campfire (spawn point) ---
  campfire = { x: WORLD_CENTER.x, y: WORLD_CENTER.y, scale: 1, flip: false };
  spatialIndex.insert(campfire.x, campfire.y, 100);
  // host-sim.js needs the campfire position to spawn newly-joined peers near
  // it; see the window.keys comment above for why this explicit bridge exists.
  window.campfire = campfire;

  // --- Trees ---
  trees = scatterWithDensity({
    count: 550,
    maxAttempts: 550 * 12,
    sample: () => sampleAnnulus(CLEARING_RADIUS, WALL_START),
    densityAt: treeRingDensity,
    footprintRadius: treeFootprintRadius,
    overlapAllowance: 0.8,
    build: (x, y) => ({ x, y, type: pickTreeType(), scale: 0.75 + RNG.random() * 0.55 }),
  });

  // Boundary wall: deliberately denser and packed tighter (looser overlap
  // allowance) than the interior, so the world edge reads as thick forest
  // that keeps going rather than a place where the trees just stop.
  trees.push(...scatterWithDensity({
    count: 1300,
    maxAttempts: 1300 * 15,
    sample: () => sampleAnnulus(WALL_START, WALL_END),
    footprintRadius: treeFootprintRadius,
    overlapAllowance: 0.42,
    build: (x, y) => ({ x, y, type: pickTreeType(), scale: 0.8 + RNG.random() * 0.55 }),
  }));

  // --- Foliage ---
  foliage = [];

  // A few sparse tufts right around the campfire — no shrubs.
  foliage.push(...scatterWithDensity({
    count: 14,
    maxAttempts: 14 * 15,
    sample: () => sampleAnnulus(40, CLEARING_RADIUS - 20),
    footprintRadius: foliageFootprintRadius,
    overlapAllowance: 0.5,
    build: (x, y) => ({ x, y, type: pickClearingFoliageType(), scale: 0.7 + RNG.random() * 0.3, flip: RNG.random() < 0.5 }),
  }));

  // Interior forest floor: noise-gated patchiness (lush meadows, barren gaps).
  foliage.push(...scatterWithDensity({
    count: 420,
    maxAttempts: 420 * 10,
    sample: () => sampleAnnulus(CLEARING_RADIUS + 40, WALL_START),
    densityAt: (x, y) => {
      const density = terrainNoise(x / 260, y / 260);
      if (density < 0.42) return 0;
      return Math.min(1, (density - 0.42) / 0.58 + 0.2);
    },
    footprintRadius: foliageFootprintRadius,
    overlapAllowance: 0.55,
    build: (x, y) => ({ x, y, type: pickFoliageType(), scale: 0.8 + RNG.random() * 0.35, flip: RNG.random() < 0.5 }),
  }));

  // A handful of tight flower clusters layered on top.
  for (let c = 0; c < 8; c++) {
    const center = sampleAnnulus(CLEARING_RADIUS + 40, WALL_START);
    const n = 3 + Math.floor(RNG.random() * 4);
    for (let i = 0; i < n; i++) {
      const angle = RNG.random() * Math.PI * 2;
      const dist = RNG.random() * RNG.random() * 40;
      const x = center.x + Math.cos(angle) * dist;
      const y = center.y + Math.sin(angle) * dist;
      const item = { x, y, type: "flowers", scale: 0.8 + RNG.random() * 0.3, flip: RNG.random() < 0.5 };
      const radius = foliageFootprintRadius(item);
      if (spatialIndex.hasOverlap(x, y, radius, 0.5)) continue;
      spatialIndex.insert(x, y, radius);
      foliage.push(item);
    }
  }

  // Boundary wall: dense low cover so gaps between wall-tree trunks don't
  // leave sightlines through to whatever (nothing) is beyond.
  foliage.push(...scatterWithDensity({
    count: 1000,
    maxAttempts: 1000 * 12,
    sample: () => sampleAnnulus(WALL_START, WALL_END),
    footprintRadius: foliageFootprintRadius,
    overlapAllowance: 0.4,
    build: (x, y) => ({ x, y, type: pickWallFoliageType(), scale: 0.9 + RNG.random() * 0.4, flip: RNG.random() < 0.5 }),
  }));

  // --- Mushrooms ---
  mushrooms = [];
  for (let c = 0; c < 16; c++) {
    const center = sampleAnnulus(CLEARING_RADIUS + 60, WALL_START);
    const n = 2 + Math.floor(RNG.random() * 3);
    for (let i = 0; i < n; i++) {
      const angle = RNG.random() * Math.PI * 2;
      const dist = RNG.random() * RNG.random() * 30;
      const x = center.x + Math.cos(angle) * dist;
      const y = center.y + Math.sin(angle) * dist;
      if (distFromCenter(x, y) < CLEARING_RADIUS) continue;
      const item = { x, y, type: pickMushroomType(), scale: 0.85 + RNG.random() * 0.3, flip: RNG.random() < 0.5 };
      const radius = mushroomFootprintRadius(item);
      if (spatialIndex.hasOverlap(x, y, radius, 0.55)) continue;
      spatialIndex.insert(x, y, radius);
      mushrooms.push(item);
    }
  }
  mushrooms.push(...scatterWithDensity({
    count: 24,
    maxAttempts: 24 * 15,
    sample: () => sampleAnnulus(CLEARING_RADIUS + 60, WALL_START),
    footprintRadius: mushroomFootprintRadius,
    overlapAllowance: 0.55,
    build: (x, y) => ({ x, y, type: pickMushroomType(), scale: 0.85 + RNG.random() * 0.3, flip: RNG.random() < 0.5 }),
  }));

  // --- Rocks ---
  rocks = [];
  for (let c = 0; c < 18; c++) {
    const center = sampleAnnulus(CLEARING_RADIUS + 60, WALL_START);
    const n = 2 + Math.floor(RNG.random() * 4);
    for (let i = 0; i < n; i++) {
      const angle = RNG.random() * Math.PI * 2;
      const dist = RNG.random() * RNG.random() * 45;
      const x = center.x + Math.cos(angle) * dist;
      const y = center.y + Math.sin(angle) * dist;
      if (distFromCenter(x, y) < CLEARING_RADIUS) continue;
      const item = { x, y, variant: pickRockVariant(), scale: 0.75 + RNG.random() * 0.35, flip: RNG.random() < 0.5 };
      const radius = rockFootprintRadius(item);
      if (spatialIndex.hasOverlap(x, y, radius, 0.55)) continue;
      spatialIndex.insert(x, y, radius);
      rocks.push(item);
    }
  }
  rocks.push(...scatterWithDensity({
    count: 26,
    maxAttempts: 26 * 15,
    sample: () => sampleAnnulus(CLEARING_RADIUS + 60, WALL_START),
    footprintRadius: rockFootprintRadius,
    overlapAllowance: 0.55,
    build: (x, y) => ({ x, y, variant: pickRockVariant(), scale: 0.75 + RNG.random() * 0.35, flip: RNG.random() < 0.5 }),
  }));

  // --- Ambient details ---
  ambientDetails = scatterWithDensity({
    count: 60,
    maxAttempts: 60 * 15,
    sample: () => sampleAnnulus(CLEARING_RADIUS + 60, WALL_START),
    footprintRadius: ambientFootprintRadius,
    overlapAllowance: 0.55,
    build: (x, y) => ({ x, y, type: pickAmbientType(), scale: 0.85 + RNG.random() * 0.3, flip: RNG.random() < 0.5 }),
  });

  // --- Player ---
  player = new Player(campfire.x, campfire.y + 110);
  // multiplayer/host-sim.js needs the host's own player to fold into its
  // broadcast snapshot; see the window.keys comment above.
  window.player = player;
}

// --- Camera ------------------------------------------------------------------

const camera = { x: 0, y: 0, zoom: 1 };
const CAST_ZOOM = 1.6;
const ZOOM_APPROACH_RATE = 6; // higher = snappier transition into/out of the zoom

function updateCamera() {
  camera.x = player.x - canvas.width / 2;
  camera.y = player.y - canvas.height / 2;
}

// --- Rendering ---------------------------------------------------------------

function drawGround() {
  ctx.fillStyle = "#2e5c2e";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawTree(tree, camera) {
  const { width: baseWidth, height: baseHeight, groundFraction } = ForestAssets.TREE_VIEWBOX;
  const width = baseWidth * tree.scale;
  const height = baseHeight * tree.scale;

  const screenX = tree.x - camera.x;
  const screenY = tree.y - camera.y;

  if (
    screenX < -width || screenX > canvas.width + width ||
    screenY < -height || screenY > canvas.height + height
  ) {
    return; // cull off-screen trees
  }

  // Shadow at the trunk base
  ctx.beginPath();
  ctx.ellipse(screenX, screenY, width * 0.22, height * 0.05, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
  ctx.fill();

  const img = ForestAssets.trees[tree.type];
  if (img.complete && img.naturalWidth > 0) {
    ctx.drawImage(img, screenX - width / 2, screenY - height * groundFraction, width, height);
  }
}

// Shared by foliage, mushrooms, rocks, ambient details, and the campfire:
// they're all just an image anchored to a world point, optionally mirrored
// for extra variety from a small pool of source assets.
function drawGroundSprite(asset, item, camera) {
  const width = asset.width * item.scale;
  const height = asset.height * item.scale;
  const screenX = item.x - camera.x;
  const screenY = item.y - camera.y;

  if (
    screenX < -width || screenX > canvas.width + width ||
    screenY < -height || screenY > canvas.height + height
  ) {
    return; // cull off-screen
  }

  const img = asset.image;
  if (!(img.complete && img.naturalWidth > 0)) return;

  ctx.save();
  ctx.translate(screenX, screenY);
  if (item.flip) ctx.scale(-1, 1);
  ctx.drawImage(img, -width / 2, -height * asset.groundFraction, width, height);
  ctx.restore();
}

function drawFoliage(item, camera) {
  drawGroundSprite(ForestAssets.foliage[item.type], item, camera);
}

function drawMushroom(item, camera) {
  drawGroundSprite(ForestAssets.mushrooms[item.type], item, camera);
}

function drawRock(item, camera) {
  drawGroundSprite(item.variant, item, camera);
}

function drawAmbient(item, camera) {
  drawGroundSprite(ForestAssets.ambient[item.type], item, camera);
}

function drawCampfire(item, camera) {
  drawGroundSprite(ForestAssets.campfire, item, camera);
}

// --- Game loop -----------------------------------------------------------------

let lastTime;

function loop(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.05); // clamp for tab-switch stalls
  lastTime = now;

  // window.Multiplayer only exists once js/multiplayer/multiplayer.js (a
  // deferred module script) has loaded — guard every reference to it. In
  // solo play it's simply never set, and everything below behaves exactly
  // as it did before multiplayer existed.
  const mp = window.Multiplayer;
  const isPeer = mp && mp.mode === "peer";

  if (isPeer) {
    // Strict host authority: our own avatar is rendered from the host's
    // broadcast rather than simulated locally (see js/multiplayer/peer-sync.js).
    // We still forward local input to the host every frame.
    mp.update(dt);
    const localState = mp.getLocalOverride();
    if (localState) {
      player.x = localState.x;
      player.y = localState.y;
      player.facingX = localState.facingX;
      player.facingY = localState.facingY;
      player.isCasting = localState.isCasting;
      player.dashTimeLeft = localState.isDashing ? DASH_DURATION : 0;
    }
  } else {
    player.update(dt);
    if (mp) mp.update(dt); // host: steps every remote player and broadcasts
  }

  updateCamera();

  // Zoom and the spellbook reference are purely local UI feedback for the
  // person pressing E/Q — they read the raw key state directly rather than
  // the (possibly host-delayed) simulated `isCasting`, so they stay instant
  // regardless of network mode.
  spellbookEl.classList.toggle("visible", keys.e && keys.q);
  const targetZoom = keys.e ? CAST_ZOOM : 1;
  camera.zoom += (targetZoom - camera.zoom) * Math.min(1, dt * ZOOM_APPROACH_RATE);

  // The player is always drawn at canvas center, so scaling around that
  // same point zooms in on them for free — no per-object math needed.
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.scale(camera.zoom, camera.zoom);
  ctx.translate(-canvas.width / 2, -canvas.height / 2);

  drawGround();

  // Depth-sort every ground object, remote players, and the local player by
  // world y so nearer/taller things convincingly occlude farther ones.
  const drawables = [];
  drawables.push({ y: campfire.y, kind: "campfire", item: campfire });
  for (const tree of trees) drawables.push({ y: tree.y, kind: "tree", item: tree });
  for (const item of foliage) drawables.push({ y: item.y, kind: "foliage", item });
  for (const item of mushrooms) drawables.push({ y: item.y, kind: "mushroom", item });
  for (const item of rocks) drawables.push({ y: item.y, kind: "rock", item });
  for (const item of ambientDetails) drawables.push({ y: item.y, kind: "ambient", item });
  if (mp) {
    for (const remote of mp.getRemotePlayers()) {
      drawables.push({ y: remote.y, kind: "remote", item: remote });
    }
  }
  drawables.push({ y: player.y, kind: "player", item: null });

  drawables.sort((a, b) => a.y - b.y);

  for (const d of drawables) {
    switch (d.kind) {
      case "tree": drawTree(d.item, camera); break;
      case "foliage": drawFoliage(d.item, camera); break;
      case "mushroom": drawMushroom(d.item, camera); break;
      case "rock": drawRock(d.item, camera); break;
      case "ambient": drawAmbient(d.item, camera); break;
      case "campfire": drawCampfire(d.item, camera); break;
      case "remote": drawPlayerLike(ctx, camera, { ...d.item, radius: 14 }); break;
      case "player": player.draw(ctx, camera); break;
    }
  }

  ctx.restore();

  requestAnimationFrame(loop);
}

// Entry point — called by js/lobby.js once the player has chosen solo/host/
// join and (for host/join) RNG has been seeded appropriately. Everything
// above this point is safe to load eagerly; everything the game actually
// *does* waits here.
function startGame() {
  generateWorld();
  lastTime = performance.now();
  requestAnimationFrame(loop);
}
window.startGame = startGame; // bridge for js/lobby.js and js/multiplayer/multiplayer.js
