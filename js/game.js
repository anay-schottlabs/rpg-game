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

// Uniform-area sample of an annulus around the world center.
function sampleAnnulus(rMin, rMax) {
  const r = Math.sqrt(rMin * rMin + Math.random() * (rMax * rMax - rMin * rMin));
  const theta = Math.random() * Math.PI * 2;
  return { x: WORLD_CENTER.x + Math.cos(theta) * r, y: WORLD_CENTER.y + Math.sin(theta) * r };
}

const spatialIndex = WorldGen.createSpatialIndex(160);

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
    if (density < 1 && Math.random() > density) continue;

    const item = build(x, y);
    const radius = footprintRadius(item);
    if (spatialIndex.hasOverlap(x, y, radius, overlapAllowance)) continue;

    spatialIndex.insert(x, y, radius);
    results.push(item);
  }
  return results;
}

// --- Campfire (spawn point) -----------------------------------------------

const campfire = { x: WORLD_CENTER.x, y: WORLD_CENTER.y, scale: 1, flip: false };
spatialIndex.insert(campfire.x, campfire.y, 100);

// --- Trees -----------------------------------------------------------------

function pickTreeType() {
  const r = Math.random();
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

const trees = scatterWithDensity({
  count: 550,
  maxAttempts: 550 * 12,
  sample: () => sampleAnnulus(CLEARING_RADIUS, WALL_START),
  densityAt: treeRingDensity,
  footprintRadius: treeFootprintRadius,
  overlapAllowance: 0.8,
  build: (x, y) => ({ x, y, type: pickTreeType(), scale: 0.75 + Math.random() * 0.55 }),
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
  build: (x, y) => ({ x, y, type: pickTreeType(), scale: 0.8 + Math.random() * 0.55 }),
}));

// --- Foliage -----------------------------------------------------------------

// A low-frequency noise field drives how lush or barren any given patch of
// the interior forest floor is, so foliage naturally clumps into meadows
// and clearings instead of spraying evenly.
const terrainNoise = WorldGen.createValueNoise2D();

function pickFoliageType() {
  const r = Math.random();
  if (r < 0.08) return "bush";
  if (r < 0.45) return "tallGrass";
  if (r < 0.75) return "fern";
  return "flowers";
}

function pickClearingFoliageType() {
  return Math.random() < 0.6 ? "tallGrass" : "flowers";
}

function pickWallFoliageType() {
  const r = Math.random();
  if (r < 0.35) return "bush";
  if (r < 0.75) return "tallGrass";
  return "fern";
}

function foliageFootprintRadius(item) {
  const asset = ForestAssets.foliage[item.type];
  return ((asset.width * item.scale) / 2) * 0.7;
}

const foliage = [];

// A few sparse tufts right around the campfire — no shrubs, just enough to
// not look bare.
foliage.push(...scatterWithDensity({
  count: 14,
  maxAttempts: 14 * 15,
  sample: () => sampleAnnulus(40, CLEARING_RADIUS - 20),
  footprintRadius: foliageFootprintRadius,
  overlapAllowance: 0.5,
  build: (x, y) => ({ x, y, type: pickClearingFoliageType(), scale: 0.7 + Math.random() * 0.3, flip: Math.random() < 0.5 }),
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
  build: (x, y) => ({ x, y, type: pickFoliageType(), scale: 0.8 + Math.random() * 0.35, flip: Math.random() < 0.5 }),
}));

// A handful of tight flower clusters layered on top — flowers tend to bloom
// in small clumps rather than singly.
for (let c = 0; c < 8; c++) {
  const center = sampleAnnulus(CLEARING_RADIUS + 40, WALL_START);
  const n = 3 + Math.floor(Math.random() * 4);
  for (let i = 0; i < n; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * Math.random() * 40;
    const x = center.x + Math.cos(angle) * dist;
    const y = center.y + Math.sin(angle) * dist;
    const item = { x, y, type: "flowers", scale: 0.8 + Math.random() * 0.3, flip: Math.random() < 0.5 };
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
  build: (x, y) => ({ x, y, type: pickWallFoliageType(), scale: 0.9 + Math.random() * 0.4, flip: Math.random() < 0.5 }),
}));

// --- Mushrooms -----------------------------------------------------------------

function pickMushroomType() {
  const r = Math.random();
  if (r < 0.35) return "redCap";
  if (r < 0.65) return "tawnyCap";
  if (r < 0.85) return "blueCap";
  return "cluster";
}

