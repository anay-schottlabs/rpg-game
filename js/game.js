// --- Setup ---------------------------------------------------------------

const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const spellbookEl = document.getElementById("spellbook");
const lobbyEl = document.getElementById("lobby"); // the campfire menu
const campfirePromptEl = document.getElementById("campfire-prompt");
const playerListEl = document.getElementById("player-list");
const playerListItemsEl = document.getElementById("player-list-items");
const healthBarFillEl = document.getElementById("health-bar-fill");
const healthBarSheenEl = document.getElementById("health-bar-sheen");
const castingRingEl = document.getElementById("casting-ring");
const castingGlowEl = document.getElementById("casting-glow");
const castPipEls = {
  up: document.getElementById("cast-pip-up"),
  right: document.getElementById("cast-pip-right"),
  down: document.getElementById("cast-pip-down"),
  left: document.getElementById("cast-pip-left"),
};

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
  f: false,
  tab: false,
  escape: false,
};

window.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();

  if (key in keys) {
    const justPressed = !keys[key];
    keys[key] = true;
    // Tab normally cycles focus between page elements (the room-code input,
    // buttons); once the game has started, we want it exclusively as the
    // player-list toggle instead.
    if (key === "tab" && lobbyEl.classList.contains("lobby-hidden")) e.preventDefault();
    if (key === "e" && justPressed) startCasting();
    return;
  }

  if (keys.e) {
    const dir = ARROW_KEY_TO_DIR[key];
    if (dir) {
      e.preventDefault();
      castSequence.push(dir);
      updateCastingRing();
    }
  }
});

window.addEventListener("keyup", (e) => {
  const key = e.key.toLowerCase();
  if (key in keys) {
    keys[key] = false;
    if (key === "e") stopCasting();
  }
});

// --- Spellcasting ------------------------------------------------------------

// Same combos shown in the spellbook UI (index.html) — kept in sync with it
// by hand since the spellbook is static markup, not generated from this.
const SPELLS = [
  { name: "Stoneskin", element: "earth", combo: ["up", "right", "down"] },
  { name: "Tide Call", element: "water", combo: ["left", "up", "up", "right"] },
  { name: "Ember Burst", element: "fire", combo: ["right", "down", "left", "up", "right"] },
  { name: "Gale Step", element: "wind", combo: ["up", "left", "right", "down", "down", "up"] },
  { name: "Rockfall", element: "earth", combo: ["down", "down", "right", "up"] },
];

const ELEMENT_PIP_COLORS = { earth: "#a68b5c", wind: "#bfe3e3", fire: "#c9622f", water: "#5fa0b0" };
const ARROW_KEY_TO_DIR = { arrowup: "up", arrowdown: "down", arrowleft: "left", arrowright: "right" };
const PIP_DIM_COLOR = "#8a7a68";

let castSequence = [];

function matchingSpells(sequence) {
  if (sequence.length === 0) return SPELLS;
  return SPELLS.filter((s) => sequence.every((dir, i) => s.combo[i] === dir));
}

function startCasting() {
  castSequence = [];
  updateCastingRing();
  castingRingEl.classList.add("visible");
}

function stopCasting() {
  castingRingEl.classList.remove("visible");
  const cast = SPELLS.find(
    (s) => s.combo.length === castSequence.length && s.combo.every((dir, i) => dir === castSequence[i])
  );
  if (cast) flashSigil(cast.element);
  castSequence = [];
}

// Lights up each pip whose direction has appeared anywhere in the sequence
// so far, colored by whichever spell(s) are still a possible match (dim/
// neutral gold when the input no longer matches any known combo).
function updateCastingRing() {
  const candidates = matchingSpells(castSequence);
  const singleElement = candidates.length > 0 && candidates.every((s) => s.element === candidates[0].element) ? candidates[0].element : null;
  const litColor = singleElement ? ELEMENT_PIP_COLORS[singleElement] : "#f4c94a";
  const pressedDirs = new Set(castSequence);

  for (const dir of Object.keys(castPipEls)) {
    const pip = castPipEls[dir];
    const isLit = pressedDirs.has(dir);
    pip.querySelector("circle").setAttribute("fill", isLit ? litColor : PIP_DIM_COLOR);
    pip.setAttribute("opacity", isLit ? "1" : "0.35");
  }

  castingGlowEl.setAttribute("fill", `url(#castGlow${singleElement ? singleElement[0].toUpperCase() + singleElement.slice(1) : "Neutral"})`);
}

