// --- Setup ---------------------------------------------------------------

const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const spellbookEl = document.getElementById("spellbook");
const lobbyEl = document.getElementById("lobby"); // start-of-session solo/host/join menu — not reopenable mid-game right now, see loop()'s F-key handling
const campfirePromptEl = document.getElementById("campfire-prompt");
const playerListEl = document.getElementById("player-list");
const playerListItemsEl = document.getElementById("player-list-items");
const healthBarFillEl = document.getElementById("health-bar-fill");
const healthBarSheenEl = document.getElementById("health-bar-sheen");
const castingRingEl = document.getElementById("casting-ring");
const castPipEls = {
  up: document.getElementById("cast-pip-up"),
  right: document.getElementById("cast-pip-right"),
  down: document.getElementById("cast-pip-down"),
  left: document.getElementById("cast-pip-left"),
};
const interactPromptEl = document.getElementById("interact-prompt");
const dialoguePanelEl = document.getElementById("dialogue-panel");
const dialoguePortraitEl = document.getElementById("dialogue-portrait");
const dialogueNameEl = document.getElementById("dialogue-name");
const dialogueTextEl = document.getElementById("dialogue-text");
const bossHealthBarEl = document.getElementById("boss-health-bar");
const bossHealthFillEl = document.getElementById("boss-health-fill");
const bossHealthSheenEl = document.getElementById("boss-health-sheen");
const bossHealthNameEl = document.getElementById("boss-health-name");
const devConsoleEl = document.getElementById("dev-console");
const devConsoleInputEl = document.getElementById("dev-console-input");
const devConsoleSuggestionsEl = document.getElementById("dev-console-suggestions");

// --- World-seed persistence --------------------------------------------

// Solo play used to reseed from real randomness on every load, so the map
// was different every session. Now it's a save: the seed is generated once
// and kept, so the exact same world (rivers, biome layout, everything
// downstream of RNG.random()) regenerates on every reload. Hosting/joining
// multiplayer still reseeds with a fresh per-session random seed (see
// multiplayer.js) — this is specifically solo continuity, not shared with
// other players. /reset (the dev console) clears this key.
const WORLD_SEED_KEY = "rpgGameWorldSeed";

function loadOrCreateWorldSeed() {
  try {
    const stored = localStorage.getItem(WORLD_SEED_KEY);
    if (stored !== null) {
      const seed = Number(stored);
      if (!Number.isNaN(seed)) return seed;
    }
  } catch {
    // Private browsing / storage disabled — falls through to a fresh seed,
    // which just won't persist across reloads this session.
  }
  const seed = Math.floor(Math.random() * 2 ** 31);
  try {
    localStorage.setItem(WORLD_SEED_KEY, String(seed));
  } catch {
    // Same as above — non-fatal, just non-persistent.
  }
  return seed;
}
RNG.seed(loadOrCreateWorldSeed());

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// --- Input -----------------------------------------------------------------

// Casting/spellbook are locked out entirely for now — the Elder only gives
// the player their weapon (see NPC_DEFS below), and spellcasting is meant
// to open up later through other NPCs. Flipping this back on is all that's
// needed once that content exists; every casting code path below already
// just works off it.
let SPELLS_ENABLED = false;

const keys = {
  w: false,
  a: false,
  s: false,
  d: false,
  shift: false,
  q: false,
  f: false,
  tab: false,
  escape: false,
};

window.addEventListener("keydown", (e) => {
  // While the dev console is open, its own input field (js/game.js's "---
  // Dev command console ---" section) owns every keystroke — that
  // listener stops propagation, but this is a second line of defense, and
  // is what actually matters for "/" itself (see below) not re-triggering
  // on every character typed.
  if (devConsoleOpen) return;

  const key = e.key.toLowerCase();

  // "/" opens the dev console — only when nothing else already has a real
  // text field focused (e.g. the multiplayer room-code input), so it never
  // hijacks typing "/" somewhere that's actually meant for it.
  if (key === "/" && document.activeElement.tagName !== "INPUT") {
    e.preventDefault();
    openDevConsole();
    return;
  }

  // Shift not being tracked at all while casting is locked out (rather than
  // just skipping startCasting() below) means every downstream casting
  // path — the arrow-combo capture, the cast-speed slowdown in
  // simulatePlayerMovement — stays inert for free, and ArrowRight falls
  // straight through to the weapon swing below instead.
  if (key === "shift" && !SPELLS_ENABLED) return;

  if (key in keys) {
    const justPressed = !keys[key];
    keys[key] = true;
    // Tab normally cycles focus between page elements (the room-code input,
    // buttons); once the game has started, we want it exclusively as the
    // player-list toggle instead.
    if (key === "tab" && lobbyEl.classList.contains("lobby-hidden")) e.preventDefault();
    if (key === "shift" && justPressed) startCasting();
    return;
  }

  if (keys.shift) {
    const dir = ARROW_KEY_TO_DIR[key];
    if (dir) {
      e.preventDefault();
      // e.repeat is true for OS-generated auto-repeat keydowns fired while
      // a key is held past the repeat threshold — without this guard,
      // holding an arrow even slightly too long silently inserts duplicate
      // directions into the sequence, so a combo the player entered
      // correctly stops matching anything and no sigil flashes.
      if (!e.repeat) castSequence.push(dir);
      updateCastingRing();
    }
  } else if (key === "arrowright") {
    // The weapon swing — only once the Elder's granted one (see NPC_DEFS),
    // and only outside a menu/dialogue/dev console, same guard as the
    // campfire/NPC F-key interactions in loop() below.
    e.preventDefault();
    if (player && lobbyEl.classList.contains("lobby-hidden") && !activeDialogue && !devConsoleOpen) {
      player.triggerSwing();
    }
  }

  // Spellbook tabs: number keys switch pages while it's open (Q — see
  // loop() below for how visibility is toggled).
  if (spellbookEl.classList.contains("visible") && key in SPELLBOOK_TABS) {
    e.preventDefault();
    setSpellbookTab(key);
  }
});

window.addEventListener("keyup", (e) => {
  const key = e.key.toLowerCase();
  if (key in keys) {
    keys[key] = false;
    if (key === "shift") stopCasting();
  }
});

// If the window loses focus while a key is held (alt-tab, clicking outside
// the page, a DevTools panel stealing focus, etc.), the browser never sends
// its keyup — without this, `keys.shift` stays stuck true forever, which
// stops startCasting() from ever firing again on the next real press and
// leaves castSequence full of stale directions. Treat losing focus as
// releasing everything, silently (no sigil flash — this isn't a real cast
// attempt).
window.addEventListener("blur", () => {
  const wasCasting = keys.shift;
  for (const key of Object.keys(keys)) keys[key] = false;
  if (wasCasting) {
    castingRingEl.classList.remove("visible");
    castSequence = [];
  }
  // Q's open/close is edge-triggered (see qWasPressed in the game loop) —
  // without resetting it here too, a Q held through a focus loss would
  // silently eat the next press once focus returns.
  qWasPressed = false;
});

// --- Progression (spell unlocks) --------------------------------------------

// Nothing is castable until an NPC (or a boss) grants it — the Spawn Hub is
// where that happens (see "--- Spawn Hub (Village) ---" below). Persisted
// across sessions in localStorage since the village and this progress are
// meant to be a standing home base, not something reset by a page reload.
const UNLOCK_STORAGE_KEY = "rpgGameUnlockedSpells";
// Gust Step is granted by the Crystal Golem boss fight (see
// "--- Boss Arena: Crystal Golem ---" below); nothing else grants spells yet.
const BOSS_REWARD_SPELL = "Gust Step";

let unlockedSpells = new Set();
try {
  unlockedSpells = new Set(JSON.parse(localStorage.getItem(UNLOCK_STORAGE_KEY) || "[]"));
} catch {
  unlockedSpells = new Set();
}

function persistUnlocks() {
  try {
    localStorage.setItem(UNLOCK_STORAGE_KEY, JSON.stringify([...unlockedSpells]));
  } catch {
    // Private browsing / storage disabled — unlocks just won't persist
    // across a reload this session, which is a harmless degradation.
  }
}

// Idempotent — safe to call every time an NPC's dialogue completes, a duel
// is won, or a boss falls, even if the player already has it.
function unlockSpell(name) {
  if (unlockedSpells.has(name)) return;
  unlockedSpells.add(name);
  persistUnlocks();
  updateSpellbookLockState();
  flashSigil(SPELLS.find((s) => s.name === name)?.element || "earth");
  Sound.heal(); // reuse the warm "gained something" chime — no dedicated unlock sound yet
}

// Dims each spellbook entry whose spell isn't unlocked yet and hides its
// combo — matched by the spell's displayed name text since the spellbook is
// static markup (see the SPELLS comment above). Called once at startup and
// again every time unlockSpell() actually grants something.
function updateSpellbookLockState() {
  for (const entry of document.querySelectorAll(".spell-entry")) {
    const name = entry.querySelector(".spell-name")?.textContent.trim();
    entry.classList.toggle("locked", name && !unlockedSpells.has(name));
  }
}

// --- Spellcasting ------------------------------------------------------------

// Same combos shown in the spellbook UI (index.html) — kept in sync with it
// by hand since the spellbook is static markup, not generated from this.
const SPELLS = [
  { name: "Stoneskin", element: "earth", combo: ["up", "right", "down"] },
  { name: "Tide Call", element: "water", combo: ["left", "up", "up", "right"] },
  { name: "Ember Burst", element: "fire", combo: ["right", "down", "left", "up", "right"] },
  { name: "Gale Step", element: "wind", combo: ["up", "left", "right", "down", "down", "up"] },
  { name: "Rockfall", element: "earth", combo: ["down", "down", "right", "up"] },
  { name: "Gust Step", element: "wind", combo: ["left", "right"] },
  { name: "Earth Breaker", element: "earth", combo: ["down", "left", "down"] },
];

const ARROW_KEY_TO_DIR = { arrowup: "up", arrowdown: "down", arrowleft: "left", arrowright: "right" };

// Spellbook pages, one per element, switched with the number keys while the
// book is open (Q). Just a "1"/"2"/... -> tab-number lookup; the actual tab
// markup/content lives in index.html.
const SPELLBOOK_TABS = { 1: 1, 2: 2, 3: 3, 4: 4 };

function setSpellbookTab(key) {
  const tab = String(SPELLBOOK_TABS[key]);
  for (const btn of document.querySelectorAll(".spellbook-tab-btn")) {
    btn.classList.toggle("active", btn.dataset.tab === tab);
  }
  for (const panel of document.querySelectorAll(".spellbook-tab-panel")) {
    panel.classList.toggle("active", panel.dataset.tabPanel === tab);
  }
}

const PIP_DIM_COLOR = "#8a7a68";
const PIP_LIT_COLOR = "#f4c94a";

let castSequence = [];

function startCasting() {
  castSequence = [];
  updateCastingRing();
  castingRingEl.classList.add("visible");
}

function stopCasting() {
  castingRingEl.classList.remove("visible");
  const cast = SPELLS.find(
    (s) => unlockedSpells.has(s.name) && s.combo.length === castSequence.length && s.combo.every((dir, i) => dir === castSequence[i])
  );
  if (cast) {
    flashSigil(cast.element);
    triggerSpellEffect(cast.name);
    Sound.cast(cast.element);
  }
  castSequence = [];
}

// Maps each spellbook entry to what it actually does. Defined further down
// (castFireBolt, castEarthRing, etc. live near the systems they use) but
// referenced here — safe because these are all function declarations,
// hoisted, and never actually called until a cast completes at runtime.
function triggerSpellEffect(spellName) {
  switch (spellName) {
    case "Ember Burst":
      castFireBolt();
      break;
    case "Stoneskin":
      castEarthRing();
      break;
    case "Rockfall":
      castEarthBarricade();
      break;
    case "Gale Step":
      castWindExplosion();
      break;
    case "Tide Call":
      castTideCall();
      break;
    case "Gust Step":
      castGustStep();
      break;
    case "Earth Breaker":
      castEarthBreaker();
      break;
  }
}