function mushroomFootprintRadius(item) {
  const asset = ForestAssets.mushrooms[item.type];
  return ((asset.width * item.scale) / 2) * 0.7;
}

const mushrooms = [];
for (let c = 0; c < 16; c++) {
  const center = sampleAnnulus(CLEARING_RADIUS + 60, WALL_START);
  const n = 2 + Math.floor(Math.random() * 3);
  for (let i = 0; i < n; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * Math.random() * 30;
    const x = center.x + Math.cos(angle) * dist;
    const y = center.y + Math.sin(angle) * dist;
    if (distFromCenter(x, y) < CLEARING_RADIUS) continue;
    const item = { x, y, type: pickMushroomType(), scale: 0.85 + Math.random() * 0.3, flip: Math.random() < 0.5 };
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
  build: (x, y) => ({ x, y, type: pickMushroomType(), scale: 0.85 + Math.random() * 0.3, flip: Math.random() < 0.5 }),
}));

// --- Rocks -----------------------------------------------------------------------

function pickRockVariant() {
  const r = Math.random();
  const size = r < 0.55 ? "small" : r < 0.85 ? "medium" : "large";
  const pool = ForestAssets.rocks.filter((v) => v.size === size);
  return pool[Math.floor(Math.random() * pool.length)];
}

function rockFootprintRadius(item) {
  return ((item.variant.width * item.scale) / 2) * 0.55;
}

const rocks = [];
for (let c = 0; c < 18; c++) {
  const center = sampleAnnulus(CLEARING_RADIUS + 60, WALL_START);
  const n = 2 + Math.floor(Math.random() * 4);
  for (let i = 0; i < n; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * Math.random() * 45;
    const x = center.x + Math.cos(angle) * dist;
    const y = center.y + Math.sin(angle) * dist;
    if (distFromCenter(x, y) < CLEARING_RADIUS) continue;
    const item = { x, y, variant: pickRockVariant(), scale: 0.75 + Math.random() * 0.35, flip: Math.random() < 0.5 };
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
  build: (x, y) => ({ x, y, variant: pickRockVariant(), scale: 0.75 + Math.random() * 0.35, flip: Math.random() < 0.5 }),
}));

// --- Ambient details -----------------------------------------------------------

function pickAmbientType() {
  const r = Math.random();
  if (r < 0.4) return "fallenLog";
  if (r < 0.7) return "stump";
  return "twigPile";
}

function ambientFootprintRadius(item) {
  const asset = ForestAssets.ambient[item.type];
  return ((asset.width * item.scale) / 2) * 0.6;
}

const ambientDetails = scatterWithDensity({
  count: 60,
  maxAttempts: 60 * 15,
  sample: () => sampleAnnulus(CLEARING_RADIUS + 60, WALL_START),
  footprintRadius: ambientFootprintRadius,
  overlapAllowance: 0.55,
  build: (x, y) => ({ x, y, type: pickAmbientType(), scale: 0.85 + Math.random() * 0.3, flip: Math.random() < 0.5 }),
});

// --- Player ------------------------------------------------------------------

const DASH_SPEED_MULTIPLIER = 2.6;
const DASH_DURATION = 0.18; // seconds the burst itself lasts
const DASH_COOLDOWN = 0.6; // seconds before another dash can start
const CAST_SPEED_MULTIPLIER = 0.12; // drastic slowdown while channeling a spell