function flashSigil(element) {
  const el = document.getElementById("sigil-" + element);
  if (!el) return;
  for (const other of document.querySelectorAll(".sigil-icon")) {
    other.classList.remove("flash-anim");
    other.classList.add("hidden");
  }
  el.classList.remove("hidden");
  void el.offsetWidth; // restart the animation if it's re-triggered quickly
  el.classList.add("flash-anim");
}

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

const CAMPFIRE_INTERACT_RADIUS = 130; // how close the player must be to open the menu with F — wide enough that the player spawns inside it, so the prompt is visible immediately

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
    if (isPointInWater(x, y)) continue;
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

// --- Water -------------------------------------------------------------------

// Layer widths match the design kit's river cards (a 4-stroke stack: dark
// outline, sandy bank, dark inner outline, water fill) — only the innermost
// (actual water) width blocks movement; the bank in between is walkable shore.
const RIVER_OUTLINE_WIDTH = 70;
const RIVER_BANK_WIDTH = 60;
const RIVER_INNER_WIDTH = 49;
const RIVER_WATER_WIDTH = 41;
const POND_WATER_RADIUS = 130;
const POND_SAND_RADIUS = 158;

let riverPoints = []; // smoothed polyline the river spine follows
let ponds = []; // [{x, y, sandRadius, sandPoints, waterPoints}]

// Same blob-polygon algorithm as the design kit's pond generator: a ring of
// points perturbed by two sine waves keyed on `seed`, giving an irregular
// but consistently pond-shaped outline.
function blobPoints(cx, cy, rx, ry, seed, count = 16) {
  const pts = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const r = 1 + 0.14 * Math.sin(angle * 3 + seed) + 0.08 * Math.sin(angle * 7 + seed * 1.7);
    pts.push({ x: cx + rx * r * Math.cos(angle), y: cy + ry * r * Math.sin(angle) });
  }
  return pts;
}

// One river spine crossing the interior forest (entering and exiting through
// the boundary wall, curving well clear of the campfire clearing), with two
// ponds dropped along its length so it visibly widens into them and out
// again — the same "stream feeding a pond" composition as the design kit's
// "Pond & Stream" card, just applied at two points along a longer river.
function generateWater() {
  const startAngle = RNG.random() * Math.PI * 2;
  const endAngle = startAngle + Math.PI + (RNG.random() - 0.5) * 1.2;
  const spineRadius = WALL_START - 100;

  const start = {
    x: WORLD_CENTER.x + Math.cos(startAngle) * spineRadius,
    y: WORLD_CENTER.y + Math.sin(startAngle) * spineRadius,
  };
  const end = {
    x: WORLD_CENTER.x + Math.cos(endAngle) * spineRadius,
    y: WORLD_CENTER.y + Math.sin(endAngle) * spineRadius,
  };

  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const len = Math.hypot(dx, dy) || 1;
  const perpX = -dy / len;
  const perpY = dx / len;

  const STEPS = 14;
  const points = [start];
  const minDistFromCampfire = CLEARING_RADIUS + 120;
  for (let i = 1; i < STEPS; i++) {
    const t = i / STEPS;
    let x = start.x + dx * t + perpX * (RNG.random() - 0.5) * 420;
    let y = start.y + dy * t + perpY * (RNG.random() - 0.5) * 420;

    const d = distFromCenter(x, y);
    if (d < minDistFromCampfire) {
      const scale = minDistFromCampfire / Math.max(1, d);
      x = WORLD_CENTER.x + (x - WORLD_CENTER.x) * scale;
      y = WORLD_CENTER.y + (y - WORLD_CENTER.y) * scale;
    }
    points.push({ x, y });
  }
  points.push(end);

  riverPoints = points;
  ponds = [];
  const pondIndices = [Math.floor(points.length * 0.35), Math.floor(points.length * 0.68)];
  for (const idx of pondIndices) {
    const p = points[idx];
    const seed = RNG.random() * 100;
    const scale = 0.85 + RNG.random() * 0.3;
    ponds.push({
      x: p.x,
      y: p.y,
      sandRadius: POND_SAND_RADIUS * scale,
      sandPoints: blobPoints(p.x, p.y, POND_SAND_RADIUS * scale, POND_SAND_RADIUS * scale * 0.82, seed),
      waterPoints: blobPoints(p.x, p.y, POND_WATER_RADIUS * scale, POND_WATER_RADIUS * scale * 0.82, seed + 5),
    });
  }
}

function distToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  let t = lenSq > 0 ? ((px - x1) * dx + (py - y1) * dy) / lenSq : 0;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