// Only the most recently pressed direction is lit, in a single fixed color
// — a simple "last input registered" cue rather than a running tally.
function updateCastingRing() {
  const lastDir = castSequence[castSequence.length - 1];
  for (const dir of Object.keys(castPipEls)) {
    const pip = castPipEls[dir];
    const isLit = dir === lastDir;
    pip.querySelector("circle").setAttribute("fill", isLit ? PIP_LIT_COLOR : PIP_DIM_COLOR);
    pip.setAttribute("opacity", isLit ? "1" : "0.35");
  }
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
const WORLD_RADIUS = 16200;
const WORLD_CENTER = { x: WORLD_RADIUS, y: WORLD_RADIUS };
const PLAYER_MAX_RADIUS = 14400;

const CLEARING_RADIUS = 300; // no trees inside this ring around the campfire
const RING_END = 550; // trees ramp up to full density by this radius
const WALL_START = 12900; // the dense boundary forest begins here
const WALL_END = 19800; // extends well past WORLD_RADIUS so wide screens never see past it

const CAMPFIRE_INTERACT_RADIUS = 130; // how close the player must be to open the menu with F — wide enough that the player spawns inside it, so the prompt is visible immediately

// The Spawn Hub — a small, hand-authored, non-random village (see
// "--- Spawn Hub (Village) ---" below) the player starts in and can always
// return to, completely separate from the huge procedural world. Placed far
// outside the world's own coordinate range purely so the two can never
// numerically overlap — every system that cares which area is active reads
// `currentArea` rather than relying on position alone.
const VILLAGE_CENTER = { x: 100000, y: 100000 };
// The original clearing — a thick, gapless ring of trees sits right at
// this radius, and is (along with the corridor/arena shapes below) what
// isPointInVillageBounds() treats as walkable; clampToWorld()'s fallback
// radius clamp only ever kicks in if that's somehow not already true.
const VILLAGE_RADIUS = 340;

// The path east out of the original clearing, opened once the dead-tree
// cluster blocking it (see generateVillage()'s pathBreakTrees) is broken —
// leads to a second, much bigger clearing for the arena. Modeled as three
// plain shapes (circle, rectangle, circle) rather than one clamp radius,
// since the walkable area is no longer a single circle once this opens.
const VILLAGE_PATH_HALF_WIDTH = 90;
const VILLAGE_PATH_LENGTH = 640;
const VILLAGE_PATH_X0 = VILLAGE_CENTER.x + VILLAGE_RADIUS;
const VILLAGE_PATH_X1 = VILLAGE_PATH_X0 + VILLAGE_PATH_LENGTH;
const VILLAGE_ARENA_RADIUS = 950; // "a big clearing" — nearly 3x the original
const VILLAGE_ARENA_CENTER = { x: VILLAGE_PATH_X1 + VILLAGE_ARENA_RADIUS, y: VILLAGE_CENTER.y };

// True for any point inside the original clearing, or — once
// village.pathOpen is set (see generateVillage()/resolveWeaponHit()) —
// the corridor or the arena clearing too. The sole test both
// clampToWorld() and moveWithCollision() use to decide what counts as
// "still inside the village" now that it's not just one circle.
function isPointInVillageBounds(x, y) {
  if (Math.hypot(x - VILLAGE_CENTER.x, y - VILLAGE_CENTER.y) <= VILLAGE_RADIUS) return true;
  if (!village || !village.pathOpen) return false;
  if (x >= VILLAGE_PATH_X0 && x <= VILLAGE_PATH_X1 && Math.abs(y - VILLAGE_CENTER.y) <= VILLAGE_PATH_HALF_WIDTH) return true;
  return Math.hypot(x - VILLAGE_ARENA_CENTER.x, y - VILLAGE_ARENA_CENTER.y) <= VILLAGE_ARENA_RADIUS;
}

// Known v1 simplification (same spirit as the golems being local-only): this
// is the LOCAL player's area. simulatePlayerMovement()/clampToWorld() are
// also what drives every remote player in multiplayer (see host-sim.js), so
// while the host is in the village every remote player is clamped to the
// village's small radius too, regardless of their own area. Multiplayer
// across two different areas at once isn't supported yet.
let currentArea = "village"; // "village" | "world"

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

// Same idea as sampleAnnulus, but restricted to one angular wedge — used to
// scatter each outlying biome's own content only within its own pie slice
// (see "--- Biomes ---" below).
function sampleSectorAnnulus(rMin, rMax, angleStart, angleEnd) {
  const r = Math.sqrt(rMin * rMin + RNG.random() * (rMax * rMax - rMin * rMin));
  const theta = angleStart + RNG.random() * (angleEnd - angleStart);
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

// Area of an annular wedge (rMin..rMax, angularWidth radians wide — a full
// circle by default). Used to turn a target density into a raw item count.
function annulusArea(rMin, rMax, angularWidth = Math.PI * 2) {
  return 0.5 * (rMax * rMax - rMin * rMin) * angularWidth;
}

// Converts "items per 1,000,000 px²" into a raw count for scatterWithDensity.
// The actual tuning knob for how crowded an area feels is the density
// constant passed in, not a magic count tied to one particular world size —
// so density stays visually consistent no matter how big the sampled area
// is (important now that the world spans many biomes of very different
// sizes, and can be resized without every count needing to be re-tuned).
function densityCount(densityPerMillionPx2, area) {
  return Math.max(0, Math.round((densityPerMillionPx2 * area) / 1_000_000));
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

const RIVER_COUNT = 2;
const RIVER_MIN_GAP = RIVER_OUTLINE_WIDTH + 120; // clear separation kept between river spines
const RIVER_CAMPFIRE_CLEARANCE = CLEARING_RADIUS + 120; // how far every river segment must stay from the campfire

let rivers = []; // array of smoothed polylines, one per river spine
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

// One river spine crossing the interior forest, entering and exiting through
// the boundary wall at the given angles and curving well clear of the
// campfire clearing along the way.
function generateRiverSpine(startAngle, endAngle) {
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
  for (let i = 1; i < STEPS; i++) {
    const t = i / STEPS;
    let x = start.x + dx * t + perpX * (RNG.random() - 0.5) * 420;
    let y = start.y + dy * t + perpY * (RNG.random() - 0.5) * 420;

    const d = distFromCenter(x, y);
    if (d < RIVER_CAMPFIRE_CLEARANCE) {
      const scale = RIVER_CAMPFIRE_CLEARANCE / Math.max(1, d);
      x = WORLD_CENTER.x + (x - WORLD_CENTER.x) * scale;
      y = WORLD_CENTER.y + (y - WORLD_CENTER.y) * scale;
    }
    points.push({ x, y });
  }
  points.push(end);
  return points;
}

function segmentsIntersect(p1, p2, p3, p4) {
  const d1x = p2.x - p1.x;
  const d1y = p2.y - p1.y;
  const d2x = p4.x - p3.x;
  const d2y = p4.y - p3.y;
  const denom = d1x * d2y - d1y * d2x;
  if (Math.abs(denom) < 1e-9) return false; // parallel (or near enough not to matter here)
  const t = ((p3.x - p1.x) * d2y - (p3.y - p1.y) * d2x) / denom;
  const u = ((p3.x - p1.x) * d1y - (p3.y - p1.y) * d1x) / denom;
  return t >= 0 && t <= 1 && u >= 0 && u <= 1;
}

// True if `points` crosses or comes within `minGap` of any already-placed
// river — checked via both segment-segment intersection (hard crossings)
// and point-to-segment distance (so near-parallel rivers can't run right
// alongside each other either).
function riverConflicts(points, existingRivers, minGap) {
  for (const other of existingRivers) {
    for (let i = 0; i < points.length - 1; i++) {
      for (let j = 0; j < other.length - 1; j++) {
        if (segmentsIntersect(points[i], points[i + 1], other[j], other[j + 1])) return true;
      }
    }
    for (const p of points) {
      for (let j = 0; j < other.length - 1; j++) {
        if (distToSegment(p.x, p.y, other[j].x, other[j].y, other[j + 1].x, other[j + 1].y) < minGap) return true;
      }
    }
  }
  return false;
}

// Per-point clearing avoidance in generateRiverSpine() only keeps each
// sampled *point* clear of the campfire — the straight segment *between*
// two clear points can still cut closer to the center than either endpoint
// (e.g. two points on opposite sides of the clearing, both individually far
// enough away). This checks the actual segments, which is what matters for
// "never spawn under the campfire."
function riverTooCloseToCampfire(points, minDist) {
  for (let i = 0; i < points.length - 1; i++) {
    if (distToSegment(WORLD_CENTER.x, WORLD_CENTER.y, points[i].x, points[i].y, points[i + 1].x, points[i + 1].y) < minDist) {
      return true;
    }
  }
  return false;
}

// A handful of independent river spines (RIVER_COUNT), spread around the
// compass so they don't all cross the same stretch of forest, each with one
// pond dropped along its length where it visibly widens — the same "stream
// feeding a pond" composition as the design kit's "Pond & Stream" card.
// Candidates that would cross or run alongside an already-placed river are
// rejected and retried with fresh angles, so rivers never overlap.
function generateWater() {
  rivers = [];
  ponds = [];

  const baseAngle = RNG.random() * Math.PI * 2;
  for (let i = 0; i < RIVER_COUNT; i++) {
    let points = null;
    for (let attempt = 0; attempt < 10 && !points; attempt++) {
      const startAngle = baseAngle + (i / RIVER_COUNT) * Math.PI * 2 + (RNG.random() - 0.5) * 0.6;
      const endAngle = startAngle + Math.PI + (RNG.random() - 0.5) * 1.2;
      const candidate = generateRiverSpine(startAngle, endAngle);
      if (!riverConflicts(candidate, rivers, RIVER_MIN_GAP) && !riverTooCloseToCampfire(candidate, RIVER_CAMPFIRE_CLEARANCE)) {
        points = candidate;
      }
    }
    if (!points) continue; // couldn't find a clear path after several tries — skip rather than force an overlap
    rivers.push(points);

    const idx = Math.floor(points.length * (0.3 + RNG.random() * 0.4));
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
  // Ice bridges (js/game.js "Obstacles" section below) punch a walkable
  // hole through water collision — checked first so they always win.
  for (const bridge of iceBridges) {
    if (distToSegment(x, y, bridge.x1, bridge.y1, bridge.x2, bridge.y2) < bridge.width / 2) return false;
  }
  for (const points of rivers) {
    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i];
      const b = points[i + 1];
      if (distToSegment(x, y, a.x, a.y, b.x, b.y) < RIVER_BANK_WIDTH / 2) return true;
    }
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
  const layers = [
    { width: RIVER_OUTLINE_WIDTH, color: "#2a1f18" },
    { width: RIVER_BANK_WIDTH, color: "#c9a877" },
    { width: RIVER_INNER_WIDTH, color: "#2a1f18" },
    { width: RIVER_WATER_WIDTH, color: "#4a7a7a" },
  ];
  for (const points of rivers) {
    if (points.length < 2) continue;
    const screenPoints = points.map((p) => ({ x: p.x - camera.x, y: p.y - camera.y }));
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

// --- Obstacles (spell-created) ----------------------------------------------

// Temporary blockers from Stoneskin (a ring of pillars around the caster)
// and Rockfall (a single barricade line) — the same shape vocabulary as
// water collision (circles/segments), checked alongside it everywhere
// movement is resolved. Each carries expiresAt (performance.now() ms) and
// is swept out once past it.
let obstacles = [];
let iceBridges = [];

function isPointBlocked(x, y) {
  for (const obs of obstacles) {
    if (obs.type === "circle") {
      if (Math.hypot(x - obs.x, y - obs.y) < obs.radius) return true;
    } else if (distToSegment(x, y, obs.x1, obs.y1, obs.x2, obs.y2) < obs.width / 2) {
      return true;
    }
  }
  return false;
}

function pruneExpired(list, now) {
  for (let i = list.length - 1; i >= 0; i--) {
    if (now >= list[i].expiresAt) list.splice(i, 1);
  }
}

const EARTH_RING_DURATION_MS = 12000;
const EARTH_RING_RADIUS = 90; // ring drawn around the caster
const EARTH_PILLAR_RADIUS = 24; // each pillar's own collision radius

function castEarthRing() {
  const now = performance.now();
  const pillarCount = 7;
  for (let i = 0; i < pillarCount; i++) {
    const angle = (i / pillarCount) * Math.PI * 2;
    obstacles.push({
      type: "circle",
      kind: "earthPillar",
      x: player.x + Math.cos(angle) * EARTH_RING_RADIUS,
      y: player.y + Math.sin(angle) * EARTH_RING_RADIUS,
      radius: EARTH_PILLAR_RADIUS,
      expiresAt: now + EARTH_RING_DURATION_MS,
    });
  }
}

const EARTH_BARRICADE_DURATION_MS = 12000;
const EARTH_BARRICADE_DISTANCE = 70; // how far in front of the caster it appears
const EARTH_BARRICADE_LENGTH = 160;
const EARTH_BARRICADE_WIDTH = 40;

function castEarthBarricade() {
  const cx = player.x + player.facingX * EARTH_BARRICADE_DISTANCE;
  const cy = player.y + player.facingY * EARTH_BARRICADE_DISTANCE;
  // Perpendicular to the cast direction, so it blocks the path ahead.
  const perpX = -player.facingY;
  const perpY = player.facingX;
  obstacles.push({
    type: "segment",
    kind: "earthBarricade",
    x1: cx - perpX * (EARTH_BARRICADE_LENGTH / 2),
    y1: cy - perpY * (EARTH_BARRICADE_LENGTH / 2),
    x2: cx + perpX * (EARTH_BARRICADE_LENGTH / 2),
    y2: cy + perpY * (EARTH_BARRICADE_LENGTH / 2),
    width: EARTH_BARRICADE_WIDTH,
    angle: Math.atan2(perpY, perpX),
    expiresAt: performance.now() + EARTH_BARRICADE_DURATION_MS,
  });
}

function drawObstacles(camera) {
  for (const obs of obstacles) {
    if (obs.kind === "earthPillar") {
      drawGroundSprite(ForestAssets.spellEffects.earthWallPillar, { x: obs.x, y: obs.y, scale: 1, flip: false }, camera);
    } else if (obs.kind === "earthBarricade") {
      const asset = ForestAssets.spellEffects.earthWallBarricade;
      const midX = (obs.x1 + obs.x2) / 2;
      const midY = (obs.y1 + obs.y2) / 2;
      const screenX = midX - camera.x;
      const screenY = midY - camera.y;
      ctx.save();
      ctx.translate(screenX, screenY);
      ctx.rotate(obs.angle);
      ctx.drawImage(asset.image, -asset.width / 2, -asset.height * asset.groundFraction, asset.width, asset.height);
      ctx.restore();
    }
  }
}

// --- Earth Breaker (spell-created) ------------------------------------------

// Crushes every "earth" scatter object (rocks, and the rock-like scree/
// stalagmite biome ground details) within range of the caster. Each one
// that shatters checks for others nearby and schedules them to shatter a
// beat later, so a cluster (and especially a roughly linear run of them)
// visibly detonates outward in a chain rather than all at once. Trees,
// foliage, and mushrooms are untouched — only genuinely rock/earth objects
// qualify.
// Sized against how far apart rocks actually land at the current world
// scale (median nearest-neighbor distance is a few hundred px) — wide
// enough that a genuinely nearby scatter of rocks reliably chains, without
// reaching all the way out to unrelated, far-off ones.
const EARTH_BREAKER_CAST_RADIUS = 420; // initial crush radius around the caster
const EARTH_BREAKER_CHAIN_RADIUS = 380; // how far one shatter can trigger the next
const EARTH_BREAKER_CHAIN_DELAY_MS = 140; // domino timing between chain links
const EARTH_BREAKER_DAMAGE_RADIUS = 160; // AoE hit radius around each shatter
const EARTH_BREAKER_DAMAGE = 22;

let pendingEarthShatters = []; // [{ entry, triggerAt, chainIndex }]

// Every not-yet-destroyed earth object in the world, in the same
// {kind, item} shape renderGrid entries use — kept as a plain scan (not a
// spatial lookup) since this only ever runs from a player-triggered cast,
// not per frame.
function collectEarthAssets() {
  const list = [];
  for (const item of rocks) {
    if (!item.destroyed) list.push({ kind: "rock", item });
  }
  for (const item of biomeFoliage) {
    if (!item.destroyed && (item.type === "scree" || item.type === "stalagmite")) list.push({ kind: "biomeFoliage", item });
  }
  return list;
}

function scheduleEarthShatter(entry, delayMs, chainIndex) {
  entry.item.chainScheduled = true;
  pendingEarthShatters.push({ entry, triggerAt: performance.now() + delayMs, chainIndex });
}

function explodeEarthAsset(entry, chainIndex) {
  entry.item.destroyed = true;
  const x = entry.item.x;
  const y = entry.item.y;
  spawnEffect(x, y, "earthImpact", 0.45, (entry.item.scale || 1) * 1.3);
  Sound.earthShatter(chainIndex);

  for (const enemy of enemies) {
    if (enemy.state === "dead") continue;
    if (Math.hypot(enemy.x - x, enemy.y - y) >= EARTH_BREAKER_DAMAGE_RADIUS) continue;
    enemy.health -= EARTH_BREAKER_DAMAGE;
    if (enemy.health <= 0) {
      killEnemy(enemy);
      Sound.enemyDeath();
    } else {
      Sound.enemyTakeDamage();
    }
  }

  // Chain reaction: any not-yet-scheduled earth object nearby goes off a
  // beat later, continuing the chain from itself once it does.
  for (const other of collectEarthAssets()) {
    if (other.item === entry.item || other.item.chainScheduled) continue;
    if (Math.hypot(other.item.x - x, other.item.y - y) < EARTH_BREAKER_CHAIN_RADIUS) {
      scheduleEarthShatter(other, EARTH_BREAKER_CHAIN_DELAY_MS, chainIndex + 1);
    }
  }
}

function castEarthBreaker() {
  for (const entry of collectEarthAssets()) {
    if (Math.hypot(entry.item.x - player.x, entry.item.y - player.y) < EARTH_BREAKER_CAST_RADIUS) {
      entry.item.chainScheduled = true;
      explodeEarthAsset(entry, 0);
    }
  }
}

function updatePendingEarthShatters(now) {
  for (let i = pendingEarthShatters.length - 1; i >= 0; i--) {
    const pending = pendingEarthShatters[i];
    if (now < pending.triggerAt) continue;
    pendingEarthShatters.splice(i, 1);
    if (!pending.entry.item.destroyed) explodeEarthAsset(pending.entry, pending.chainIndex);
  }
}

// --- Ice bridge (spell-created) ---------------------------------------------

const ICE_BRIDGE_DURATION_MS = 30000;
const ICE_BRIDGE_LENGTH = 220;
const ICE_BRIDGE_WIDTH = 70;
const WATER_SPELL_RANGE = 150; // how close the player must be to draw on water at all

function isNearWater(x, y, range) {
  // Cheap approximation: probe a small ring of points around (x,y) rather
  // than a true distance-to-water-shape query — good enough for "am I
  // standing at the water's edge" and reuses isPointInWater as-is.
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    if (isPointInWater(x + Math.cos(angle) * range, y + Math.sin(angle) * range)) return true;
  }
  return isPointInWater(x, y);
}

function castIceBridge() {
  iceBridges.push({
    x1: player.x,
    y1: player.y,
    x2: player.x + player.facingX * ICE_BRIDGE_LENGTH,
    y2: player.y + player.facingY * ICE_BRIDGE_LENGTH,
    width: ICE_BRIDGE_WIDTH,
    expiresAt: performance.now() + ICE_BRIDGE_DURATION_MS,
  });
}

// Tide Call is context-sensitive: near a healing pool specifically, it
// draws healing water from it; near any other water (river/pond), it
// freezes a crossing instead. Both need water/a pool within reach, so
// casting it away from any water does nothing.
function castTideCall() {
  const pool = findNearbyHealingPool(player.x, player.y, WATER_SPELL_RANGE);
  if (pool && !pool.depleted) {
    player.heal(HEALING_HEAL_AMOUNT);
    pool.depleted = true;
    pool.regenAt = performance.now() + HEALING_POOL_REGEN_MS;
    spawnEffect(player.x, player.y, "healBurst", 0.8);
    Sound.heal();
    return;
  }
  if (isNearWater(player.x, player.y, WATER_SPELL_RANGE)) {
    castIceBridge();
  }
}

function drawIceBridges(camera) {
  const segmentAsset = ForestAssets.spellEffects.iceBridgeSegment;
  for (const bridge of iceBridges) {
    const dx = bridge.x2 - bridge.x1;
    const dy = bridge.y2 - bridge.y1;
    const len = Math.hypot(dx, dy) || 1;
    const angle = Math.atan2(dy, dx);
    const step = segmentAsset.width * 0.7; // slight overlap between tiles
    const count = Math.max(1, Math.ceil(len / step));
    for (let i = 0; i < count; i++) {
      const t = (i + 0.5) / count;
      const x = bridge.x1 + dx * t;
      const y = bridge.y1 + dy * t;
      const screenX = x - camera.x;
      const screenY = y - camera.y;
      ctx.save();
      ctx.translate(screenX, screenY);
      ctx.rotate(angle);
      ctx.drawImage(segmentAsset.image, -segmentAsset.width / 2, -segmentAsset.height * segmentAsset.groundFraction, segmentAsset.width, segmentAsset.height);
      ctx.restore();
    }
  }
}

// --- Healing pools -----------------------------------------------------------

const HEALING_POOL_COUNT = 2;
const HEALING_POOL_RADIUS = 90; // sand-edge radius, used for placement + interact range
const HEALING_POOL_REGEN_MS = 45000;
const HEALING_HEAL_AMOUNT = 45;

let healingPools = [];

function generateHealingPools() {
  healingPools = [];
  let attempts = 0;
  while (healingPools.length < HEALING_POOL_COUNT && attempts < HEALING_POOL_COUNT * 40) {
    attempts++;
    const p = sampleAnnulus(CLEARING_RADIUS + 200, BIOME_INNER_RADIUS);
    if (isPointInWater(p.x, p.y)) continue;
    if (spatialIndex.hasOverlap(p.x, p.y, HEALING_POOL_RADIUS, 0.9)) continue;
    const seed = RNG.random() * 100;
    const pool = {
      x: p.x,
      y: p.y,
      sandPoints: blobPoints(p.x, p.y, HEALING_POOL_RADIUS, HEALING_POOL_RADIUS * 0.85, seed),
      waterPoints: blobPoints(p.x, p.y, HEALING_POOL_RADIUS * 0.8, HEALING_POOL_RADIUS * 0.68, seed + 5),
      depleted: false,
      regenAt: 0,
    };
    spatialIndex.insert(p.x, p.y, HEALING_POOL_RADIUS);
    healingPools.push(pool);
  }
}

function findNearbyHealingPool(x, y, range) {
  for (const pool of healingPools) {
    if (Math.hypot(x - pool.x, y - pool.y) < range + HEALING_POOL_RADIUS) return pool;
  }
  return null;
}

function updateHealingPools(now) {
  for (const pool of healingPools) {
    if (pool.depleted && now >= pool.regenAt) pool.depleted = false;
  }
}

function drawHealingPools(camera) {
  for (const pool of healingPools) {
    drawBlob(pool.sandPoints, camera, "#c9a877");
    if (!pool.depleted) {
      const screenX = pool.x - camera.x;
      const screenY = pool.y - camera.y;
      const glow = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, HEALING_POOL_RADIUS * 1.3);
      glow.addColorStop(0, "rgba(143, 217, 176, 0.35)");
      glow.addColorStop(1, "rgba(143, 217, 176, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(screenX, screenY, HEALING_POOL_RADIUS * 1.3, 0, Math.PI * 2);
      ctx.fill();
    }
    drawBlob(pool.waterPoints, camera, pool.depleted ? "#a9865a" : "#8fd9b0");
  }
}

// --- Player movement & rendering (shared with multiplayer) -----------------

const PLAYER_BASE_SPEED = 220; // pixels per second
// Gust Step (design doc's Movement Abilities section) — cast like any other
// spell (see SPELLS below); castGustStep() just arms this burst rather than
// it triggering off a held movement key.
const DASH_SPEED_MULTIPLIER = 2.6;
const DASH_DURATION = 0.18; // seconds the burst itself lasts
const CAST_SPEED_MULTIPLIER = 0.12; // drastic slowdown while channeling a spell

// Axis-separated collision against water and spell-created obstacles: try
// each axis independently so moving into one at an angle slides along it
// instead of stopping dead, but crossing it is never possible. Shared by
// the per-frame movement below and Gust Step's instant displacement. Also
// where the village's own boundary (see isPointInVillageBounds()) is
// enforced — it isn't a single clamp radius once the path/arena are open,
// so it needs the same per-axis "try it, keep it only if still legal" shape
// water/obstacles already use, rather than clampToWorld()'s simpler
// after-the-fact snap-back.
function moveWithCollision(state, dx, dy, dist) {
  const newX = state.x + dx * dist;
  const newY = state.y + dy * dist;
  const villageBlocked = (x, y) => currentArea === "village" && !isPointInVillageBounds(x, y);
  if (!isPointInWater(newX, state.y) && !isPointBlocked(newX, state.y) && !villageBlocked(newX, state.y)) state.x = newX;
  if (!isPointInWater(state.x, newY) && !isPointBlocked(state.x, newY) && !villageBlocked(state.x, newY)) state.y = newY;
}

function clampToWorld(state) {
  if (currentArea === "village") {
    // moveWithCollision() above already keeps the player inside
    // isPointInVillageBounds() on every step, so this is only a safety net
    // (e.g. Gust Step's instant displacement bypasses per-axis collision)
    // — snap back toward the original clearing, same as before the
    // path/arena existed.
    if (isPointInVillageBounds(state.x, state.y)) return;
    const dist = Math.hypot(state.x - VILLAGE_CENTER.x, state.y - VILLAGE_CENTER.y);
    const scale = VILLAGE_RADIUS / dist;
    state.x = VILLAGE_CENTER.x + (state.x - VILLAGE_CENTER.x) * scale;
    state.y = VILLAGE_CENTER.y + (state.y - VILLAGE_CENTER.y) * scale;
    return;
  }
  // Same shape as before — the open world's boundary is still just one
  // circle.
  const dist = Math.hypot(state.x - WORLD_CENTER.x, state.y - WORLD_CENTER.y);
  if (dist > PLAYER_MAX_RADIUS) {
    const scale = PLAYER_MAX_RADIUS / dist;
    state.x = WORLD_CENTER.x + (state.x - WORLD_CENTER.x) * scale;
    state.y = WORLD_CENTER.y + (state.y - WORLD_CENTER.y) * scale;
  }
}

// Pure movement step used by both the local Player class below AND, in
// multiplayer, js/multiplayer/host-sim.js — which drives every remote
// player through this exact same function every frame so movement rules
// are identical no matter who's simulating whom. `state` is mutated in
// place ({x,y,facingX,facingY,dashTimeLeft,isCasting,isWalking}).
// `input` is {dx,dy,e} where dx/dy are raw -1/0/1 axis intent.
function simulatePlayerMovement(state, input, dt) {
  const hasInput = input.dx !== 0 || input.dy !== 0;
  state.isCasting = input.e;
  state.isWalking = hasInput;

  if (state.dashTimeLeft > 0) state.dashTimeLeft -= dt;

  if (hasInput) {
    // Normalize so diagonal movement isn't faster, and keep the exact
    // (possibly diagonal) direction for the facing indicator.
    const len = Math.hypot(input.dx, input.dy);
    const dx = input.dx / len;
    const dy = input.dy / len;
    state.facingX = dx;
    state.facingY = dy;

    const speed = state.isCasting ? PLAYER_BASE_SPEED * CAST_SPEED_MULTIPLIER : PLAYER_BASE_SPEED;
    moveWithCollision(state, dx, dy, speed * dt);
  }

  clampToWorld(state);
}
window.simulatePlayerMovement = simulatePlayerMovement; // bridge for host-sim.js

// Gust Step's cast effect — an immediate burst of travel in the player's
// current facing direction. Applied as a one-shot displacement (not a
// timed speed multiplier) so it always actually moves you the instant it's
// cast, regardless of whether a movement key happens to be held right then
// — casting itself locks you in place, so you're rarely still holding one.
// dashTimeLeft is kept only to drive the streak fade and the isDashing flag
// broadcast in multiplayer.
const DASH_DISTANCE = PLAYER_BASE_SPEED * DASH_SPEED_MULTIPLIER * DASH_DURATION;
function castGustStep() {
  player.dashTimeLeft = DASH_DURATION;
  moveWithCollision(player, player.facingX, player.facingY, DASH_DISTANCE);
  clampToWorld(player);
  Sound.dash();
}

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

  // Gust Step dash streak (design-doc asset) — trails behind the player
  // along the direction of travel, fading out over the burst's duration.
  const dashTimeLeft = state.dashTimeLeft || 0;
  if (dashTimeLeft > 0) {
    const t = Math.min(1, dashTimeLeft / DASH_DURATION);
    const asset = ForestAssets.spellEffects.gustStepStreak;
    const angle = Math.atan2(state.facingY, state.facingX);
    ctx.save();
    ctx.globalAlpha = t;
    ctx.translate(screenX - state.facingX * radius * 0.6, screenY - state.facingY * radius * 0.6);
    ctx.rotate(angle);
    ctx.drawImage(asset.image, -asset.width, -asset.height / 2, asset.width, asset.height);
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

// --- Player character rig (design doc's "Player Character" section) ------
// Local-only — remote players still render as the simple dot via
// drawPlayerLike() above; syncing hasWeapon/swing state over multiplayer
// isn't wired up yet.

// Maps the rig's 200x320 local space onto screen pixels — picked jointly
// with NPC_DISPLAY_SCALE below (see generateVillage()) so the player and a
// standing NPC read as roughly the same height next to each other; NPCs
// are drawn from flat 92x131-ish source art at their own native scale, so
// without deliberately reconciling the two here they don't match by default.
const PLAYER_RIG_SCALE = 0.28;

function playerLocalToWorld(local, state, flip) {
  const anchor = ForestAssets.playerRig.groundAnchor;
  return {
    x: state.x + (local.x - anchor.x) * PLAYER_RIG_SCALE * flip,
    y: state.y + (local.y - anchor.y) * PLAYER_RIG_SCALE,
  };
}

function drawPlayerPolygon(points, pivot, angle, state, flip, camera, fill) {
  ctx.beginPath();
  points.forEach((p, i) => {
    const rotated = angle ? rotateAround(p, pivot, angle) : p;
    const world = playerLocalToWorld(rotated, state, flip);
    const sx = world.x - camera.x, sy = world.y - camera.y;
    if (i === 0) ctx.moveTo(sx, sy);
    else ctx.lineTo(sx, sy);
  });
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.strokeStyle = "#2a1f18";
  ctx.lineWidth = 1.6;
  ctx.fill();
  ctx.stroke();
}

function drawPlayerEllipse(local, rx, ry, pivot, angle, state, flip, camera, fill) {
  const rotated = angle ? rotateAround(local, pivot, angle) : local;
  const world = playerLocalToWorld(rotated, state, flip);
  ctx.beginPath();
  ctx.ellipse(world.x - camera.x, world.y - camera.y, rx * PLAYER_RIG_SCALE, ry * PLAYER_RIG_SCALE, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = "#2a1f18";
  ctx.lineWidth = 1.2;
  ctx.stroke();
}

// Weapon swing: right arrow (see the keydown listener above), only while
// not casting and only once a weapon's been granted (see the Elder's
// dialogue in "--- Spawn Hub (Village) ---" below). Windup pulls the
// weapon back, then the strike sweeps it through in front of the player —
// same two-phase shape as every enemy's own attackWindup/attackCooldown.
const WEAPON_SWING_WINDUP = 0.08;
const WEAPON_SWING_DURATION = 0.3;
const WEAPON_SWING_BACK = 0.6; // radians pulled back during windup
const WEAPON_SWING_FORWARD = 1.1; // radians swept forward during the strike

// Melee hit check — a single damage pulse per swing, applied the instant
// the strike phase begins (same "resolve on windup-complete" moment every
// enemy attack already uses, see updateEnemy()) rather than every frame the
// blade happens to overlap something, so a swing can't multi-hit one enemy
// just by lingering nearby.
const WEAPON_DAMAGE = 18;
const WEAPON_RANGE = 85;
const WEAPON_HIT_ARC = Math.PI * 0.8; // total cone width in front of the player

function resolveWeaponHit() {
  if (player.swingTimeLeft <= 0 || player.hitThisSwing) return;
  if (WEAPON_SWING_DURATION - player.swingTimeLeft < WEAPON_SWING_WINDUP) return; // still winding up
  player.hitThisSwing = true;

  const facingAngle = Math.atan2(player.facingY, player.facingX);
  const inSwingArc = (x, y) => {
    const dx = x - player.x, dy = y - player.y;
    if (Math.hypot(dx, dy) > WEAPON_RANGE) return false;
    let angleDiff = Math.abs(Math.atan2(dy, dx) - facingAngle);
    if (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff;
    return angleDiff <= WEAPON_HIT_ARC / 2;
  };

  for (const enemy of enemies) {
    if (enemy.state === "dead") continue;
    if (!inSwingArc(enemy.x, enemy.y)) continue;
    enemy.health -= WEAPON_DAMAGE;
    if (enemy.health <= 0) {
      killEnemy(enemy);
      Sound.enemyDeath();
    } else {
      Sound.enemyTakeDamage();
    }
  }

  // Dead trees blocking the path east out of the village (see
  // generateVillage()'s pathBreakTrees) — same shatter/chain-adjacent
  // feedback Earth Breaker used to give its own gate-tree equivalent,
  // just weapon-triggered now instead of spell-triggered.
  if (currentArea === "village" && village && !village.pathOpen) {
    for (const tree of village.pathBreakTrees) {
      if (tree.destroyed || !inSwingArc(tree.x, tree.y)) continue;
      tree.destroyed = true;
      spawnEffect(tree.x, tree.y, "earthImpact", 0.45, (tree.scale || 1) * 1.3);
      Sound.earthShatter(0);
      for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        if (obs.kind === "villagePathBlock" && Math.hypot(obs.x - tree.x, obs.y - tree.y) < 5) obstacles.splice(i, 1);
      }
    }
    if (village.pathBreakTrees.every((t) => t.destroyed)) village.pathOpen = true;
  }
}

function computeWeaponSwingAngle(state) {
  if (state.swingTimeLeft <= 0) return 0;
  const elapsed = WEAPON_SWING_DURATION - state.swingTimeLeft;
  if (elapsed < WEAPON_SWING_WINDUP) {
    return -WEAPON_SWING_BACK * (elapsed / WEAPON_SWING_WINDUP);
  }
  const strikeDuration = WEAPON_SWING_DURATION - WEAPON_SWING_WINDUP;
  const t = Math.min(1, (elapsed - WEAPON_SWING_WINDUP) / strikeDuration);
  return -WEAPON_SWING_BACK + (WEAPON_SWING_BACK + WEAPON_SWING_FORWARD) * t;
}

// Per-group rotation angles — idle sway, a walk cycle while a movement key
// is held, and the weapon swing layered on top of whichever of those is
// current. `angles.weapon` also picks up a facingY-based tilt so the
// swing's plane leans toward whichever way the player is actually walking,
// per the design brief — the rig itself never rotates (like every enemy,
// it only flips left/right), so this tilt is the stand-in for that.
function computePlayerAngles(state) {
  const angles = { head: 0, torso: 0, armL: 0, armR: 0, legL: 0, legR: 0, weapon: 0 };

  if (state.isWalking) {
    const walk = Math.sin(state.animPhase * 8);
    angles.legL = walk * 0.55;
    angles.legR = -walk * 0.55;
    angles.armL = -walk * 0.35;
    angles.armR = walk * 0.35;
    angles.torso = walk * 0.02;
  } else {
    const sway = Math.sin(state.animPhase * 1.5);
    angles.armL = sway * 0.06;
    angles.armR = -sway * 0.06;
    angles.head = sway * 0.04;
  }

  const swing = computeWeaponSwingAngle(state);
  const tilt = state.facingY * 0.5;
  if (state.swingTimeLeft > 0) angles.armR = swing * 0.4 + tilt; // arm follows through a little; the weapon does the rest
  angles.weapon = swing + tilt;

  return angles;
}

function drawPlayerCharacter(ctx, camera, state) {
  const rig = ForestAssets.playerRig;
  const flip = state.facingX < 0 ? -1 : 1;
  const angles = computePlayerAngles(state);

  const groundWorld = playerLocalToWorld(rig.groundAnchor, state, flip);
  ctx.beginPath();
  ctx.ellipse(groundWorld.x - camera.x, groundWorld.y - camera.y, 15, 5.5, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
  ctx.fill();

  // Gust Step dash streak (design-doc asset) — trails behind the player
  // along the direction of travel, fading out over the burst's duration.
  const dashTimeLeft = state.dashTimeLeft || 0;
  if (dashTimeLeft > 0) {
    const t = Math.min(1, dashTimeLeft / DASH_DURATION);
    const asset = ForestAssets.spellEffects.gustStepStreak;
    const angle = Math.atan2(state.facingY, state.facingX);
    ctx.save();
    ctx.globalAlpha = t;
    ctx.translate(state.x - camera.x - state.facingX * 10, state.y - camera.y - state.facingY * 10);
    ctx.rotate(angle);
    ctx.drawImage(asset.image, -asset.width, -asset.height / 2, asset.width, asset.height);
    ctx.restore();
  }

  const drawSeg = (key, pivot, angle) => {
    const seg = rig.segments[key];
    if (seg.kind === "ellipse") drawPlayerEllipse(seg.center, seg.rx, seg.ry, pivot, angle, state, flip, camera, seg.fill);
    else drawPlayerPolygon(seg.points, pivot, angle, state, flip, camera, seg.fill);
  };

  // Draw order matches the design doc's own layering: legs behind
  // everything, then left arm, then the weapon (so the right hand can grip
  // over it), then the right arm/hand, then the torso the arms emerge
  // from, then the head/hat on top.
  const legL = rig.groups.legL, legR = rig.groups.legR;
  for (const key of legL.segments) drawSeg(key, legL.pivot, angles.legL);
  for (const key of legR.segments) drawSeg(key, legR.pivot, angles.legR);

  const armL = rig.groups.armL;
  for (const key of armL.segments) drawSeg(key, armL.pivot, angles.armL);

  if (state.hasWeapon) {
    const weapon = rig.groups.weapon;
    for (const key of weapon.segments) drawSeg(key, weapon.pivot, angles.weapon);

    const glowWorld = playerLocalToWorld(rotateAround(rig.weaponGlowCenter, weapon.pivot, angles.weapon), state, flip);
    const gx = glowWorld.x - camera.x, gy = glowWorld.y - camera.y;
    const glowR = 9 * PLAYER_RIG_SCALE * 6;
    const grad = ctx.createRadialGradient(gx, gy, 0, gx, gy, glowR);
    grad.addColorStop(0, "rgba(210, 240, 240, 0.85)");
    grad.addColorStop(1, "rgba(210, 240, 240, 0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(gx, gy, glowR, 0, Math.PI * 2);
    ctx.fill();
  }

  const armR = rig.groups.armR;
  for (const key of armR.segments) drawSeg(key, armR.pivot, angles.armR);

  const torso = rig.groups.torso;
  for (const key of torso.segments) drawSeg(key, torso.pivot, angles.torso);

  const head = rig.groups.head;
  for (const key of head.segments) drawSeg(key, head.pivot, angles.head);
}

class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.facingX = 0;
    this.facingY = 1; // default: facing down
    this.color = "#e0b64a";
    this.dashTimeLeft = 0;
    this.isCasting = false;
    this.isWalking = false;
    this.maxHealth = 100;
    this.health = 100;
    this.hasWeapon = false; // granted by the Elder — see NPC_DEFS
    this.animPhase = 0;
    this.swingTimeLeft = 0;
    this.hitThisSwing = false; // resolveWeaponHit()'s once-per-swing guard
  }

  takeDamage(amount) {
    this.health = Math.max(0, this.health - amount);
  }

  heal(amount) {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  triggerSwing() {
    if (!this.hasWeapon || this.swingTimeLeft > 0) return;
    this.swingTimeLeft = WEAPON_SWING_DURATION;
    this.hitThisSwing = false;
  }

  update(dt) {
    const input = {
      dx: (keys.d ? 1 : 0) - (keys.a ? 1 : 0),
      dy: (keys.s ? 1 : 0) - (keys.w ? 1 : 0),
      e: keys.shift,
    };
    simulatePlayerMovement(this, input, dt);
    this.animPhase += dt;
    if (this.swingTimeLeft > 0) this.swingTimeLeft = Math.max(0, this.swingTimeLeft - dt);
  }

  draw(ctx, camera) {
    drawPlayerCharacter(ctx, camera, this);
  }
}

// --- Enemies -------------------------------------------------------------------

// Local-only simulation: every client runs its own enemy AI against its own
// local player, rather than the host broadcasting enemy state like it does
// for players. Spawn points come from the seeded RNG during world
// generation (so they line up across a multiplayer session), but the
// ongoing chase/attack behavior is not synced — a known v1 simplification.
//
// One dedicated enemy per biome (see "--- Biomes ---" below). The
// idle/chasing/attacking/dead state machine (aggro/leash, attack
// windup/cooldown) is identical for all of them and lives in updateEnemy()
// below, driven entirely by the stats here — only the rig/animation/render
// differs per body plan (the family-specific draw*Enemy functions further
// down, dispatched by `family`).
const ENEMY_TYPES = {
  golem: {
    displayName: "Rock Golem", biomeId: "woodlandGrove", family: "golem",
    maxHealth: 120, aggroRadius: 420, leashRadius: 650, attackRange: 70,
    attackWindup: 0.5, attackCooldown: 1.6, attackDamage: 8, speed: 70,
    respawnMs: 20000, scale: 0.55, rig: ForestAssets.enemyRigs.golem,
  },
  mireLeech: {
    displayName: "Mire Leech", biomeId: "marshBog", family: "segmentedChain",
    maxHealth: 55, aggroRadius: 260, leashRadius: 420, attackRange: 55,
    attackWindup: 0.35, attackCooldown: 1.1, attackDamage: 10, speed: 95,
    respawnMs: 16000, scale: 0.7, rig: ForestAssets.enemyRigs.mireLeech,
  },
  cragRam: {
    displayName: "Crag Ram", biomeId: "mountainFoothills", family: "quadruped",
    maxHealth: 100, aggroRadius: 380, leashRadius: 600, attackRange: 75,
    attackWindup: 0.45, attackCooldown: 1.5, attackDamage: 12, speed: 100,
    respawnMs: 18000, scale: 0.7, rig: ForestAssets.enemyRigs.cragRam,
  },
  frostWisp: {
    displayName: "Frost Wisp", biomeId: "frostfallTundra", family: "floaty",
    maxHealth: 65, aggroRadius: 400, leashRadius: 620, attackRange: 65,
    attackWindup: 0.4, attackCooldown: 1.3, attackDamage: 9, speed: 85,
    respawnMs: 17000, scale: 0.8, ignoresWater: true, rig: ForestAssets.enemyRigs.frostWisp,
  },
  bramblingBoar: {
    displayName: "Bramble Boar", biomeId: "sunmeadowClearing", family: "quadruped",
    maxHealth: 90, aggroRadius: 360, leashRadius: 580, attackRange: 70,
    attackWindup: 0.3, attackCooldown: 1.2, attackDamage: 14, speed: 130,
    respawnMs: 18000, scale: 0.62, rig: ForestAssets.enemyRigs.bramblingBoar,
  },
  crystalCrawler: {
    displayName: "Crystal Crawler", biomeId: "hollowDeep", family: "radialLegs",
    maxHealth: 80, aggroRadius: 340, leashRadius: 540, attackRange: 60,
    attackWindup: 0.4, attackCooldown: 1.4, attackDamage: 11, speed: 90,
    respawnMs: 17000, scale: 0.62, rig: ForestAssets.enemyRigs.crystalCrawler,
  },
  // Boss Arenas' Crystal Golem — same rig shape as the regular golem, just
  // a bigger local coordinate space (see crystalGolemRig) plus a somewhat
  // bigger world scale, "a bit bigger than regular golem" per its brief.
  // Everything else about it (aggro/leash/health/damage) lives on the
  // instance itself, not here — see spawnCrystalGolem() — since a boss is a
  // one-off, not a species with many interchangeable instances.
  crystalGolem: {
    displayName: "Crystal Golem", biomeId: "hollowDeep", family: "golem",
    maxHealth: 600, aggroRadius: 620, leashRadius: 620, attackRange: 90,
    attackWindup: 0.55, attackCooldown: 1.8, attackDamage: 16, speed: 85,
    respawnMs: Infinity, scale: 0.62, rig: ForestAssets.enemyRigs.crystalGolem,
  },
};

let enemies = [];

function makeEnemy(kind, x, y) {
  return {
    kind,
    x, y,
    spawnX: x, spawnY: y,
    health: ENEMY_TYPES[kind].maxHealth,
    state: "idle", // "idle" | "chasing" | "attacking" | "dead"
    facingX: 0,
    facingY: 1,
    attackWindup: 0,
    attackCooldown: 0,
    animPhase: RNG.random() * 10,
    deathTimer: 0,
  };
}

// Places up to `count` enemies of `kind` using `sample()` for candidate
// points. Deliberately does NOT consult the world's spatialIndex (unlike
// the static scatter passes) — by the time enemies spawn, biome trees and
// foliage have already packed it dense enough that a clear 60px circle is
// nearly unfindable in a bounded number of attempts. Enemies are mobile and
// have no movement collision with foliage anyway, so a light check against
// only their own kind's spawn points (so a group doesn't stack on itself)
// is enough.
function spawnEnemyGroup(kind, count, sample) {
  let placed = 0;
  let attempts = 0;
  while (placed < count && attempts < count * 40) {
    attempts++;
    const p = sample();
    if (isPointInWater(p.x, p.y)) continue;
    if (enemies.some((e) => Math.hypot(e.x - p.x, e.y - p.y) < 140)) continue;
    // Keep ordinary wandering enemies out of the Crystal Golem's arena —
    // that fight is meant to start empty, not with a stray crystal crawler
    // already inside.
    if (bossArenaCenter && Math.hypot(p.x - bossArenaCenter.x, p.y - bossArenaCenter.y) < BOSS_ARENA_RADIUS + 200) continue;
    enemies.push(makeEnemy(kind, p.x, p.y));
    placed++;
  }
}

function killEnemy(enemy) {
  enemy.state = "dead";
  enemy.deathTimer = ENEMY_TYPES[enemy.kind].respawnMs;
}

function updateEnemy(enemy, dt) {
  const type = ENEMY_TYPES[enemy.kind];

  if (enemy.state === "dead") {
    enemy.deathTimer -= dt * 1000;
    if (enemy.deathTimer <= 0) {
      enemy.health = type.maxHealth;
      enemy.x = enemy.spawnX;
      enemy.y = enemy.spawnY;
      enemy.state = "idle";
    }
    return;
  }

  const distToPlayer = Math.hypot(player.x - enemy.x, player.y - enemy.y);
  const distFromSpawn = Math.hypot(enemy.x - enemy.spawnX, enemy.y - enemy.spawnY);

  if (enemy.attackCooldown > 0) enemy.attackCooldown -= dt;

  if (enemy.state === "attacking") {
    if (enemy.attackWindup > 0) {
      enemy.attackWindup -= dt;
      if (enemy.attackWindup <= 0) {
        // The Crystal Golem cycles between three attacks (see
        // resolveCrystalGolemAttack) instead of the single melee-range
        // check every other enemy uses.
        if (enemy.kind === "crystalGolem" && enemy.crystalAttackPattern !== "melee") {
          resolveCrystalGolemAttack(enemy, distToPlayer);
        } else if (distToPlayer <= type.attackRange + 20) {
          player.takeDamage(type.attackDamage);
          Sound.enemyHitPlayer();
        }
      }
    }
    if (enemy.attackCooldown <= 0) {
      enemy.state = distToPlayer <= type.aggroRadius ? "chasing" : "idle";
    }
    enemy.animPhase += dt;
    return;
  }

  // Focus / unfocus.
  if (enemy.state !== "chasing" && distToPlayer <= type.aggroRadius) {
    enemy.state = "chasing";
  }
  if (enemy.state === "chasing" && (distToPlayer > type.leashRadius || distFromSpawn > type.leashRadius)) {
    enemy.state = "idle";
  }

  if (enemy.state === "chasing") {
    if (distToPlayer <= type.attackRange) {
      enemy.state = "attacking";
      enemy.attackWindup = type.attackWindup;
      enemy.attackCooldown = type.attackCooldown;
      enemy.facingX = (player.x - enemy.x) / (distToPlayer || 1);
      enemy.facingY = (player.y - enemy.y) / (distToPlayer || 1);
      Sound.enemyAttackWindup();
      // "Give it plenty of attacks": cycles between a melee swing (the
      // default every enemy already has), a ranged crystal-shard throw, and
      // an AoE ground slam — see resolveCrystalGolemAttack().
      if (enemy.kind === "crystalGolem") {
        const r = RNG.random();
        enemy.crystalAttackPattern = r < 0.4 ? "melee" : r < 0.7 ? "ranged" : "slam";
      }
    } else {
      const dx = (player.x - enemy.x) / (distToPlayer || 1);
      const dy = (player.y - enemy.y) / (distToPlayer || 1);
      const newX = enemy.x + dx * type.speed * dt;
      const newY = enemy.y + dy * type.speed * dt;
      const blockedByWater = !type.ignoresWater && isPointInWater(newX, newY);
      if (!blockedByWater && !isPointBlocked(newX, newY)) {
        enemy.x = newX;
        enemy.y = newY;
      }
      enemy.facingX = dx;
      enemy.facingY = dy;
    }
  }

  enemy.animPhase += dt;
}

function updateEnemies(dt) {
  for (const enemy of enemies) updateEnemy(enemy, dt);
}

function rotateAround(p, pivot, angle) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const dx = p.x - pivot.x;
  const dy = p.y - pivot.y;
  return { x: pivot.x + dx * cos - dy * sin, y: pivot.y + dx * sin + dy * cos };
}

// Maps a point in an enemy's local rig space (design-doc pixel coordinates)
// into world space: scaled from its rig's groundAnchor and mirrored
// (flip = -1) when facing left. Shared by every family's renderer below —
// these creatures are side-view illustrations that flip horizontally to
// face the player, the same way the golem always has.
function enemyLocalToWorld(local, enemy, type, flip) {
  const anchor = type.rig.groundAnchor;
  return {
    x: enemy.x + (local.x - anchor.x) * type.scale * flip,
    y: enemy.y + (local.y - anchor.y) * type.scale,
  };
}

function drawEnemyPolygon(points, pivot, angle, enemy, type, flip, camera, fill) {
  ctx.beginPath();
  points.forEach((p, i) => {
    const rotated = angle ? rotateAround(p, pivot, angle) : p;
    const world = enemyLocalToWorld(rotated, enemy, type, flip);
    const sx = world.x - camera.x;
    const sy = world.y - camera.y;
    if (i === 0) ctx.moveTo(sx, sy);
    else ctx.lineTo(sx, sy);
  });
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.strokeStyle = "#2a1f18";
  ctx.lineWidth = 2.5;
  ctx.fill();
  ctx.stroke();
}

function drawEnemyEllipse(local, rx, ry, pivot, angle, enemy, type, flip, camera, fill) {
  const rotated = angle ? rotateAround(local, pivot, angle) : local;
  const world = enemyLocalToWorld(rotated, enemy, type, flip);
  ctx.beginPath();
  ctx.ellipse(world.x - camera.x, world.y - camera.y, rx * type.scale, ry * type.scale, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

// Draws an SVG path string's numeric coordinate pairs as a straight
// polyline (losing exact curve smoothness on any Q/C segments — the same
// simplification the golem already used for its cracks), transformed into
// world space around an optional pivot/rotation.
function drawEnemyPathLine(pathStr, pivot, angle, enemy, type, flip, camera, strokeStyle, lineWidth) {
  const nums = pathStr.match(/-?[\d.]+/g).map(Number);
  ctx.beginPath();
  for (let i = 0; i < nums.length; i += 2) {
    const local = { x: nums[i], y: nums[i + 1] };
    const rotated = angle ? rotateAround(local, pivot, angle) : local;
    const world = enemyLocalToWorld(rotated, enemy, type, flip);
    const sx = world.x - camera.x;
    const sy = world.y - camera.y;
    if (i === 0) ctx.moveTo(sx, sy);
    else ctx.lineTo(sx, sy);
  }
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";
  ctx.stroke();
}

function drawEnemyShadow(enemy, type, flip, camera) {
  const groundWorld = enemyLocalToWorld(type.rig.groundAnchor, enemy, type, flip);
  ctx.beginPath();
  ctx.ellipse(groundWorld.x - camera.x, groundWorld.y - camera.y, 46 * type.scale, 14 * type.scale, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
  ctx.fill();
}

// Health bar over the creature while below full — a quick read on how close
// it is to going down without needing a persistent HUD element per enemy.
function drawEnemyHealthBar(enemy, type, flip, camera) {
  if (enemy.health >= type.maxHealth) return;
  const anchor = type.rig.groundAnchor;
  const barWorld = enemyLocalToWorld({ x: anchor.x, y: anchor.y - type.rig.viewHeight * 0.85 }, enemy, type, flip);
  const bx = barWorld.x - camera.x;
  const by = barWorld.y - camera.y;
  const w = 50;
  ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
  ctx.fillRect(bx - w / 2, by, w, 6);
  ctx.fillStyle = "#a63d3d";
  ctx.fillRect(bx - w / 2, by, w * Math.max(0, enemy.health / type.maxHealth), 6);
}

// --- Enemy family: golem (biped, arms + legs) — Woodland Grove -----------

// Per-group rotation angles driven by the enemy's current state/animPhase —
// idle sway, a walk cycle while chasing, and a wind-up/strike while attacking.
function computeGolemAngles(enemy, type) {
  const angles = { head: 0, armL: 0, armR: 0, legL: 0, legR: 0, torso: 0 };

  if (enemy.state === "attacking") {
    if (enemy.attackWindup > 0) {
      const t = 1 - enemy.attackWindup / type.attackWindup; // 0 -> 1 through the telegraph
      angles.armR = -0.9 * t;
      angles.head = -0.15 * t;
    } else {
      const strikeDuration = type.attackCooldown - type.attackWindup;
      const t = strikeDuration > 0 ? 1 - Math.max(0, enemy.attackCooldown / strikeDuration) : 1;
      angles.armR = 0.6 * (1 - Math.min(1, t));
    }
  } else if (enemy.state === "chasing") {
    const walk = Math.sin(enemy.animPhase * 6);
    angles.legL = walk * 0.5;
    angles.legR = -walk * 0.5;
    angles.armL = -walk * 0.3;
    angles.armR = walk * 0.3;
    angles.torso = walk * 0.03;
  } else {
    const sway = Math.sin(enemy.animPhase * 1.4);
    angles.armL = sway * 0.08;
    angles.armR = -sway * 0.08;
    angles.head = sway * 0.05;
  }
  return angles;
}

// Shared by the regular Rock Golem and the bigger Crystal Golem boss (same
// joint rig shape, see crystalGolemRig in assets.js) — golem-only fixed
// decorations (sockets/moss/cracks) and boss-only ones (crystalShards/core/
// headGem) are both optional so either rig works through this one function.
function drawGolemEnemy(enemy, type, camera) {
  if (enemy.state === "dead") return;

  const rig = type.rig;
  const flip = enemy.facingX < 0 ? -1 : 1;
  const angles = computeGolemAngles(enemy, type);

  drawEnemyShadow(enemy, type, flip, camera);

  // Fixed decorations drawn first (they sit beneath/behind the moving segments).
  for (const socket of rig.sockets || []) {
    drawEnemyEllipse(socket, socket.rx, socket.ry, socket, 0, enemy, type, flip, camera, "#5f5a4f");
  }

  // Legs and torso behind the arms/head.
  const legL = rig.groups.legL;
  const legR = rig.groups.legR;
  for (const key of legL.segments) drawEnemyPolygon(rig.segments[key].points, legL.pivot, angles.legL, enemy, type, flip, camera, rig.segments[key].fill);
  for (const key of legR.segments) drawEnemyPolygon(rig.segments[key].points, legR.pivot, angles.legR, enemy, type, flip, camera, rig.segments[key].fill);

  const torso = rig.groups.torso;
  for (const key of torso.segments) drawEnemyPolygon(rig.segments[key].points, torso.pivot, angles.torso, enemy, type, flip, camera, rig.segments[key].fill);

  // Moss patches + glowing cracks over the torso, before the arms/head so
  // the limbs can overlap them naturally.
  for (const moss of rig.moss || []) {
    drawEnemyEllipse(moss, moss.rx, moss.ry, torso.pivot, angles.torso, enemy, type, flip, camera, "#5c6b3f");
  }
  ctx.save();
  ctx.globalAlpha = 0.75;
  for (const crack of rig.cracks || []) drawEnemyPathLine(crack, torso.pivot, angles.torso, enemy, type, flip, camera, "#c9622f", 2);
  ctx.restore();

  // Crystal Golem's shoulder/chest shard clusters, drawn with the torso.
  for (const shard of rig.crystalShards || []) {
    drawEnemyPolygon(shard.points, torso.pivot, angles.torso, enemy, type, flip, camera, "#9b7fc4");
  }

  const armL = rig.groups.armL;
  const armR = rig.groups.armR;
  for (const key of armL.segments) drawEnemyPolygon(rig.segments[key].points, armL.pivot, angles.armL, enemy, type, flip, camera, rig.segments[key].fill);
  for (const key of armR.segments) drawEnemyPolygon(rig.segments[key].points, armR.pivot, angles.armR, enemy, type, flip, camera, rig.segments[key].fill);

  // Crystal Golem's exposed weak-point core, on the torso before the head.
  if (rig.core) {
    const coreWorld = enemyLocalToWorld(rotateAround(rig.core, torso.pivot, angles.torso), enemy, type, flip);
    ctx.beginPath();
    ctx.arc(coreWorld.x - camera.x, coreWorld.y - camera.y, rig.core.r * type.scale, 0, Math.PI * 2);
    ctx.fillStyle = "#8fe0ff";
    ctx.globalAlpha = 0.55;
    ctx.fill();
    ctx.globalAlpha = 1;
    drawEnemyPolygon(rig.core.diamond, torso.pivot, angles.torso, enemy, type, flip, camera, "#8fe0ff");
  }

  const head = rig.groups.head;
  for (const key of head.segments) drawEnemyPolygon(rig.segments[key].points, head.pivot, angles.head, enemy, type, flip, camera, rig.segments[key].fill);
  if (rig.headGem) drawEnemyPolygon(rig.headGem, head.pivot, angles.head, enemy, type, flip, camera, "#e8d8ff");

  // Eyes glow on top of the head.
  ctx.fillStyle = rig.core ? "#8fe0ff" : "#e8a24a"; // crystal palette vs. the regular golem's amber
  for (const eye of rig.eyes) {
    const rotated = angles.head ? rotateAround(eye, head.pivot, angles.head) : eye;
    const world = enemyLocalToWorld(rotated, enemy, type, flip);
    ctx.beginPath();
    ctx.arc(world.x - camera.x, world.y - camera.y, eye.r * type.scale, 0, Math.PI * 2);
    ctx.fill();
  }

  drawEnemyHealthBar(enemy, type, flip, camera);
}

// --- Enemy family: quadruped (torso + head + 4 legs) ----------------------
// Shared by Crag Ram (Mountain Foothills) and Bramble Boar (Sunmeadow
// Clearing) — same rig shape, different decorations (horns vs. tusk/bristle,
// driven by whichever of rig.headDecor/rig.tuskPoints/rig.bristlePath exist).

function computeQuadrupedAngles(enemy, type) {
  const angles = { head: 0, torso: 0, legFL: 0, legFR: 0, legBL: 0, legBR: 0 };

  if (enemy.state === "attacking") {
    if (enemy.attackWindup > 0) {
      const t = 1 - enemy.attackWindup / type.attackWindup;
      angles.head = -0.5 * t;
      angles.torso = -0.06 * t;
    } else {
      const strikeDuration = type.attackCooldown - type.attackWindup;
      const t = strikeDuration > 0 ? 1 - Math.max(0, enemy.attackCooldown / strikeDuration) : 1;
      angles.head = 0.3 * (1 - Math.min(1, t));
      angles.torso = 0.1 * (1 - Math.min(1, t));
    }
  } else if (enemy.state === "chasing") {
    const walk = Math.sin(enemy.animPhase * 9); // diagonal-pair gait, faster than the golem's lumber
    angles.legFL = walk * 0.45;
    angles.legBR = walk * 0.45;
    angles.legFR = -walk * 0.45;
    angles.legBL = -walk * 0.45;
    angles.torso = walk * 0.025;
    angles.head = -walk * 0.04;
  } else {
    const sway = Math.sin(enemy.animPhase * 1.2);
    angles.head = sway * 0.06;
  }
  return angles;
}

function drawQuadrupedEnemy(enemy, type, camera) {
  if (enemy.state === "dead") return;

  const rig = type.rig;
  const flip = enemy.facingX < 0 ? -1 : 1;
  const angles = computeQuadrupedAngles(enemy, type);

  drawEnemyShadow(enemy, type, flip, camera);

  for (const key of ["legFL", "legFR", "legBL", "legBR"]) {
    const group = rig.groups[key];
    for (const segKey of group.segments) drawEnemyPolygon(rig.segments[segKey].points, group.pivot, angles[key], enemy, type, flip, camera, rig.segments[segKey].fill);
  }

  const torso = rig.groups.torso;
  for (const key of torso.segments) drawEnemyPolygon(rig.segments[key].points, torso.pivot, angles.torso, enemy, type, flip, camera, rig.segments[key].fill);

  if (rig.bristlePath) drawEnemyPathLine(rig.bristlePath, torso.pivot, angles.torso, enemy, type, flip, camera, "#4f6636", 4);

  const head = rig.groups.head;
  for (const key of head.segments) drawEnemyPolygon(rig.segments[key].points, head.pivot, angles.head, enemy, type, flip, camera, rig.segments[key].fill);

  if (rig.headDecor) {
    for (const path of rig.headDecor) drawEnemyPathLine(path, head.pivot, angles.head, enemy, type, flip, camera, "#e8dcc0", 2.5);
  }
  if (rig.tuskPoints) drawEnemyPolygon(rig.tuskPoints, head.pivot, angles.head, enemy, type, flip, camera, "#f0e6d2");

  ctx.fillStyle = "#2a1f18";
  for (const eye of rig.eyes) {
    const rotated = angles.head ? rotateAround(eye, head.pivot, angles.head) : eye;
    const world = enemyLocalToWorld(rotated, enemy, type, flip);
    ctx.beginPath();
    ctx.arc(world.x - camera.x, world.y - camera.y, eye.r * type.scale, 0, Math.PI * 2);
    ctx.fill();
  }

  drawEnemyHealthBar(enemy, type, flip, camera);
}

// --- Enemy family: segmented chain (3 independent body segments) ----------
// Mire Leech (Marsh Bog) — no rotate-group joints; each segment instead bobs
// vertically on its own phase-lagged sine, tail through head, for an
// inchworm-style crawl regardless of which direction it's actually moving.

function drawSegmentedChainEnemy(enemy, type, camera) {
  if (enemy.state === "dead") return;

  const rig = type.rig;
  const flip = enemy.facingX < 0 ? -1 : 1;

  drawEnemyShadow(enemy, type, flip, camera);

  const lagBySegment = { tail: 0, mid: 0.4, head: 0.8 };
  const speedMul = enemy.state === "chasing" ? 10 : 3;
  const humpOf = (key) => Math.sin(enemy.animPhase * speedMul - lagBySegment[key] * Math.PI) * 6;

  for (const key of rig.chainOrder) {
    const seg = rig.segments[key];
    const hump = humpOf(key);
    const offsetPoints = seg.points.map((p) => ({ x: p.x, y: p.y - hump }));
    drawEnemyPolygon(offsetPoints, null, 0, enemy, type, flip, camera, seg.fill);
  }

  const headHump = humpOf("head");
  const withHeadOffset = (p) => ({ x: p.x, y: p.y - headHump });

  ctx.fillStyle = "#2a1f18";
  const mouthWorld = enemyLocalToWorld(withHeadOffset(rig.mouth), enemy, type, flip);
  ctx.beginPath();
  ctx.arc(mouthWorld.x - camera.x, mouthWorld.y - camera.y, rig.mouth.r * type.scale, 0, Math.PI * 2);
  ctx.fill();

  for (const fang of rig.fangs) {
    const nums = fang.match(/-?[\d.]+/g).map(Number);
    ctx.beginPath();
    for (let i = 0; i < nums.length; i += 2) {
      const world = enemyLocalToWorld(withHeadOffset({ x: nums[i], y: nums[i + 1] }), enemy, type, flip);
      const sx = world.x - camera.x, sy = world.y - camera.y;
      if (i === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.strokeStyle = "#2a1f18";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.stroke();
  }

  ctx.fillStyle = "#c9622f";
  for (const eye of rig.eyes) {
    const world = enemyLocalToWorld(withHeadOffset(eye), enemy, type, flip);
    ctx.beginPath();
    ctx.arc(world.x - camera.x, world.y - camera.y, eye.r * type.scale, 0, Math.PI * 2);
    ctx.fill();
  }

  const tailHump = humpOf("tail");
  ctx.save();
  ctx.fillStyle = "#3a4a2a";
  ctx.globalAlpha = 0.7;
  for (const drip of rig.drips) {
    const world = enemyLocalToWorld({ x: drip.x, y: drip.y - tailHump }, enemy, type, flip);
    ctx.beginPath();
    ctx.ellipse(world.x - camera.x, world.y - camera.y, drip.rx * type.scale, drip.ry * type.scale, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  drawEnemyHealthBar(enemy, type, flip, camera);
}

// --- Enemy family: floaty (no legs, drifts) --------------------------------
// Frost Wisp (Frostfall Tundra) — body/head bob on independent sine phases,
// the tail sweeps side to side, and the back shards pulse in opacity.

function drawFloatyEnemy(enemy, type, camera) {
  if (enemy.state === "dead") return;

  const rig = type.rig;
  const flip = enemy.facingX < 0 ? -1 : 1;

  drawEnemyShadow(enemy, type, flip, camera);

  const glowWorld = enemyLocalToWorld({ x: 100, y: 100 }, enemy, type, flip);
  const gsx = glowWorld.x - camera.x, gsy = glowWorld.y - camera.y;
  const glowRadius = 70 * type.scale;
  const glow = ctx.createRadialGradient(gsx, gsy, 0, gsx, gsy, glowRadius);
  glow.addColorStop(0, "rgba(191, 227, 227, 0.35)");
  glow.addColorStop(1, "rgba(191, 227, 227, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(gsx, gsy, glowRadius, 0, Math.PI * 2);
  ctx.fill();

  const bodyBobY = Math.sin(enemy.animPhase * 2.2) * 6;
  const headBobY = Math.sin(enemy.animPhase * 2.6 + 1) * 4;

  const bodyPts = rig.segments.body.points.map((p) => ({ x: p.x, y: p.y + bodyBobY }));
  drawEnemyPolygon(bodyPts, null, 0, enemy, type, flip, camera, rig.segments.body.fill);

  const tailSwing = Math.sin(enemy.animPhase * 3) * 0.35;
  drawEnemyPathLine(rig.tailPath, { x: rig.tailPivot.x, y: rig.tailPivot.y + bodyBobY }, tailSwing, enemy, type, flip, camera, "#bcdfe8", 2);

  ctx.save();
  ctx.globalAlpha = 0.55 + Math.sin(enemy.animPhase * 4) * 0.25;
  for (const shard of rig.shards) {
    const pts = shard.points.map((p) => ({ x: p.x, y: p.y + bodyBobY }));
    drawEnemyPolygon(pts, null, 0, enemy, type, flip, camera, "#bcdfe8");
  }
  ctx.restore();

  const headPts = rig.segments.head.points.map((p) => ({ x: p.x, y: p.y + headBobY }));
  drawEnemyPolygon(headPts, null, 0, enemy, type, flip, camera, rig.segments.head.fill);

  ctx.fillStyle = "#8fe0ff";
  for (const eye of rig.eyes) {
    const world = enemyLocalToWorld({ x: eye.x, y: eye.y + headBobY }, enemy, type, flip);
    ctx.beginPath();
    ctx.arc(world.x - camera.x, world.y - camera.y, eye.r * type.scale, 0, Math.PI * 2);
    ctx.fill();
  }

  drawEnemyHealthBar(enemy, type, flip, camera);
}

// --- Enemy family: radial legs (8 legs sharing one body pivot) -----------
// Crystal Crawler (Hollow Deep) — since it can approach from any direction
// (no clear "forward"), the gait is a phase-offset ripple across all 8 legs
// rather than a facing-based walk cycle: each leg pulses its own length on a
// sine wave staggered by its index, giving an alternating-tripod feel.

function legPointsFor(pivot, angle, len, width) {
  const dx = Math.cos(angle), dy = Math.sin(angle);
  const px = -dy, py = dx;
  const cx = pivot.x, cy = pivot.y;
  return [
    { x: cx + px * width, y: cy + py * width },
    { x: cx + dx * len + px * width * 0.4, y: cy + dy * len + py * width * 0.4 },
    { x: cx + dx * len - px * width * 0.4, y: cy + dy * len - py * width * 0.4 },
    { x: cx - px * width, y: cy - py * width },
  ];
}

function drawRadialLegsEnemy(enemy, type, camera) {
  if (enemy.state === "dead") return;

  const rig = type.rig;
  const flip = enemy.facingX < 0 ? -1 : 1;

  drawEnemyShadow(enemy, type, flip, camera);

  const speedMul = enemy.state === "chasing" ? 8 : 2.5;
  rig.legAngles.forEach((angle, i) => {
    const phase = enemy.animPhase * speedMul + i * (Math.PI / 4);
    const lengthScale = 0.82 + 0.28 * (0.5 + 0.5 * Math.sin(phase));
    const points = legPointsFor(rig.legPivot, angle, rig.legLength * lengthScale, rig.legWidth);
    drawEnemyPolygon(points, null, 0, enemy, type, flip, camera, "#7a5cc4");
  });

  drawEnemyPolygon(rig.bodyPoints, null, 0, enemy, type, flip, camera, "#4a3a6a");

  ctx.fillStyle = "#8fe0ff";
  for (const eye of rig.eyes) {
    const world = enemyLocalToWorld(eye, enemy, type, flip);
    ctx.beginPath();
    ctx.arc(world.x - camera.x, world.y - camera.y, eye.r * type.scale, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#e8d8ff";
  const mouthWorld = enemyLocalToWorld(rig.mouth, enemy, type, flip);
  ctx.beginPath();
  ctx.arc(mouthWorld.x - camera.x, mouthWorld.y - camera.y, rig.mouth.r * type.scale, 0, Math.PI * 2);
  ctx.fill();

  drawEnemyHealthBar(enemy, type, flip, camera);
}

// --- Dispatch --------------------------------------------------------------

function drawEnemy(enemy, camera) {
  const type = ENEMY_TYPES[enemy.kind];
  switch (type.family) {
    case "golem": drawGolemEnemy(enemy, type, camera); break;
    case "quadruped": drawQuadrupedEnemy(enemy, type, camera); break;
    case "segmentedChain": drawSegmentedChainEnemy(enemy, type, camera); break;
    case "floaty": drawFloatyEnemy(enemy, type, camera); break;
    case "radialLegs": drawRadialLegsEnemy(enemy, type, camera); break;
  }
}

// --- Biomes ----------------------------------------------------------------

// Woodland Grove (the existing forest — trees/foliage/mushrooms/rocks/
// ambient generated in generateWorld()) occupies the inner disk; the five
// outlying biomes from the design doc each get one angular wedge of the
// annulus beyond it, out to the world's boundary wall. The wedge order is
// rotated by a random-but-seeded base angle each world generation so the
// layout varies between sessions while staying identical for every player
// in the same multiplayer game.
//
// Every boundary — the Grove/biome seam and the seam between neighboring
// biomes — blends rather than cuts: both sides of a seam keep scattering
// their own content a little way into the other's territory, fading out
// with distance past the line, so the two sets of foliage visually mingle
// instead of stopping at a drawn edge. See groveOuterFade() above and
// biomeAngularWeight()/pointWeight() below.
const BIOME_INNER_RADIUS = 7800;

const OUTER_BIOMES = [
  {
    id: "marshBog", enemyKind: "mireLeech", groundColor: "#48513c",
    treeKey: "cypress", treeDensityMul: 0.8, foliageDensityMul: 1.1,
    pickFoliage: () => (RNG.random() < 0.82 ? "reedCluster" : "mudPool"),
  },
  {
    id: "mountainFoothills", enemyKind: "cragRam", groundColor: "#767469",
    treeKey: "windBentPine", treeDensityMul: 0.5, foliageDensityMul: 0.55,
    pickFoliage: () => (RNG.random() < 0.7 ? "alpineTuft" : "scree"),
  },
  {
    id: "frostfallTundra", enemyKind: "frostWisp", groundColor: "#cfe0e4",
    treeKey: "snowPine", treeDensityMul: 0.85, foliageDensityMul: 0.5,
    pickFoliage: () => (RNG.random() < 0.6 ? "frozenShrub" : "snowdrift"),
  },
  {
    id: "sunmeadowClearing", enemyKind: "bramblingBoar", groundColor: "#a39a4a",
    treeKey: null, treeDensityMul: 0, foliageDensityMul: 1.25,
    pickFoliage: () => {
      const r = RNG.random();
      if (r < 0.35) return "wildflowerPatch";
      if (r < 0.8) return "wheatGrass";
      return "sunflowerCluster";
    },
  },
  {
    id: "hollowDeep", enemyKind: "crystalCrawler", groundColor: "#241c30",
    treeKey: null, treeDensityMul: 0, foliageDensityMul: 0.65,
    pickFoliage: () => {
      const r = RNG.random();
      if (r < 0.45) return "glowingFungus";
      if (r < 0.75) return "crystalCluster";
      return "stalagmite";
    },
  },
];
const BIOME_SECTOR_SIZE = (Math.PI * 2) / OUTER_BIOMES.length;

// Baseline biome tree/foliage density (per million px²) that each biome
// scales via its own *DensityMul, and how far a biome's content can bleed
// into a neighboring sector before fading to nothing.
const BASE_BIOME_TREE_DENSITY = 7.5;
const BASE_BIOME_FOLIAGE_DENSITY = 11;
const BIOME_ANGLE_BLEND = BIOME_SECTOR_SIZE * 0.22;

// Extra tree/foliage layer that fades in toward the world's true edge —
// the biome-side equivalent of the Grove's own boundary thickening — kept
// modest (additive, not a density multiplier) so the edge reads as
// gradually thicker forest rather than a sudden wall of trees.
const EDGE_THICKEN_WIDTH = 2500;
const EDGE_THICKEN_DENSITY_FRAC = 0.7; // fraction of the base density added at the very edge

function edgeThickenWeight(r) {
  const start = WALL_END - EDGE_THICKEN_WIDTH;
  if (r < start) return 0;
  return Math.min(1, (r - start) / EDGE_THICKEN_WIDTH);
}

let biomeBaseAngle = 0;
let biomeTrees = [];
let biomeFoliage = [];

function biomeSectorAngles(index) {
  const angleStart = biomeBaseAngle + index * BIOME_SECTOR_SIZE;
  return { angleStart, angleEnd: angleStart + BIOME_SECTOR_SIZE };
}

// Unwraps `theta` (any real angle, e.g. straight from atan2) to whichever
// representative sits within π of `reference` — lets a sampled point's raw
// angle be compared directly against a sector's angleStart/angleEnd, which
// are expressed relative to biomeBaseAngle and can run well outside the
// (-π, π] range atan2 returns.
function angleNear(theta, reference) {
  let a = theta;
  while (a < reference - Math.PI) a += Math.PI * 2;
  while (a > reference + Math.PI) a -= Math.PI * 2;
  return a;
}

// 1 well inside [angleStart, angleEnd], fading to 0 by BIOME_ANGLE_BLEND
// past either edge.
function biomeAngularWeight(theta, angleStart, angleEnd) {
  if (theta >= angleStart && theta <= angleEnd) return 1;
  const past = theta < angleStart ? angleStart - theta : theta - angleEnd;
  return Math.max(0, 1 - past / BIOME_ANGLE_BLEND);
}

function biomeTreeFootprintRadius(item) {
  return ((ForestAssets.biomeTrees[item.type].width * item.scale) / 2) * 0.75;
}

function biomeFoliageFootprintRadius(item) {
  return ((ForestAssets.biomeFoliage[item.type].width * item.scale) / 2) * 0.6;
}

// The Crystal Golem's arena — a big clearing placed at a fixed depth in the
// middle of the Hollow Deep sector (index 4 of OUTER_BIOMES; matches the
// design doc's own "Boss — Crystal Golem (Hollow Deep)" placement). Computed
// here, right after biomeBaseAngle, so the rest of generateBiomes() can
// keep ordinary biome content from scattering into it (see pointWeight
// below) — see spawnBossArena() further down for the arena furniture itself.
const BOSS_ARENA_RADIUS = 560;
let bossArenaCenter = null;

function generateBiomes() {
  biomeBaseAngle = RNG.random() * Math.PI * 2;
  biomeTrees = [];
  biomeFoliage = [];

  const hollowDeepIndex = OUTER_BIOMES.findIndex((b) => b.id === "hollowDeep");
  const hollowDeepCenterAngle = biomeBaseAngle + (hollowDeepIndex + 0.5) * BIOME_SECTOR_SIZE;
  const arenaDist = (BIOME_INNER_RADIUS + WALL_START) / 2;
  bossArenaCenter = {
    x: WORLD_CENTER.x + Math.cos(hollowDeepCenterAngle) * arenaDist,
    y: WORLD_CENTER.y + Math.sin(hollowDeepCenterAngle) * arenaDist,
  };

  const innerBlendStart = BIOME_INNER_RADIUS - GROVE_BLEND_WIDTH;

  for (let i = 0; i < OUTER_BIOMES.length; i++) {
    const biome = OUTER_BIOMES[i];
    const { angleStart, angleEnd } = biomeSectorAngles(i);
    const wideStart = angleStart - BIOME_ANGLE_BLEND;
    const wideEnd = angleEnd + BIOME_ANGLE_BLEND;
    const sectorArea = annulusArea(innerBlendStart, WALL_END, wideEnd - wideStart);

    // Combines the angular fade (this biome bleeding into its neighbors)
    // with the radial fade (this biome bleeding into the Grove) into one
    // 0..1 acceptance weight for a candidate point.
    const pointWeight = (x, y) => {
      const rawTheta = Math.atan2(y - WORLD_CENTER.y, x - WORLD_CENTER.x);
      const theta = angleNear(rawTheta, (angleStart + angleEnd) / 2);
      const angular = biomeAngularWeight(theta, angleStart, angleEnd);
      const radial = 1 - groveOuterFade(distFromCenter(x, y));
      if (Math.hypot(x - bossArenaCenter.x, y - bossArenaCenter.y) < BOSS_ARENA_RADIUS + 150) return 0;
      return angular * radial;
    };

    if (biome.treeKey && biome.treeDensityMul > 0) {
      const baseDensity = BASE_BIOME_TREE_DENSITY * biome.treeDensityMul;
      biomeTrees.push(...scatterWithDensity({
        count: densityCount(baseDensity, sectorArea),
        maxAttempts: densityCount(baseDensity, sectorArea) * 15,
        sample: () => sampleSectorAnnulus(innerBlendStart, WALL_END, wideStart, wideEnd),
        densityAt: pointWeight,
        footprintRadius: biomeTreeFootprintRadius,
        overlapAllowance: 1.0,
        build: (x, y) => ({ x, y, type: biome.treeKey, scale: 0.75 + RNG.random() * 0.5 }),
      }));
      // Extra layer fading in toward the world's true edge — a gradual
      // thickening rather than a sudden denser band starting at WALL_START.
      const edgeDensity = baseDensity * EDGE_THICKEN_DENSITY_FRAC;
      biomeTrees.push(...scatterWithDensity({
        count: densityCount(edgeDensity, sectorArea),
        maxAttempts: densityCount(edgeDensity, sectorArea) * 15,
        sample: () => sampleSectorAnnulus(innerBlendStart, WALL_END, wideStart, wideEnd),
        densityAt: (x, y) => pointWeight(x, y) * edgeThickenWeight(distFromCenter(x, y)),
        footprintRadius: biomeTreeFootprintRadius,
        overlapAllowance: 1.0,
        build: (x, y) => ({ x, y, type: biome.treeKey, scale: 0.8 + RNG.random() * 0.5 }),
      }));
    }

    const foliageDensity = BASE_BIOME_FOLIAGE_DENSITY * biome.foliageDensityMul;
    biomeFoliage.push(...scatterWithDensity({
      count: densityCount(foliageDensity, sectorArea),
      maxAttempts: densityCount(foliageDensity, sectorArea) * 12,
      sample: () => sampleSectorAnnulus(innerBlendStart, WALL_END, wideStart, wideEnd),
      densityAt: pointWeight,
      footprintRadius: biomeFoliageFootprintRadius,
      overlapAllowance: 0.85,
      build: (x, y) => ({ x, y, type: biome.pickFoliage(), scale: 0.8 + RNG.random() * 0.35, flip: RNG.random() < 0.5 }),
    }));
  }

  insertIntoRenderGrid("biomeTree", biomeTrees);
  insertIntoRenderGrid("biomeFoliage", biomeFoliage);
}

// Enemies per 1,000,000 px², same area-derived approach as the tree/
// foliage density constants — a flat headcount (the original 3-per-biome)
// stopped making sense once the world's area grew ~35x; this keeps
// encounter frequency consistent regardless of how big the world is tuned
// to be.
const GOLEM_DENSITY = 0.13;
const BIOME_ENEMY_DENSITY = 0.13;

function spawnEnemies() {
  enemies = [];

  // Woodland Grove's golems stay within the inner disk, same spawn band as
  // before (just capped short of the biome boundary instead of the old
  // full-world wall).
  const golemArea = annulusArea(CLEARING_RADIUS + 300, BIOME_INNER_RADIUS - 150);
  spawnEnemyGroup("golem", densityCount(GOLEM_DENSITY, golemArea), () => sampleAnnulus(CLEARING_RADIUS + 300, BIOME_INNER_RADIUS - 150));

  for (let i = 0; i < OUTER_BIOMES.length; i++) {
    const biome = OUTER_BIOMES[i];
    const { angleStart, angleEnd } = biomeSectorAngles(i);
    const sectorArea = annulusArea(BIOME_INNER_RADIUS + 150, WALL_START, angleEnd - angleStart);
    spawnEnemyGroup(biome.enemyKind, densityCount(BIOME_ENEMY_DENSITY, sectorArea), () => sampleSectorAnnulus(BIOME_INNER_RADIUS + 150, WALL_START, angleStart, angleEnd));
  }
}

// Tints each outlying biome's ground, blended smoothly rather than as a
// hard-edged wedge: a conic gradient handles the angular blend between
// neighboring biomes (a plateau of pure color across most of each sector,
// then a short ramp into the next), and a band of concentric alpha-stepped
// rings handles the radial blend back into the Grove's plain green.
const BIOME_WEDGE_OUTER_RADIUS = 40000;
const BIOME_GROUND_RAMP_FRAC = 0.16; // fraction of a sector's angular width spent blending into the next biome
const GROVE_GROUND_RING_STEPS = 22;

// Conic gradients can't be told to blend across their own seam (the point
// where offset 1.0 meets offset 0.0) — a stop list that assigns a color at
// offset 0 and a different one near offset 1 always shows a hard cut right
// there. Placing that seam in the middle of one biome's own plateau (via
// `startAngle`, and splitting that one biome's plateau into the two pieces
// that meet at 0 and 1) makes it invisible instead of avoiding it.
function addBiomeGroundStops(gradient) {
  const n = OUTER_BIOMES.length;
  const sectorFrac = 1 / n;
  const rampFrac = sectorFrac * BIOME_GROUND_RAMP_FRAC;
  for (let i = 0; i < n; i++) {
    const biome = OUTER_BIOMES[i];
    const start = ((((i - 0.5) * sectorFrac + rampFrac) % 1) + 1) % 1;
    const end = ((((i + 0.5) * sectorFrac - rampFrac) % 1) + 1) % 1;
    if (start <= end) {
      gradient.addColorStop(start, biome.groundColor);
      gradient.addColorStop(end, biome.groundColor);
    } else {
      // This biome's plateau straddles the seam — split it into the piece
      // ending at 0 and the piece starting at 1.
      gradient.addColorStop(0, biome.groundColor);
      gradient.addColorStop(end, biome.groundColor);
      gradient.addColorStop(start, biome.groundColor);
      gradient.addColorStop(1, biome.groundColor);
    }
  }
}

function drawBiomeGround(camera) {
  const cx = WORLD_CENTER.x - camera.x;
  const cy = WORLD_CENTER.y - camera.y;

  const blendInner = BIOME_INNER_RADIUS - GROVE_BLEND_WIDTH;
  const blendOuter = BIOME_INNER_RADIUS + GROVE_BLEND_WIDTH;

  // Cheap perf guard: skip this whole pass if the entire visible viewport
  // is comfortably inside the Grove — drawGround()'s plain green already
  // covers that case, and this can be a meaningful chunk of every frame
  // when it's not needed (a conic gradient plus ~24 ring fills).
  const playerDist = distFromCenter(player.x, player.y);
  const viewSpan = Math.max(canvas.width, canvas.height) / camera.zoom;
  if (playerDist + viewSpan < blendInner) return;

  const startAngle = biomeBaseAngle + BIOME_SECTOR_SIZE / 2;
  const gradient = ctx.createConicGradient(startAngle, cx, cy);
  addBiomeGroundStops(gradient);

  ctx.save();
  ctx.fillStyle = gradient;

  // Beyond the blend band: one solid fill, fully opaque.
  ctx.beginPath();
  ctx.arc(cx, cy, BIOME_WEDGE_OUTER_RADIUS, 0, Math.PI * 2);
  ctx.arc(cx, cy, blendOuter, 0, Math.PI * 2, true);
  ctx.fill();

  // Blend band: thin concentric rings stepping alpha 0 -> 1, so the seam
  // with the Grove's plain green reads as a gradient instead of a line.
  if (playerDist - viewSpan < blendOuter) {
    for (let s = 0; s < GROVE_GROUND_RING_STEPS; s++) {
      const t0 = s / GROVE_GROUND_RING_STEPS;
      const t1 = (s + 1) / GROVE_GROUND_RING_STEPS;
      ctx.globalAlpha = (t0 + t1) / 2;
      ctx.beginPath();
      ctx.arc(cx, cy, blendInner + (blendOuter - blendInner) * t1, 0, Math.PI * 2);
      ctx.arc(cx, cy, blendInner + (blendOuter - blendInner) * t0, 0, Math.PI * 2, true);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawBiomeTree(item, camera) {
  drawGroundSprite(ForestAssets.biomeTrees[item.type], item, camera);
}

function drawBiomeFoliage(item, camera) {
  if (item.destroyed) return; // scree/stalagmite shattered by Earth Breaker — see castEarthBreaker()
  drawGroundSprite(ForestAssets.biomeFoliage[item.type], item, camera);
}

// --- Projectiles ---------------------------------------------------------------

const FIRE_BOLT_SPEED = 480;
const FIRE_BOLT_RANGE = 620;
const FIRE_BOLT_DAMAGE = 30;
const FIRE_BOLT_HIT_RADIUS = 42;

let projectiles = [];

function castFireBolt() {
  projectiles.push({
    x: player.x,
    y: player.y,
    vx: player.facingX * FIRE_BOLT_SPEED,
    vy: player.facingY * FIRE_BOLT_SPEED,
    traveled: 0,
  });
}

function updateProjectiles(dt) {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i];
    const stepX = p.vx * dt;
    const stepY = p.vy * dt;
    p.x += stepX;
    p.y += stepY;
    p.traveled += Math.hypot(stepX, stepY);

    let hit = false;
    for (const enemy of enemies) {
      if (enemy.state === "dead") continue;
      if (Math.hypot(p.x - enemy.x, p.y - enemy.y) < FIRE_BOLT_HIT_RADIUS) {
        enemy.health -= FIRE_BOLT_DAMAGE;
        spawnEffect(p.x, p.y, "fireImpact", 0.4);
        if (enemy.health <= 0) {
          killEnemy(enemy);
          Sound.enemyDeath();
        } else {
          Sound.enemyTakeDamage();
        }
        hit = true;
        break;
      }
    }

    if (hit || p.traveled > FIRE_BOLT_RANGE || isPointBlocked(p.x, p.y)) {
      if (!hit) spawnEffect(p.x, p.y, "fireImpact", 0.3);
      projectiles.splice(i, 1);
    }
  }
}

function drawProjectile(p, camera) {
  const asset = ForestAssets.spellEffects.fireBolt;
  const angle = Math.atan2(p.vy, p.vx);
  const screenX = p.x - camera.x;
  const screenY = p.y - camera.y;
  ctx.save();
  ctx.translate(screenX, screenY);
  ctx.rotate(angle);
  ctx.drawImage(asset.image, -asset.width * 0.25, -asset.height / 2, asset.width, asset.height);
  ctx.restore();
}

// --- Boss projectiles (Crystal Golem's ranged attack) -----------------------

const CRYSTAL_SHARD_SPEED = 420;
const CRYSTAL_SHARD_RANGE = 750;
const CRYSTAL_SHARD_DAMAGE = 14;
const CRYSTAL_SHARD_HIT_RADIUS = 34;
const CRYSTAL_GOLEM_SLAM_RADIUS = 260;

let bossProjectiles = [];

// One of the Crystal Golem's three attacks (see the crystalAttackPattern
// roll in updateEnemy) — the melee swing is just the ordinary per-enemy
// check every other enemy already has, so only these two need bespoke
// handling.
function resolveCrystalGolemAttack(enemy, distToPlayer) {
  if (enemy.crystalAttackPattern === "ranged") {
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const len = Math.hypot(dx, dy) || 1;
    bossProjectiles.push({ x: enemy.x, y: enemy.y, vx: (dx / len) * CRYSTAL_SHARD_SPEED, vy: (dy / len) * CRYSTAL_SHARD_SPEED, traveled: 0 });
  } else if (enemy.crystalAttackPattern === "slam") {
    spawnEffect(enemy.x, enemy.y, "slamShardBurst", 0.5, 1.6);
    Sound.earthShatter(0);
    if (distToPlayer < CRYSTAL_GOLEM_SLAM_RADIUS) player.takeDamage(Math.round(ENEMY_TYPES.crystalGolem.attackDamage * 0.75));
  }
}

function updateBossProjectiles(dt) {
  for (let i = bossProjectiles.length - 1; i >= 0; i--) {
    const p = bossProjectiles[i];
    const stepX = p.vx * dt;
    const stepY = p.vy * dt;
    p.x += stepX;
    p.y += stepY;
    p.traveled += Math.hypot(stepX, stepY);

    if (Math.hypot(p.x - player.x, p.y - player.y) < CRYSTAL_SHARD_HIT_RADIUS) {
      player.takeDamage(CRYSTAL_SHARD_DAMAGE);
      Sound.enemyHitPlayer();
      spawnEffect(p.x, p.y, "coreShatter", 0.3, 0.6);
      bossProjectiles.splice(i, 1);
      continue;
    }
    if (p.traveled > CRYSTAL_SHARD_RANGE || isPointBlocked(p.x, p.y)) {
      bossProjectiles.splice(i, 1);
    }
  }
}

function drawBossProjectile(p, camera) {
  const screenX = p.x - camera.x;
  const screenY = p.y - camera.y;
  const angle = Math.atan2(p.vy, p.vx);
  ctx.save();
  ctx.translate(screenX, screenY);
  ctx.rotate(angle);
  ctx.fillStyle = "#8fe0ff";
  ctx.strokeStyle = "#e8d8ff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(14, 0);
  ctx.lineTo(0, -6);
  ctx.lineTo(-10, 0);
  ctx.lineTo(0, 6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

// --- One-shot spell effects ----------------------------------------------------

let effects = [];

function spawnEffect(x, y, type, duration, scale) {
  effects.push({ x, y, type, age: 0, duration, scale });
}

function updateEffects(dt) {
  for (let i = effects.length - 1; i >= 0; i--) {
    effects[i].age += dt;
    if (effects[i].age >= effects[i].duration) effects.splice(i, 1);
  }
}

function drawEffect(effect, camera) {
  const t = effect.age / effect.duration; // 0 -> 1
  const screenX = effect.x - camera.x;
  const screenY = effect.y - camera.y;

  const burstAsset = ForestAssets.spellEffects[effect.type] || ForestAssets.bossEffects[effect.type];
  if (burstAsset) {
    const scale = (0.7 + t * 0.5) * (effect.scale || 1);
    ctx.save();
    ctx.globalAlpha = Math.max(0, 1 - t);
    ctx.translate(screenX, screenY);
    ctx.scale(scale, scale);
    ctx.drawImage(burstAsset.image, -burstAsset.width / 2, -burstAsset.height / 2, burstAsset.width, burstAsset.height);
    ctx.restore();
    return;
  }

  if (effect.type === "healBurst") {
    ctx.save();
    ctx.globalAlpha = Math.max(0, 1 - t);
    ctx.strokeStyle = "#a8e6c8";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(screenX, screenY, 20 + t * 40, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(screenX, screenY, 10 + t * 24, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = "#f0fff8";
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    const armLen = 14 + t * 6;
    ctx.beginPath();
    ctx.moveTo(screenX, screenY - armLen);
    ctx.lineTo(screenX, screenY + armLen);
    ctx.moveTo(screenX - armLen, screenY);
    ctx.lineTo(screenX + armLen, screenY);
    ctx.stroke();
    ctx.restore();
    return;
  }

  if (effect.type === "windExplosion") {
    ctx.save();
    ctx.globalAlpha = Math.max(0, 1 - t);
    const radius = 20 + t * 90;
    ctx.strokeStyle = "#d8f0f0";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(screenX, screenY, radius * 0.35, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = "#bfe3e3";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(screenX, screenY, radius * 0.65, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.globalAlpha = Math.max(0, (1 - t) * 0.6);
    ctx.beginPath();
    ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "#d8f0f0";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.globalAlpha = Math.max(0, 1 - t);
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const inner = radius * 0.7;
      const outer = radius * 0.85;
      ctx.beginPath();
      ctx.moveTo(screenX + Math.cos(angle) * inner, screenY + Math.sin(angle) * inner);
      ctx.lineTo(screenX + Math.cos(angle) * outer, screenY + Math.sin(angle) * outer);
      ctx.stroke();
    }
    ctx.fillStyle = "#d8f0f0";
    ctx.beginPath();
    ctx.arc(screenX, screenY, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

const WIND_EXPLOSION_RADIUS = 220;
const WIND_KNOCKBACK_FORCE = 260;

function castWindExplosion() {
  spawnEffect(player.x, player.y, "windExplosion", 0.7);
  for (const enemy of enemies) {
    if (enemy.state === "dead") continue;
    const dist = Math.hypot(enemy.x - player.x, enemy.y - player.y);
    if (dist >= WIND_EXPLOSION_RADIUS) continue;
    const dx = (enemy.x - player.x) / (dist || 1);
    const dy = (enemy.y - player.y) / (dist || 1);
    const force = WIND_KNOCKBACK_FORCE * (1 - dist / WIND_EXPLOSION_RADIUS);
    const newX = enemy.x + dx * force;
    const newY = enemy.y + dy * force;
    if (!isPointInWater(newX, newY)) {
      enemy.x = newX;
      enemy.y = newY;
    }
    enemy.state = "idle";
    enemy.attackCooldown = 0;
    enemy.attackWindup = 0;
  }
}

// --- Spawn Hub (Village) -----------------------------------------------------

// A small, hand-authored, non-random home base — the player always starts
// here (see startGame()) and can always return (see transitionToVillage()).
// Deliberately minimal right now: one NPC, the campfire, a notice board, and
// a thick ring of trees fully enclosing the clearing — more of the village
// (more NPCs, an actual way out) opens up feature by feature.
//
// Every position below is a fixed offset from VILLAGE_CENTER, placed by
// hand — the only randomness is the boundary tree ring's natural scatter
// look, which uses its own tiny seeded generator (never the shared RNG, so
// re-seeding it for multiplayer never changes this layout) rather than a
// hardcoded list of tree coordinates.
function createVillageRng(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Idempotent — safe even if onComplete somehow ran twice.
function grantWeapon() {
  if (player.hasWeapon) return;
  player.hasWeapon = true;
  Sound.heal(); // reuse the "gained something" chime — no dedicated one yet
}

// Linear (non-branching) NPC lines — pressing F advances one line at a
// time; the last line closes the panel and, the first time through, runs
// onComplete. Positions are offsets from VILLAGE_CENTER. Lore only for
// now, plus the weapon — no spells; casting opens up later through other
// NPCs (see SPELLS_ENABLED).
const NPC_DEFS = [
  {
    id: "elder", kind: "trainer", name: "Elder", x: -70, y: -40,
    lines: [
      "You're awake. Good — the Sanctuary doesn't see many new faces.",
      "Long ago this whole forest was one and the same. Then something changed, and it split into six wild regions, each stranger than the last.",
      "Here — take this. Everyone who leaves this clearing carries something. Right arrow swings it, once you've got the feel for standing still long enough to aim.",
      "See that deadwood past the treeline east of here? Old, dry, brittle — a solid swing will clear it right out of your way. Living wood won't budge the same.",
      "Rest by the fire when you need to. The Sanctuary's yours to explore.",
    ],
    onComplete: () => grantWeapon(),
  },
];

const NPC_PORTRAIT_COLOR = {
  trainer: "#6b5a8a",
};

// A solid, gapless ring of trees just past the clamp — several overlapping
// rows at slightly different radii so it reads as "VERY thick" rather than
// a thin treeline. clampToWorld()'s hard radius clamp (see VILLAGE_RADIUS)
// is what actually stops the player from leaving; this is just what that
// wall looks like, and it starts a little past that radius so the player
// never visually clips into a trunk before the invisible wall stops them.
//
// Placed at even angular spacing (with light jitter) rather than by
// overlap-rejection sampling — random sampling near the maximum packing
// density mostly just rejects itself, since each tree's own footprint
// radius (see treeFootprintRadius()) is already ~50px, so its "keep some
// space between trunks" spacing is wider than the tightly-packed thicket
// this needs. `spacing` here is deliberately much tighter than that, so
// neighboring trunks overlap and no light gets through.
const VILLAGE_TREE_RING_ROWS = [
  { r: 355, spacing: 34 },
  { r: 410, spacing: 34 },
  { r: 465, spacing: 34 },
];

// The arena clearing's own boundary ring — same shape, scaled up for its
// much bigger radius (the count-from-circumference formula in
// scatterTreeRing() below handles that automatically, no separate tuning).
const VILLAGE_ARENA_RING_ROWS = [
  { r: VILLAGE_ARENA_RADIUS + 15, spacing: 34 },
  { r: VILLAGE_ARENA_RADIUS + 70, spacing: 34 },
  { r: VILLAGE_ARENA_RADIUS + 125, spacing: 34 },
];

// Hedge-like walls flanking the corridor, two rows per side.
const VILLAGE_PATH_WALL_ROWS = [
  { offset: VILLAGE_PATH_HALF_WIDTH + 25, spacing: 34 },
  { offset: VILLAGE_PATH_HALF_WIDTH + 80, spacing: 34 },
];

let village = null;

// NPC source art (ForestAssets.npcs, ~92x131px for the trainer sprite) is
// drawn much taller than the player rig at PLAYER_RIG_SCALE reads on
// screen — see that constant's comment. Scaled down here, at placement,
// rather than by shrinking the source art, since npcMeta's width/height
// also double as its groundFraction anchor math in drawGroundSprite().
const NPC_DISPLAY_SCALE = 0.65;

// Places one ring of trees (see VILLAGE_TREE_RING_ROWS's comment on why
// even-spacing-plus-jitter beats overlap-rejection here), optionally
// leaving a gap of `gapWidth` world px centered on `gapAngle` — used to
// carve the corridor's opening out of both the village's own ring and the
// arena's.
function scatterTreeRing(rng, decor, treeTypes, center, rows, gapAngle, gapWidth) {
  for (const row of rows) {
    const count = Math.round((2 * Math.PI * row.r) / row.spacing);
    const gapHalfAngle = gapAngle === null ? 0 : Math.atan2(gapWidth / 2, row.r);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (rng() - 0.5) * (Math.PI / count);
      if (gapAngle !== null) {
        const diff = Math.abs(((angle - gapAngle + Math.PI) % (Math.PI * 2)) - Math.PI);
        if (diff < gapHalfAngle) continue;
      }
      const r = row.r + (rng() - 0.5) * 20;
      const x = center.x + Math.cos(angle) * r;
      const y = center.y + Math.sin(angle) * r;
      decor.push({ category: "tree", x, y, type: treeTypes[Math.floor(rng() * treeTypes.length)], scale: 0.8 + rng() * 0.5 });
    }
  }
}

function generateVillage() {
  const rng = createVillageRng(20260812); // fixed seed — identical layout every time
  const renderGrid = WorldGen.createBucketGrid(400);

  const npcs = NPC_DEFS.map((def) => ({
    def,
    x: VILLAGE_CENTER.x + def.x,
    y: VILLAGE_CENTER.y + def.y,
    kind: def.kind,
    scale: NPC_DISPLAY_SCALE,
    flip: false,
  }));

  const decor = [];
  function place(category, kind, x, y, scale = 1, flip = false) {
    decor.push({ category, kind, x: VILLAGE_CENTER.x + x, y: VILLAGE_CENTER.y + y, scale, flip });
  }

  place("hubFeatures", "noticeBoard", 110, -70);
  decor.push({ category: "hubFeatures", kind: "arenaRing", x: VILLAGE_ARENA_CENTER.x, y: VILLAGE_ARENA_CENTER.y, scale: 1.8, flip: false });

  const treeTypes = ["common", "birch", "pine", "willow", "elder"];
  const gapWidth = VILLAGE_PATH_HALF_WIDTH * 2 + 40; // a little wider than the corridor itself so trees don't crowd its mouth

  // The village's own ring, gapped where the corridor leaves it (due east)...
  scatterTreeRing(rng, decor, treeTypes, VILLAGE_CENTER, VILLAGE_TREE_RING_ROWS, 0, gapWidth);
  // ...and the arena's ring, gapped on the side facing back down the corridor.
  scatterTreeRing(rng, decor, treeTypes, VILLAGE_ARENA_CENTER, VILLAGE_ARENA_RING_ROWS, Math.PI, gapWidth);

  // Hedges along both sides of the corridor connecting them.
  for (const wallRow of VILLAGE_PATH_WALL_ROWS) {
    for (const side of [-1, 1]) {
      const count = Math.round(VILLAGE_PATH_LENGTH / wallRow.spacing);
      for (let i = 0; i < count; i++) {
        const x = VILLAGE_PATH_X0 + (i / count) * VILLAGE_PATH_LENGTH + (rng() - 0.5) * 20;
        const y = VILLAGE_CENTER.y + side * wallRow.offset + (rng() - 0.5) * 20;
        decor.push({ category: "tree", x, y, type: treeTypes[Math.floor(rng() * treeTypes.length)], scale: 0.8 + rng() * 0.5 });
      }
    }
  }

  // The dead-tree cluster blocking the corridor's mouth until the player
  // breaks it open with their weapon (see resolveWeaponHit()) — same
  // shatter mechanic Earth Breaker used for the old gate, just
  // weapon-triggered. Once every tree here is destroyed, village.pathOpen
  // flips true and isPointInVillageBounds() opens the corridor and arena up.
  //
  // Positions are deliberately fixed (not scattered by rng()) — each
  // obstacle's own blocking radius keeps the player from approaching past
  // roughly VILLAGE_PATH_X0 - 40, so this specific spread is what keeps
  // every tree within WEAPON_RANGE from that one legal standing spot right
  // in front of the cluster.
  const pathBreakTrees = [];
  for (const yOffset of [-50, 0, 50]) {
    const x = VILLAGE_PATH_X0 + 10;
    const y = VILLAGE_CENTER.y + yOffset;
    const tree = { x, y, type: "dead", scale: 1.05 + rng() * 0.15, destroyed: false };
    pathBreakTrees.push(tree);
    obstacles.push({ type: "circle", kind: "villagePathBlock", x, y, radius: 50, expiresAt: Infinity });
  }

  for (const item of decor) {
    renderGrid.insert(item.x, item.y, { y: item.y, kind: item.category, item });
  }
  for (const tree of pathBreakTrees) {
    renderGrid.insert(tree.x, tree.y, { y: tree.y, kind: "pathBreakTree", item: tree });
  }

  village = {
    npcs,
    decor,
    pathBreakTrees,
    pathOpen: false,
    campfire: { x: VILLAGE_CENTER.x, y: VILLAGE_CENTER.y, scale: 1, flip: false },
    renderGrid,
    spawnPoint: { x: VILLAGE_CENTER.x, y: VILLAGE_CENTER.y + 90 },
  };
}

function drawVillageGround() {
  ctx.fillStyle = "#3f6b3f"; // a touch warmer than the wild forest's green
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawNpc(item, camera) {
  drawGroundSprite(ForestAssets.npcs[item.kind], item, camera);
}

function drawHubFeature(item, camera) {
  drawGroundSprite(ForestAssets.hubFeatures[item.kind], item, camera);
}

function drawPathBreakTree(item, camera) {
  if (item.destroyed) return; // shattered by the player's weapon
  drawTree(item, camera);
}

function drawVillage(camera, mp) {
  drawVillageGround();

  const drawables = [];
  drawables.push({ y: village.campfire.y, kind: "campfire", item: village.campfire });
  const viewHalfW = canvas.width / (2 * camera.zoom) + RENDER_VIEW_MARGIN;
  const viewHalfH = canvas.height / (2 * camera.zoom) + RENDER_VIEW_MARGIN;
  const viewCenterX = camera.x + canvas.width / 2;
  const viewCenterY = camera.y + canvas.height / 2;
  village.renderGrid.queryRect(viewCenterX - viewHalfW, viewCenterY - viewHalfH, viewCenterX + viewHalfW, viewCenterY + viewHalfH, drawables);
  for (const npc of village.npcs) drawables.push({ y: npc.y, kind: "npc", item: npc });
  if (mp) {
    for (const remote of mp.getRemotePlayers()) drawables.push({ y: remote.y, kind: "remote", item: remote });
  }
  drawables.push({ y: player.y, kind: "player", item: null });

  drawables.sort((a, b) => a.y - b.y);
  for (const d of drawables) {
    switch (d.kind) {
      case "tree": drawTree(d.item, camera); break;
      case "pathBreakTree": drawPathBreakTree(d.item, camera); break;
      case "hubFeatures": drawHubFeature(d.item, camera); break;
      case "npc": drawNpc(d.item, camera); break;
      case "campfire": drawCampfire(d.item, camera); break;
      case "remote": drawPlayerLike(ctx, camera, { ...d.item, radius: 14 }); break;
      case "player": player.draw(ctx, camera); break;
    }
  }

  drawObstacles(camera);
  for (const effect of effects) drawEffect(effect, camera);
}

// --- NPC interaction & guided dialogue --------------------------------------

const NPC_INTERACT_RADIUS = 90;
const RUNE_INTERACT_RADIUS = 110;

let activeDialogue = null; // { npc, lineIndex } | null

function findNearestVillageNpc() {
  if (!village) return null;
  let best = null;
  let bestDist = NPC_INTERACT_RADIUS;
  for (const npc of village.npcs) {
    const d = Math.hypot(player.x - npc.x, player.y - npc.y);
    if (d < bestDist) {
      best = npc;
      bestDist = d;
    }
  }
  return best;
}

function openDialogue(npc) {
  activeDialogue = { npc, lineIndex: 0 };
  dialoguePanelEl.classList.remove("hidden");
  dialoguePortraitEl.style.background = NPC_PORTRAIT_COLOR[npc.def.kind] || "#8a7a68";
  dialogueNameEl.textContent = npc.def.name;
  dialogueTextEl.textContent = npc.def.lines[0];
  Sound.menuOpen();
}

function advanceDialogue() {
  if (!activeDialogue) return;
  activeDialogue.lineIndex++;
  const { npc, lineIndex } = activeDialogue;
  if (lineIndex >= npc.def.lines.length) {
    closeDialogue();
    if (npc.def.onComplete) npc.def.onComplete();
    return;
  }
  dialogueTextEl.textContent = npc.def.lines[lineIndex];
}

function closeDialogue() {
  activeDialogue = null;
  dialoguePanelEl.classList.add("hidden");
  Sound.menuClose();
}

// --- Boss Arena: Crystal Golem (Hollow Deep) --------------------------------

// bossArenaCenter/BOSS_ARENA_RADIUS are set by generateBiomes() above, which
// also keeps ordinary biome content from scattering into the clearing.
const BOSS_BARRIER_RING_RX = BOSS_ARENA_RADIUS - 60;
const BOSS_BARRIER_RING_RY = BOSS_BARRIER_RING_RX * 0.72;

let bossArenaState = null; // built once per world by spawnBossArenaFurniture()

function spawnBossArenaFurniture() {
  bossArenaState = {
    center: bossArenaCenter,
    runeState: "dormant", // "dormant" | "channeling" | "defeated"
    barrierObstacles: [],
    golemEnemy: null,
  };
}

function activateBossArena() {
  if (!bossArenaState || bossArenaState.runeState !== "dormant") return;
  bossArenaState.runeState = "channeling";
  Sound.cast("wind");

  const points = ForestAssets.barrierRingPoints(bossArenaState.center.x, bossArenaState.center.y, BOSS_BARRIER_RING_RX, BOSS_BARRIER_RING_RY, 8);
  for (const p of points) {
    bossArenaState.barrierObstacles.push({ type: "circle", kind: "crystalBarrier", x: p.x, y: p.y, radius: 60, expiresAt: Infinity });
  }
  obstacles.push(...bossArenaState.barrierObstacles);

  const golem = makeEnemy("crystalGolem", bossArenaState.center.x, bossArenaState.center.y);
  golem.state = "chasing"; // a boss doesn't get an idle grace period
  enemies.push(golem);
  bossArenaState.golemEnemy = golem;
}

function updateBossArena() {
  if (!bossArenaState || bossArenaState.runeState !== "channeling") return;
  if (bossArenaState.golemEnemy && bossArenaState.golemEnemy.state === "dead") {
    bossArenaState.runeState = "defeated";
    for (const obs of bossArenaState.barrierObstacles) {
      const idx = obstacles.indexOf(obs);
      if (idx !== -1) obstacles.splice(idx, 1);
    }
    bossArenaState.barrierObstacles = [];
    unlockSpell(BOSS_REWARD_SPELL);
  }
}

function drawBossArena(camera) {
  if (!bossArenaState) return;
  drawGroundSprite(ForestAssets.bossArena.arenaClearing, { x: bossArenaState.center.x, y: bossArenaState.center.y, scale: 2.9, flip: false }, camera);
  const runeAsset = bossArenaState.runeState === "dormant" ? ForestAssets.bossArena.runeDormant : ForestAssets.bossArena.runeChanneling;
  if (bossArenaState.runeState !== "defeated") {
    drawGroundSprite(runeAsset, { x: bossArenaState.center.x, y: bossArenaState.center.y, scale: 1.6, flip: false }, camera);
  }
  if (bossArenaState.runeState === "channeling") {
    const points = ForestAssets.barrierRingPoints(bossArenaState.center.x, bossArenaState.center.y, BOSS_BARRIER_RING_RX, BOSS_BARRIER_RING_RY, 8);
    for (const p of points) {
      drawGroundSprite(ForestAssets.crystalBarrier, { x: p.x, y: p.y, scale: 1.15, flip: false }, camera);
    }
  }
}

// --- Area transitions --------------------------------------------------------

// No in-game way out of the village yet — these are only ever called from
// the boss arena's return trip and the dev console (see js/lobby.js's
// Return-to-village button and DEV_COMMANDS.teleport).

function transitionToWorld() {
  currentArea = "world";
  player.x = campfire.x;
  player.y = campfire.y + 110;
  player.dashTimeLeft = 0;
}

function transitionToVillage() {
  currentArea = "village";
  player.x = village.spawnPoint.x;
  player.y = village.spawnPoint.y;
  player.dashTimeLeft = 0;
  lobbyEl.classList.add("lobby-hidden");
}
window.transitionToVillage = transitionToVillage; // bridge for js/lobby.js's Return button

// --- Dev command console ------------------------------------------------

// A "/" console for development/testing — jumping straight to a location or
// wiping the save without actually playing through to get there. Not part
// of the story or the in-universe UI at all; see #dev-console's styling.
let devConsoleOpen = false;
let devConsoleSuggestions = [];
let devConsoleSuggestionIndex = -1;

function teleportToBiomeIndex(index) {
  currentArea = "world";
  const { angleStart, angleEnd } = biomeSectorAngles(index);
  const centerAngle = (angleStart + angleEnd) / 2;
  const radius = (BIOME_INNER_RADIUS + WALL_START) / 2; // mid-depth — past the Grove blend, short of the boundary wall
  player.x = WORLD_CENTER.x + Math.cos(centerAngle) * radius;
  player.y = WORLD_CENTER.y + Math.sin(centerAngle) * radius;
}

const DEV_TELEPORT_TARGETS = {
  village() {
    currentArea = "village";
    player.x = village.spawnPoint.x;
    player.y = village.spawnPoint.y;
  },
  crystal_golem_boss() {
    currentArea = "world";
    player.x = bossArenaCenter.x + 60;
    player.y = bossArenaCenter.y + 60;
  },
  woodland_grove() {
    currentArea = "world";
    player.x = WORLD_CENTER.x;
    player.y = WORLD_CENTER.y + BIOME_INNER_RADIUS * 0.5;
  },
  marsh_bog: () => teleportToBiomeIndex(OUTER_BIOMES.findIndex((b) => b.id === "marshBog")),
  mountain_foothills: () => teleportToBiomeIndex(OUTER_BIOMES.findIndex((b) => b.id === "mountainFoothills")),
  frostfall_tundra: () => teleportToBiomeIndex(OUTER_BIOMES.findIndex((b) => b.id === "frostfallTundra")),
  sunmeadow_clearing: () => teleportToBiomeIndex(OUTER_BIOMES.findIndex((b) => b.id === "sunmeadowClearing")),
  hollow_deep: () => teleportToBiomeIndex(OUTER_BIOMES.findIndex((b) => b.id === "hollowDeep")),
};

const DEV_COMMANDS = {
  teleport: {
    argOptions: () => Object.keys(DEV_TELEPORT_TARGETS),
    run(args) {
      const target = DEV_TELEPORT_TARGETS[(args[0] || "").toLowerCase()];
      if (!target) return;
      target();
      player.dashTimeLeft = 0;
      lobbyEl.classList.add("lobby-hidden");
      closeDialogue();
    },
  },
  // Wipes the save (unlocked spells + the persisted world seed) and
  // reloads — the simplest way to guarantee every bit of derived state
  // (village gate, biome layout, everything) actually starts fresh rather
  // than trying to hand-reset it all in place.
  reset: {
    argOptions: () => [],
    run() {
      try {
        localStorage.removeItem(UNLOCK_STORAGE_KEY);
        localStorage.removeItem(WORLD_SEED_KEY);
      } catch {
        // Nothing to clear if storage was never available.
      }
      window.location.reload();
    },
  },
};

// Command-name completions with no argument yet, or that command's own
// argOptions() once a space has been typed — either way prefix-filtered
// against whatever's typed so far.
function computeDevConsoleSuggestions(raw) {
  const text = raw.replace(/^\//, "");
  const spaceIdx = text.indexOf(" ");
  if (spaceIdx === -1) {
    const prefix = text.toLowerCase();
    return Object.keys(DEV_COMMANDS).filter((c) => c.startsWith(prefix)).map((c) => "/" + c);
  }
  const cmdName = text.slice(0, spaceIdx).toLowerCase();
  const cmd = DEV_COMMANDS[cmdName];
  if (!cmd) return [];
  const argPrefix = text.slice(spaceIdx + 1).toLowerCase();
  return cmd.argOptions().filter((a) => a.startsWith(argPrefix)).map((a) => `/${cmdName} ${a}`);
}

function renderDevConsoleSuggestions() {
  devConsoleSuggestionsEl.textContent = "";
  devConsoleSuggestions.forEach((s, i) => {
    const row = document.createElement("div");
    row.className = "dev-console-suggestion" + (i === devConsoleSuggestionIndex ? " active" : "");
    row.textContent = s;
    devConsoleSuggestionsEl.appendChild(row);
  });
}

function openDevConsole() {
  devConsoleOpen = true;
  for (const key of Object.keys(keys)) keys[key] = false; // don't leave movement stuck held while typing
  devConsoleEl.classList.remove("hidden");
  devConsoleInputEl.value = "/";
  devConsoleInputEl.focus();
  devConsoleSuggestions = computeDevConsoleSuggestions("/");
  devConsoleSuggestionIndex = -1;
  renderDevConsoleSuggestions();
}

function closeDevConsole() {
  devConsoleOpen = false;
  devConsoleEl.classList.add("hidden");
  devConsoleInputEl.blur();
}

function runDevConsoleCommand(raw) {
  const text = raw.trim().replace(/^\//, "");
  if (!text) return;
  const [cmdName, ...args] = text.split(/\s+/);
  const cmd = DEV_COMMANDS[cmdName.toLowerCase()];
  if (cmd) cmd.run(args);
}

devConsoleInputEl.addEventListener("input", () => {
  devConsoleSuggestions = computeDevConsoleSuggestions(devConsoleInputEl.value);
  devConsoleSuggestionIndex = -1;
  renderDevConsoleSuggestions();
});

devConsoleInputEl.addEventListener("keydown", (e) => {
  // Stops the game's own global keydown handler (WASD, Shift-cast, the "/"
  // that opened this in the first place, etc.) from ever seeing whatever's
  // typed in here — this listener runs first in the bubble phase since
  // it's on the input itself.
  e.stopPropagation();

  if (e.key === "Escape") {
    e.preventDefault();
    closeDevConsole();
  } else if (e.key === "Enter") {
    e.preventDefault();
    const chosen = devConsoleSuggestionIndex >= 0 ? devConsoleSuggestions[devConsoleSuggestionIndex] : devConsoleInputEl.value;
    runDevConsoleCommand(chosen);
    closeDevConsole();
  } else if (e.key === "Tab") {
    e.preventDefault();
    if (devConsoleSuggestions.length === 0) return;
    const pick = devConsoleSuggestions[Math.max(0, devConsoleSuggestionIndex)];
    devConsoleInputEl.value = pick + (pick.trim().split(" ").length === 1 ? " " : "");
    devConsoleSuggestions = computeDevConsoleSuggestions(devConsoleInputEl.value);
    devConsoleSuggestionIndex = -1;
    renderDevConsoleSuggestions();
  } else if (e.key === "ArrowDown") {
    e.preventDefault();
    if (devConsoleSuggestions.length === 0) return;
    devConsoleSuggestionIndex = (devConsoleSuggestionIndex + 1) % devConsoleSuggestions.length;
    renderDevConsoleSuggestions();
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    if (devConsoleSuggestions.length === 0) return;
    devConsoleSuggestionIndex = (devConsoleSuggestionIndex - 1 + devConsoleSuggestions.length) % devConsoleSuggestions.length;
    renderDevConsoleSuggestions();
  }
});

// --- World generation (deferred) --------------------------------------------

// Nothing below is generated at load time anymore — it all depends on RNG,
// which must be seeded first (solo play seeds it with real randomness;
// hosting/joining seeds it with a shared value so everyone's world matches).
// js/lobby.js calls window.startGame() once a mode has been chosen.
let spatialIndex, terrainNoise, renderGrid;
let trees, foliage, mushrooms, rocks, ambientDetails;
let campfire, player;

// Cell size for renderGrid — coarse enough that a typical camera view only
// touches a handful of cells, fine enough that a cell isn't wildly bigger
// than the view itself. See createBucketGrid() in js/worldgen.js and its
// use in loop() below.
const RENDER_GRID_CELL_SIZE = 600;
// Extra margin (world px) added around the strict viewport when querying
// renderGrid, so a wide ground sprite anchored just off-screen still gets
// drawn before it'd visibly pop in. Kept generous (well past what a sprite
// itself would ever need) so trees are always rendered a good distance
// past the visible edge in every direction — the forest reads as endless
// rather than visibly stopping right where the screen does.
const RENDER_VIEW_MARGIN = 650;

function insertIntoRenderGrid(kind, list) {
  for (const item of list) renderGrid.insert(item.x, item.y, { y: item.y, kind, item });
}

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

// How far Woodland Grove content keeps thinning out past BIOME_INNER_RADIUS
// (and how far each outer biome's own content starts thinning in before it)
// — this overlap is what makes the Grove/biome seam read as a gradual
// tree-line rather than a line on a map. See groveOuterFade() and the
// biome-side mixing in generateBiomes() below.
const GROVE_BLEND_WIDTH = 1200;

// 1 well inside the Grove, fading to 0 by GROVE_BLEND_WIDTH past
// BIOME_INNER_RADIUS. Referencing BIOME_INNER_RADIUS here (declared further
// down, in the Biomes section) is safe — this function's body only runs
// once generateWorld() is called, by which point every top-level const in
// the file has already been initialized.
function groveOuterFade(d) {
  const fadeStart = BIOME_INNER_RADIUS - GROVE_BLEND_WIDTH;
  const fadeEnd = BIOME_INNER_RADIUS + GROVE_BLEND_WIDTH;
  if (d <= fadeStart) return 1;
  if (d >= fadeEnd) return 0;
  return 1 - (d - fadeStart) / (fadeEnd - fadeStart);
}

// Interior forest: absent inside the campfire clearing, fading in through a
// ring just past it ("only a bit on the outside... circular formation"),
// full density through the interior, then fading back out into the biome
// ring rather than stopping dead at BIOME_INNER_RADIUS.
function treeRingDensity(x, y) {
  const d = distFromCenter(x, y);
  if (d < CLEARING_RADIUS) return 0;
  const innerRamp = d < RING_END ? (d - CLEARING_RADIUS) / (RING_END - CLEARING_RADIUS) : 1;
  return innerRamp * groveOuterFade(d);
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

// Target densities (items per 1,000,000 px²) for Woodland Grove content.
// Kept well under the old flat counts' effective density — the old numbers
// were tuned for a world 1/30th this area and read as cluttered/overlapping
// once biomes made everything else denser too. overlapAllowance values are
// likewise raised across the board (>=1 forces a real gap between items,
// not just "centers don't fully coincide") so nothing visually crowds.
const GROVE_TREE_DENSITY = 7.5;
const GROVE_FOLIAGE_DENSITY = 11;
const GROVE_FLOWER_CLUSTER_DENSITY = 0.05; // clusters/million px², a few items each
const GROVE_MUSHROOM_CLUSTER_DENSITY = 0.09;
const GROVE_MUSHROOM_TOPUP_DENSITY = 1.4;
const GROVE_ROCK_CLUSTER_DENSITY = 0.1;
const GROVE_ROCK_TOPUP_DENSITY = 1.5;
const GROVE_AMBIENT_DENSITY = 0.7;

function generateWorld() {
  spatialIndex = WorldGen.createSpatialIndex(160);
  renderGrid = WorldGen.createBucketGrid(RENDER_GRID_CELL_SIZE);
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
  // Woodland Grove fills the inner disk (radius up to roughly
  // BIOME_INNER_RADIUS, thinning out across GROVE_BLEND_WIDTH on either side
  // of it rather than stopping dead) — beyond that, each of the five
  // outlying biomes (see "--- Biomes ---" above) owns its own wedge,
  // similarly blended at both its inner and outer edges. See generateBiomes().
  const groveOuterRadius = BIOME_INNER_RADIUS + GROVE_BLEND_WIDTH;
  const groveTreeArea = annulusArea(CLEARING_RADIUS, groveOuterRadius);
  trees = scatterWithDensity({
    count: densityCount(GROVE_TREE_DENSITY, groveTreeArea),
    maxAttempts: densityCount(GROVE_TREE_DENSITY, groveTreeArea) * 15,
    sample: () => sampleAnnulus(CLEARING_RADIUS, groveOuterRadius),
    densityAt: treeRingDensity,
    footprintRadius: treeFootprintRadius,
    overlapAllowance: 1.05,
    build: (x, y) => ({ x, y, type: pickTreeType(), scale: 0.75 + RNG.random() * 0.55 }),
  });

  // --- Foliage ---
  foliage = [];

  // A few sparse tufts right around the campfire — no shrubs.
  foliage.push(...scatterWithDensity({
    count: 14,
    maxAttempts: 14 * 15,
    sample: () => sampleAnnulus(40, CLEARING_RADIUS - 20),
    footprintRadius: foliageFootprintRadius,
    overlapAllowance: 0.7,
    build: (x, y) => ({ x, y, type: pickClearingFoliageType(), scale: 0.7 + RNG.random() * 0.3, flip: RNG.random() < 0.5 }),
  }));

  // Interior forest floor: noise-gated patchiness (lush meadows, barren gaps).
  const groveFoliageArea = annulusArea(CLEARING_RADIUS + 40, groveOuterRadius);
  foliage.push(...scatterWithDensity({
    count: densityCount(GROVE_FOLIAGE_DENSITY, groveFoliageArea),
    maxAttempts: densityCount(GROVE_FOLIAGE_DENSITY, groveFoliageArea) * 10,
    sample: () => sampleAnnulus(CLEARING_RADIUS + 40, groveOuterRadius),
    densityAt: (x, y) => {
      const density = terrainNoise(x / 260, y / 260);
      const base = density < 0.42 ? 0 : Math.min(1, (density - 0.42) / 0.58 + 0.2);
      return base * groveOuterFade(distFromCenter(x, y));
    },
    footprintRadius: foliageFootprintRadius,
    overlapAllowance: 0.85,
    build: (x, y) => ({ x, y, type: pickFoliageType(), scale: 0.8 + RNG.random() * 0.35, flip: RNG.random() < 0.5 }),
  }));

  // A handful of tight flower clusters layered on top.
  const flowerClusterCount = densityCount(GROVE_FLOWER_CLUSTER_DENSITY, groveFoliageArea);
  for (let c = 0; c < flowerClusterCount; c++) {
    const center = sampleAnnulus(CLEARING_RADIUS + 40, groveOuterRadius);
    if (RNG.random() > groveOuterFade(distFromCenter(center.x, center.y))) continue;
    const n = 3 + Math.floor(RNG.random() * 4);
    for (let i = 0; i < n; i++) {
      const angle = RNG.random() * Math.PI * 2;
      const dist = RNG.random() * RNG.random() * 40;
      const x = center.x + Math.cos(angle) * dist;
      const y = center.y + Math.sin(angle) * dist;
      if (isPointInWater(x, y)) continue;
      const item = { x, y, type: "flowers", scale: 0.8 + RNG.random() * 0.3, flip: RNG.random() < 0.5 };
      const radius = foliageFootprintRadius(item);
      if (spatialIndex.hasOverlap(x, y, radius, 0.6)) continue;
      spatialIndex.insert(x, y, radius);
      foliage.push(item);
    }
  }

  // --- Mushrooms ---
  const groveDetailArea = annulusArea(CLEARING_RADIUS + 60, groveOuterRadius);
  mushrooms = [];
  const mushroomClusterCount = densityCount(GROVE_MUSHROOM_CLUSTER_DENSITY, groveDetailArea);
  for (let c = 0; c < mushroomClusterCount; c++) {
    const center = sampleAnnulus(CLEARING_RADIUS + 60, groveOuterRadius);
    if (RNG.random() > groveOuterFade(distFromCenter(center.x, center.y))) continue;
    const n = 2 + Math.floor(RNG.random() * 3);
    for (let i = 0; i < n; i++) {
      const angle = RNG.random() * Math.PI * 2;
      const dist = RNG.random() * RNG.random() * 30;
      const x = center.x + Math.cos(angle) * dist;
      const y = center.y + Math.sin(angle) * dist;
      if (distFromCenter(x, y) < CLEARING_RADIUS || isPointInWater(x, y)) continue;
      const item = { x, y, type: pickMushroomType(), scale: 0.85 + RNG.random() * 0.3, flip: RNG.random() < 0.5 };
      const radius = mushroomFootprintRadius(item);
      if (spatialIndex.hasOverlap(x, y, radius, 0.7)) continue;
      spatialIndex.insert(x, y, radius);
      mushrooms.push(item);
    }
  }
  mushrooms.push(...scatterWithDensity({
    count: densityCount(GROVE_MUSHROOM_TOPUP_DENSITY, groveDetailArea),
    maxAttempts: densityCount(GROVE_MUSHROOM_TOPUP_DENSITY, groveDetailArea) * 15,
    sample: () => sampleAnnulus(CLEARING_RADIUS + 60, groveOuterRadius),
    densityAt: (x, y) => groveOuterFade(distFromCenter(x, y)),
    footprintRadius: mushroomFootprintRadius,
    overlapAllowance: 0.7,
    build: (x, y) => ({ x, y, type: pickMushroomType(), scale: 0.85 + RNG.random() * 0.3, flip: RNG.random() < 0.5 }),
  }));

  // --- Rocks ---
  rocks = [];
  const rockClusterCount = densityCount(GROVE_ROCK_CLUSTER_DENSITY, groveDetailArea);
  for (let c = 0; c < rockClusterCount; c++) {
    const center = sampleAnnulus(CLEARING_RADIUS + 60, groveOuterRadius);
    if (RNG.random() > groveOuterFade(distFromCenter(center.x, center.y))) continue;
    const n = 2 + Math.floor(RNG.random() * 4);
    for (let i = 0; i < n; i++) {
      const angle = RNG.random() * Math.PI * 2;
      const dist = RNG.random() * RNG.random() * 45;
      const x = center.x + Math.cos(angle) * dist;
      const y = center.y + Math.sin(angle) * dist;
      if (distFromCenter(x, y) < CLEARING_RADIUS || isPointInWater(x, y)) continue;
      const item = { x, y, variant: pickRockVariant(), scale: 0.75 + RNG.random() * 0.35, flip: RNG.random() < 0.5 };
      const radius = rockFootprintRadius(item);
      if (spatialIndex.hasOverlap(x, y, radius, 0.7)) continue;
      spatialIndex.insert(x, y, radius);
      rocks.push(item);
    }
  }
  rocks.push(...scatterWithDensity({
    count: densityCount(GROVE_ROCK_TOPUP_DENSITY, groveDetailArea),
    maxAttempts: densityCount(GROVE_ROCK_TOPUP_DENSITY, groveDetailArea) * 15,
    sample: () => sampleAnnulus(CLEARING_RADIUS + 60, groveOuterRadius),
    densityAt: (x, y) => groveOuterFade(distFromCenter(x, y)),
    footprintRadius: rockFootprintRadius,
    overlapAllowance: 0.7,
    build: (x, y) => ({ x, y, variant: pickRockVariant(), scale: 0.75 + RNG.random() * 0.35, flip: RNG.random() < 0.5 }),
  }));

  // --- Ambient details ---
  ambientDetails = scatterWithDensity({
    count: densityCount(GROVE_AMBIENT_DENSITY, groveDetailArea),
    maxAttempts: densityCount(GROVE_AMBIENT_DENSITY, groveDetailArea) * 15,
    sample: () => sampleAnnulus(CLEARING_RADIUS + 60, groveOuterRadius),
    densityAt: (x, y) => groveOuterFade(distFromCenter(x, y)),
    footprintRadius: ambientFootprintRadius,
    overlapAllowance: 0.7,
    build: (x, y) => ({ x, y, type: pickAmbientType(), scale: 0.85 + RNG.random() * 0.3, flip: RNG.random() < 0.5 }),
  });

  insertIntoRenderGrid("tree", trees);
  insertIntoRenderGrid("foliage", foliage);
  insertIntoRenderGrid("mushroom", mushrooms);
  insertIntoRenderGrid("rock", rocks);
  insertIntoRenderGrid("ambient", ambientDetails);

  // --- Biomes (five outlying wedges beyond the Grove) ---
  generateBiomes();

  // --- Boss arena (Hollow Deep) ---
  spawnBossArenaFurniture();

  // --- Healing pools, enemies ---
  generateHealingPools();
  spawnEnemies();

  // Transient spell state shouldn't carry over from a previous world (e.g.
  // hosting/joining mid-session regenerates everything from a new seed).
  obstacles = [];
  iceBridges = [];
  projectiles = [];
  bossProjectiles = [];
  effects = [];
  pendingEarthShatters = [];

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

// World-edge mist: a radial fade from fully clear to fully opaque, centered
// on the world so the impassable boundary (see PLAYER_MAX_RADIUS and
// clampToWorld()) reads as encroaching fog rather than an invisible wall.
// MIST_INNER_RADIUS sits well short of PLAYER_MAX_RADIUS so mist is already
// visible as the player approaches; MIST_OUTER_RADIUS (where it goes fully
// opaque) sits past PLAYER_MAX_RADIUS, in ground the player can never
// actually reach, so from where they stand it always reads as a soft,
// gradual whiteout rather than a hard line.
const MIST_INNER_RADIUS = PLAYER_MAX_RADIUS - 1400;
const MIST_OUTER_RADIUS = PLAYER_MAX_RADIUS + 2200;
const MIST_COLOR_RGB = "222, 232, 236";

function drawWorldMist(camera) {
  const playerDist = distFromCenter(player.x, player.y);
  const viewSpan = Math.max(canvas.width, canvas.height) / camera.zoom;
  // Perf guard: skip entirely unless the mist band could plausibly be in view.
  if (playerDist + viewSpan < MIST_INNER_RADIUS) return;

  const cx = WORLD_CENTER.x - camera.x;
  const cy = WORLD_CENTER.y - camera.y;
  const gradient = ctx.createRadialGradient(cx, cy, MIST_INNER_RADIUS, cx, cy, MIST_OUTER_RADIUS);
  gradient.addColorStop(0, `rgba(${MIST_COLOR_RGB}, 0)`);
  gradient.addColorStop(1, `rgba(${MIST_COLOR_RGB}, 1)`);
  ctx.fillStyle = gradient;
  ctx.fillRect(cx - MIST_OUTER_RADIUS, cy - MIST_OUTER_RADIUS, MIST_OUTER_RADIUS * 2, MIST_OUTER_RADIUS * 2);
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
  if (item.destroyed) return; // shattered by Earth Breaker — see castEarthBreaker()
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
let qWasPressed = false;

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

// Reads the open world's Crystal Golem fight, if one is live, and updates
// the shared boss health bar HUD, hiding it otherwise. Checked every frame
// rather than tracked as its own bit of state, since "which fight (if any)
// is live" is already fully derivable from bossArenaState.
function updateBossHealthBarUI() {
  let boss = null;
  if (currentArea === "world" && bossArenaState && bossArenaState.golemEnemy) {
    const golemEnemy = bossArenaState.golemEnemy;
    if (golemEnemy.state !== "dead") boss = { enemy: golemEnemy, name: "Crystal Golem" };
  }

  if (!boss) {
    bossHealthBarEl.classList.add("hidden");
    return;
  }
  bossHealthBarEl.classList.remove("hidden");
  bossHealthNameEl.textContent = boss.name;
  const ratio = Math.max(0, Math.min(1, boss.enemy.health / ENEMY_TYPES[boss.enemy.kind].maxHealth));
  bossHealthFillEl.setAttribute("width", 400 * ratio);
  bossHealthSheenEl.setAttribute("width", 400 * ratio);
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

  // Campfire: F heals to full when in range. The old "gather" multiplayer
  // menu trigger has been pulled from here (see the commented-out branch
  // below) — the lobby/host/join UI itself is untouched and still reachable
  // at the very start of a session, it's just not reopenable mid-game
  // anymore until something new triggers it (a future NPC, most likely).
  // Escape still closes the menu if it's ever open, and everything else F
  // can interact with — village NPCs, the boss arena's rune — is checked
  // the same way, with dialogue (if already open) taking priority.
  const activeCampfire = currentArea === "village" ? village.campfire : campfire;
  const menuOpenBefore = !lobbyEl.classList.contains("lobby-hidden");
  const distToCampfire = Math.hypot(player.x - activeCampfire.x, player.y - activeCampfire.y);
  const inCampfireRange = distToCampfire < CAMPFIRE_INTERACT_RADIUS;
  const nearbyNpc = currentArea === "village" && !inCampfireRange ? findNearestVillageNpc() : null;
  const nearRune =
    currentArea === "world" && !inCampfireRange && bossArenaState && bossArenaState.runeState === "dormant" &&
    Math.hypot(player.x - bossArenaState.center.x, player.y - bossArenaState.center.y) < RUNE_INTERACT_RADIUS;

  const fJustPressed = keys.f && !fWasPressed;
  fWasPressed = keys.f;

  if (fJustPressed) {
    if (activeDialogue) {
      advanceDialogue();
    } else if (menuOpenBefore) {
      lobbyEl.classList.add("lobby-hidden");
      Sound.menuClose();
    } else if (inCampfireRange) {
      player.heal(player.maxHealth);
      Sound.heal();
    } else if (nearbyNpc) {
      openDialogue(nearbyNpc);
    } else if (nearRune) {
      activateBossArena();
    }
  } else if (keys.escape) {
    if (activeDialogue) closeDialogue();
    else if (menuOpenBefore) {
      lobbyEl.classList.add("lobby-hidden");
      Sound.menuClose();
    }
  }

  const menuOpen = !lobbyEl.classList.contains("lobby-hidden");
  const uiBlocking = menuOpen || !!activeDialogue || devConsoleOpen;

  if (uiBlocking) {
    interactPromptEl.classList.add("hidden");
  } else if (inCampfireRange) {
    interactPromptEl.classList.remove("hidden");
    interactPromptEl.innerHTML = "Press <strong>F</strong> to rest and heal";
  } else if (nearbyNpc) {
    interactPromptEl.classList.remove("hidden");
    interactPromptEl.innerHTML = `Press <strong>F</strong> to talk to the ${nearbyNpc.def.name}`;
  } else if (nearRune) {
    interactPromptEl.classList.remove("hidden");
    interactPromptEl.innerHTML = "Press <strong>F</strong> to awaken the rune";
  } else {
    interactPromptEl.classList.add("hidden");
  }
  campfirePromptEl.classList.add("hidden"); // superseded by interactPromptEl above (same spot, never both)

  if (isPeer) {
    // Strict host authority: our own avatar is rendered from the host's
    // broadcast rather than simulated locally (see js/multiplayer/peer-sync.js).
    // We still forward local input to the host every frame — except while
    // blocked by a menu/dialogue, so the avatar holds still; the host will
    // naturally treat our input as neutral once it goes stale (see
    // INPUT_TIMEOUT_MS in host-sim.js).
    if (!uiBlocking) mp.update(dt);
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
    if (!uiBlocking) player.update(dt);
    // Host: always steps every remote player and broadcasts, even while the
    // host's own menu/dialogue is open — otherwise opening it would freeze
    // the game for every connected friend, not just the host.
    if (mp) mp.update(dt);
  }

  // Combat/hazard simulation is local-only (not part of the multiplayer
  // sync) and pauses along with the player while a menu/dialogue is open.
  if (!uiBlocking) {
    resolveWeaponHit();
    updateEnemies(dt);
    updateProjectiles(dt);
    updateBossProjectiles(dt);
    updateEffects(dt);
    updateHealingPools(now);
    updatePendingEarthShatters(now);
    pruneExpired(obstacles, now);
    pruneExpired(iceBridges, now);
    updateBossArena();
  }

  updateCamera();
  updateHealthBar();
  updateBossHealthBarUI();

  // Zoom is purely local UI feedback — it reads the raw key state directly
  // rather than the (possibly host-delayed) simulated `isCasting`, so it
  // stays instant regardless of network mode.
  const targetZoom = keys.shift ? CAST_ZOOM : 1;
  camera.zoom += (targetZoom - camera.zoom) * Math.min(1, dt * ZOOM_APPROACH_RATE);

  // Spellbook: Q toggles it open/closed (press again to close), at any time,
  // not just while casting — it's a reference sheet, not something gated on
  // being mid-spell. Ignored while a menu/dialogue is open, same as Tab —
  // and while SPELLS_ENABLED is false, there's nothing to show yet.
  const qJustPressed = keys.q && !qWasPressed;
  qWasPressed = keys.q;
  if (qJustPressed && !uiBlocking && SPELLS_ENABLED) spellbookEl.classList.toggle("visible");

  // Player list: held down to show, hidden the instant Tab is released —
  // ignored while a menu/dialogue is open, where Tab reverts to normal
  // browser focus-cycling between that menu's own inputs and buttons (see
  // the preventDefault condition in the keydown listener above).
  playerListEl.classList.toggle("visible", keys.tab && !uiBlocking);
  if (playerListEl.classList.contains("visible")) updatePlayerList(mp);

  // The player is always drawn at canvas center, so scaling around that
  // same point zooms in on them for free — no per-object math needed.
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.scale(camera.zoom, camera.zoom);
  ctx.translate(-canvas.width / 2, -canvas.height / 2);

  if (currentArea === "village") {
    drawVillage(camera, mp);
  } else {
    drawGround();
    drawBiomeGround(camera);
    drawWater(camera);
    drawHealingPools(camera);
    drawIceBridges(camera);
    drawBossArena(camera);

    // Depth-sort every ground object, remote players, and the local player
    // by world y so nearer/taller things convincingly occlude farther ones.
    //
    // Static scatter content (trees/foliage/mushrooms/rocks/ambient/biome
    // content) is pulled from renderGrid rather than iterated in full — the
    // world can hold tens of thousands of such items, but only the handful
    // actually near the camera matter for any given frame. RENDER_VIEW_MARGIN
    // is generous enough that even the widest ground sprite, anchored just
    // outside the strict viewport, still gets included before it'd visibly pop in.
    const drawables = [];
    drawables.push({ y: campfire.y, kind: "campfire", item: campfire });
    const viewHalfW = canvas.width / (2 * camera.zoom) + RENDER_VIEW_MARGIN;
    const viewHalfH = canvas.height / (2 * camera.zoom) + RENDER_VIEW_MARGIN;
    const viewCenterX = camera.x + canvas.width / 2;
    const viewCenterY = camera.y + canvas.height / 2;
    renderGrid.queryRect(viewCenterX - viewHalfW, viewCenterY - viewHalfH, viewCenterX + viewHalfW, viewCenterY + viewHalfH, drawables);
    for (const enemy of enemies) {
      drawables.push({ y: enemy.y, kind: "enemy", item: enemy });
    }
    for (const p of projectiles) drawables.push({ y: p.y, kind: "projectile", item: p });
    for (const p of bossProjectiles) drawables.push({ y: p.y, kind: "bossProjectile", item: p });
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
        case "biomeTree": drawBiomeTree(d.item, camera); break;
        case "biomeFoliage": drawBiomeFoliage(d.item, camera); break;
        case "enemy": drawEnemy(d.item, camera); break;
        case "projectile": drawProjectile(d.item, camera); break;
        case "bossProjectile": drawBossProjectile(d.item, camera); break;
        case "remote": drawPlayerLike(ctx, camera, { ...d.item, radius: 14 }); break;
        case "player": player.draw(ctx, camera); break;
      }
    }

    drawObstacles(camera);
    for (const effect of effects) drawEffect(effect, camera);
    drawWorldMist(camera);
  }

  ctx.restore();

  requestAnimationFrame(loop);
}

// Entry point — called by js/lobby.js once the player has chosen solo/host/
// join and (for host/join) RNG has been seeded appropriately. Everything
// above this point is safe to load eagerly; everything the game actually
// *does* waits here. The player always starts in the Sanctuary (see
// "--- Spawn Hub (Village) ---" above), not the random world.
function startGame() {
  generateWorld(); // also builds `player`, positioned at the world campfire
  generateVillage();
  currentArea = "village";
  player.x = village.spawnPoint.x;
  player.y = village.spawnPoint.y;
  updateSpellbookLockState();
  lastTime = performance.now();
  requestAnimationFrame(loop);
}
window.startGame = startGame; // bridge for js/lobby.js and js/multiplayer/multiplayer.js