class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 14;
    this.speed = 220; // pixels per second
    this.facingX = 0;
    this.facingY = 1; // default: facing down
    this.color = "#e0b64a";
    this.dashTimeLeft = 0;
    this.dashCooldownLeft = 0;
    this.isCasting = false;
  }

  update(dt) {
    let dx = 0;
    let dy = 0;

    if (keys.w) dy -= 1;
    if (keys.s) dy += 1;
    if (keys.a) dx -= 1;
    if (keys.d) dx += 1;

    const hasInput = dx !== 0 || dy !== 0;
    this.isCasting = keys.e;

    if (this.dashCooldownLeft > 0) this.dashCooldownLeft -= dt;
    if (this.dashTimeLeft > 0) this.dashTimeLeft -= dt;

    if (hasInput) {
      // Normalize so diagonal movement isn't faster, and keep the exact
      // (possibly diagonal) direction for the facing indicator below.
      const len = Math.hypot(dx, dy);
      dx /= len;
      dy /= len;
      this.facingX = dx;
      this.facingY = dy;

      // Holding shift while moving triggers a quick speed burst, capped by
      // a cooldown so it can't just be held down for a permanent sprint.
      // Casting locks that out — you plant your feet to channel a spell.
      if (!this.isCasting && keys.shift && this.dashCooldownLeft <= 0) {
        this.dashTimeLeft = DASH_DURATION;
        this.dashCooldownLeft = DASH_COOLDOWN;
      }

      let speed = this.dashTimeLeft > 0 ? this.speed * DASH_SPEED_MULTIPLIER : this.speed;
      if (this.isCasting) speed = this.speed * CAST_SPEED_MULTIPLIER;

      this.x += dx * speed * dt;
      this.y += dy * speed * dt;
    }

    const dist = distFromCenter(this.x, this.y);
    if (dist > PLAYER_MAX_RADIUS) {
      const scale = PLAYER_MAX_RADIUS / dist;
      this.x = WORLD_CENTER.x + (this.x - WORLD_CENTER.x) * scale;
      this.y = WORLD_CENTER.y + (this.y - WORLD_CENTER.y) * scale;
    }
  }

  draw(ctx, camera) {
    const screenX = this.x - camera.x;
    const screenY = this.y - camera.y;

    // Shadow
    ctx.beginPath();
    ctx.ellipse(screenX, screenY + this.radius * 0.7, this.radius * 0.8, this.radius * 0.35, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.fill();

    // Dash streak — fades out behind the player over the burst's duration.
    if (this.dashTimeLeft > 0) {
      const t = this.dashTimeLeft / DASH_DURATION;
      ctx.save();
      ctx.globalAlpha = 0.4 * t;
      ctx.beginPath();
      ctx.ellipse(
        screenX - this.facingX * this.radius * 1.6,
        screenY - this.facingY * this.radius * 1.6,
        this.radius * 1.1,
        this.radius * 0.55,
        Math.atan2(this.facingY, this.facingX),
        0,
        Math.PI * 2
      );
      ctx.fillStyle = "#f0e6b0";
      ctx.fill();
      ctx.restore();
    }

    // Body
    ctx.beginPath();
    ctx.arc(screenX, screenY, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.strokeStyle = "#5a3d1c";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Facing indicator — follows the exact movement vector (including
    // diagonals), so it sits on a corner rather than snapping to a side.
    ctx.beginPath();
    ctx.arc(screenX + this.facingX * this.radius * 0.6, screenY + this.facingY * this.radius * 0.6, 3, 0, Math.PI * 2);
    ctx.fillStyle = "#3a2a10";
    ctx.fill();
  }
}

const player = new Player(campfire.x, campfire.y + 110);

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

let lastTime = performance.now();

function loop(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.05); // clamp for tab-switch stalls
  lastTime = now;

  player.update(dt);
  updateCamera();

  // Quick-reference spellbook: only while actively casting, so it can't be
  // pulled up as a free pause-and-read menu outside of that context.
  spellbookEl.classList.toggle("visible", player.isCasting && keys.q);

  // Ease toward the cast zoom rather than snapping, so entering/leaving
  // spellcasting reads as a deliberate push-in rather than a jump cut.
  const targetZoom = player.isCasting ? CAST_ZOOM : 1;
  camera.zoom += (targetZoom - camera.zoom) * Math.min(1, dt * ZOOM_APPROACH_RATE);

  // The player is always drawn at canvas center, so scaling around that
  // same point zooms in on them for free — no per-object math needed.
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.scale(camera.zoom, camera.zoom);
  ctx.translate(-canvas.width / 2, -canvas.height / 2);

  drawGround();

  // Depth-sort every ground object and the player by world y so the player
  // (and taller decoration) can convincingly pass in front of or behind
  // shorter/closer objects.
  const drawables = [];
  drawables.push({ y: campfire.y, kind: "campfire", item: campfire });
  for (const tree of trees) drawables.push({ y: tree.y, kind: "tree", item: tree });
  for (const item of foliage) drawables.push({ y: item.y, kind: "foliage", item });
  for (const item of mushrooms) drawables.push({ y: item.y, kind: "mushroom", item });
  for (const item of rocks) drawables.push({ y: item.y, kind: "rock", item });
  for (const item of ambientDetails) drawables.push({ y: item.y, kind: "ambient", item });
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
      case "player": player.draw(ctx, camera); break;
    }
  }

  ctx.restore();

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