// The only collision check in the game — shared by world generation (so
// nothing spawns in the river/ponds) and player movement (so nothing can
// walk into them either). See simulatePlayerMovement below.
//
// Blocks at the sand/bank edge, not just the blue water — the beach reads
// as part of the water feature, so the player is stopped there rather than
// being able to walk out onto the sand first.
function isPointInWater(x, y) {
  for (let i = 0; i < riverPoints.length - 1; i++) {
    const a = riverPoints[i];
    const b = riverPoints[i + 1];
    if (distToSegment(x, y, a.x, a.y, b.x, b.y) < RIVER_BANK_WIDTH / 2) return true;
  }
  for (const pond of ponds) {
    if (Math.hypot(x - pond.x, y - pond.y) < pond.sandRadius) return true;
  }
  return false;
}

function drawSmoothPath(ctx, points) {
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length - 1; i++) {
    const midX = (points[i].x + points[i + 1].x) / 2;
    const midY = (points[i].y + points[i + 1].y) / 2;
    ctx.quadraticCurveTo(points[i].x, points[i].y, midX, midY);
  }
  const last = points[points.length - 1];
  ctx.lineTo(last.x, last.y);
}

function drawBlob(points, camera, fill) {
  ctx.beginPath();
  points.forEach((p, i) => {
    const sx = p.x - camera.x;
    const sy = p.y - camera.y;
    if (i === 0) ctx.moveTo(sx, sy);
    else ctx.lineTo(sx, sy);
  });
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.strokeStyle = "#2a1f18";
  ctx.lineWidth = 3;
  ctx.fill();
  ctx.stroke();
}

// Drawn as flat terrain right after the ground fill, before the depth-sorted
// object loop — trees/decoration near the bank still draw on top of it
// normally since they're sorted afterward, so no per-segment y-sort needed.
function drawWater(camera) {
  if (riverPoints.length > 1) {
    const screenPoints = riverPoints.map((p) => ({ x: p.x - camera.x, y: p.y - camera.y }));
    const layers = [
      { width: RIVER_OUTLINE_WIDTH, color: "#2a1f18" },
      { width: RIVER_BANK_WIDTH, color: "#c9a877" },
      { width: RIVER_INNER_WIDTH, color: "#2a1f18" },
      { width: RIVER_WATER_WIDTH, color: "#4a7a7a" },
    ];
    for (const layer of layers) {
      ctx.beginPath();
      drawSmoothPath(ctx, screenPoints);
      ctx.strokeStyle = layer.color;
      ctx.lineWidth = layer.width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
    }
  }

  for (const pond of ponds) {
    drawBlob(pond.sandPoints, camera, "#c9a877");
    drawBlob(pond.waterPoints, camera, "#4a7a7a");
  }
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

    // Axis-separated water collision: try each axis independently so
    // walking into a bank at an angle slides along the shore instead of
    // stopping dead, but crossing the water itself is never possible.
    const newX = state.x + dx * speed * dt;
    const newY = state.y + dy * speed * dt;
    if (!isPointInWater(newX, state.y)) state.x = newX;
    if (!isPointInWater(state.x, newY)) state.y = newY;
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
    this.maxHealth = 100;
    this.health = 100;
  }

  // Nothing currently deals damage or heals — these exist so the health bar
  // is wired to real, live state rather than a static image, ready for
  // whatever ends up calling them (combat, hazards, etc).
  takeDamage(amount) {
    this.health = Math.max(0, this.health - amount);
  }

  heal(amount) {
    this.health = Math.min(this.maxHealth, this.health + amount);
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
  if (r < 0.4) return "common";
  if (r < 0.58) return "birch";
  if (r < 0.74) return "pine";
  if (r < 0.86) return "willow";
  if (r < 0.95) return "elder";
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

  // Generated before everything else so trees/foliage/mushrooms/rocks can
  // check isPointInWater() and avoid spawning in the river or ponds.
  generateWater();

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
      if (isPointInWater(x, y)) continue;
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
      if (distFromCenter(x, y) < CLEARING_RADIUS || isPointInWater(x, y)) continue;
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
      if (distFromCenter(x, y) < CLEARING_RADIUS || isPointInWater(x, y)) continue;
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
let fWasPressed = false;
let tabWasPressed = false;

const HEALTH_BAR_TRACK_WIDTH = 158; // matches the design's bar geometry (x=34..192)

function updateHealthBar() {
  const ratio = Math.max(0, Math.min(1, player.health / player.maxHealth));
  const width = HEALTH_BAR_TRACK_WIDTH * ratio;
  healthBarFillEl.setAttribute("width", width);
  healthBarSheenEl.setAttribute("width", width);
}

// Rebuilds the player-list panel's contents. Only called while it's
// actually visible (see loop() below) — no point paying for this otherwise.
function updatePlayerList(mp) {
  playerListItemsEl.textContent = "";

  const row = document.createElement("div");
  row.className = "player-list-row";
  const dot = document.createElement("span");
  dot.className = "player-list-dot";
  dot.style.background = player.color;
  row.appendChild(dot);
  row.appendChild(document.createTextNode("You"));
  playerListItemsEl.appendChild(row);

  if (!mp) return;
  for (const remote of mp.getRemotePlayers()) {
    const r = document.createElement("div");
    r.className = "player-list-row";
    const rDot = document.createElement("span");
    rDot.className = "player-list-dot";
    rDot.style.background = remote.color || "#e0b64a";
    r.appendChild(rDot);
    r.appendChild(document.createTextNode("Player " + String(remote.id).slice(0, 4)));
    playerListItemsEl.appendChild(r);
  }
}

function loop(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.05); // clamp for tab-switch stalls
  lastTime = now;

  // window.Multiplayer only exists once js/multiplayer/multiplayer.js (a
  // deferred module script) has loaded — guard every reference to it. In
  // solo play it's simply never set, and everything below behaves exactly
  // as it did before multiplayer existed.
  const mp = window.Multiplayer;
  const isPeer = mp && mp.mode === "peer";

  // Campfire menu: F opens it when in range, closes it when already open
  // (from anywhere); Escape also closes it. game.js owns *when* it's shown
  // (it's the one that knows the player's position); js/lobby.js owns what's
  // inside it.
  const menuOpenBefore = !lobbyEl.classList.contains("lobby-hidden");
  const distToCampfire = Math.hypot(player.x - campfire.x, player.y - campfire.y);
  const inCampfireRange = distToCampfire < CAMPFIRE_INTERACT_RADIUS;

  const fJustPressed = keys.f && !fWasPressed;
  fWasPressed = keys.f;

  if (fJustPressed) {
    if (menuOpenBefore) {
      lobbyEl.classList.add("lobby-hidden");
    } else if (inCampfireRange) {
      lobbyEl.classList.remove("lobby-hidden");
    }
  } else if (menuOpenBefore && keys.escape) {
    lobbyEl.classList.add("lobby-hidden");
  }

  const menuOpen = !lobbyEl.classList.contains("lobby-hidden");
  campfirePromptEl.classList.toggle("hidden", !(inCampfireRange && !menuOpen));

  if (isPeer) {
    // Strict host authority: our own avatar is rendered from the host's
    // broadcast rather than simulated locally (see js/multiplayer/peer-sync.js).
    // We still forward local input to the host every frame — except while
    // the campfire menu is open, so the avatar holds still; the host will
    // naturally treat our input as neutral once it goes stale (see
    // INPUT_TIMEOUT_MS in host-sim.js).
    if (!menuOpen) mp.update(dt);
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
    if (!menuOpen) player.update(dt);
    // Host: always steps every remote player and broadcasts, even while the
    // host's own campfire menu is open — otherwise opening it would freeze
    // the game for every connected friend, not just the host.
    if (mp) mp.update(dt);
  }

  updateCamera();
  updateHealthBar();

  // Zoom and the spellbook reference are purely local UI feedback — they
  // read the raw key state directly rather than the (possibly host-delayed)
  // simulated `isCasting`, so they stay instant regardless of network mode.
  // The spellbook can be pulled up with Q at any time, not just while
  // casting — it's a reference sheet, not something gated on being mid-spell.
  spellbookEl.classList.toggle("visible", keys.q);
  const targetZoom = keys.e ? CAST_ZOOM : 1;
  camera.zoom += (targetZoom - camera.zoom) * Math.min(1, dt * ZOOM_APPROACH_RATE);

  // Player list: Tab toggles it open/closed (not a hold-to-show). Ignored
  // while the campfire menu is open, where Tab reverts to normal browser
  // focus-cycling between that menu's own inputs and buttons (see the
  // preventDefault condition in the keydown listener above).
  const tabJustPressed = keys.tab && !tabWasPressed;
  tabWasPressed = keys.tab;
  if (tabJustPressed && !menuOpen) playerListEl.classList.toggle("visible");
  if (playerListEl.classList.contains("visible")) updatePlayerList(mp);

  // The player is always drawn at canvas center, so scaling around that
  // same point zooms in on them for free — no per-object math needed.
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.scale(camera.zoom, camera.zoom);
  ctx.translate(-canvas.width / 2, -canvas.height / 2);

  drawGround();
  drawWater(camera);

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
