import { addCircleCollider, addBoxCollider } from "./collision.js";
import { place, NATURE_BASE } from "./kit-loader.js";

// Kenney Castle Kit pieces sit on a 1-unit grid, each ~1x1 in footprint —
// see threejs/assets/models/CREDITS.md.
//
// Each "area" (quest hub, sparring arena, spell practice) is now its own
// small, separately-shaped castle spread across the terrain, rather than
// one big complex subdivided into rooms — see buildCastles() at the
// bottom. buildCastleShell() is the reusable piece: it walks a clockwise
// rectilinear outline (offset to wherever that castle sits in the world)
// and places walls/corners/towers along it.
//
// wall-corner rotation: confirmed empirically (see commit history — built
// isolated test corners at all 4 rotations and compared screenshots) that
// rotation 0 connects cleanly for 6 of the 8 possible turn patterns; the
// other 2 ("west then south", "south then east") need PI and PI/2
// respectively. All three castles below reuse the exact same *relative*
// notch/bump shapes already proven to only need those known patterns —
// notches on the east wall, bumps on the south wall — rather than
// re-deriving new untested turn combinations.
const CELL_HALF = 0.5; // every wall/corner piece here is a ~1x1 footprint

function turnRotation(inDir, outDir) {
  const key = `${inDir}${outDir}`;
  if (key === "WS") return Math.PI;
  if (key === "SE") return Math.PI / 2;
  return 0; // N E, E S, S W, W N, N W all confirmed clean at rotation 0
}

function dirOf(dx, dz) {
  if (dx > 0) return "E";
  if (dx < 0) return "W";
  if (dz > 0) return "S";
  return "N";
}

// Walks `outline` (array of [x,z] in castle-local space, clockwise),
// offsetting every coordinate by (offsetX, offsetZ). `towers` and
// `cornerOverrides` are keyed by vertex index; `gate` (optional) is a
// local [x,z] on a horizontal (x-varying) edge to drop a decorative door
// prop on top of the solid wall segment there.
async function buildCastleShell(scene, { offsetX, offsetZ, outline, towers = {}, gate = null }) {
  const jobs = [];
  const n = outline.length;
  const world = (x, z) => [x + offsetX, z + offsetZ];

  for (let i = 0; i < n; i++) {
    const [x1, z1] = outline[i];
    const [x2, z2] = outline[(i + 1) % n];
    const [px, pz] = outline[(i - 1 + n) % n];
    const [wx1, wz1] = world(x1, z1);

    if (x1 === x2) {
      const lo = Math.min(z1, z2);
      const hi = Math.max(z1, z2);
      for (let z = lo + 1; z <= hi - 1; z++) {
        const piece = Math.abs(z - z1) % 4 === 0 ? "wall-pillar" : "wall";
        const [wx, wz] = world(x1, z);
        jobs.push(place(scene, piece, wx, wz, 0, Math.PI));
        addBoxCollider(wx, wz, CELL_HALF, CELL_HALF);
      }
    } else {
      const lo = Math.min(x1, x2);
      const hi = Math.max(x1, x2);
      for (let x = lo + 1; x <= hi - 1; x++) {
        const piece = Math.abs(x - x1) % 4 === 0 ? "wall-pillar" : "wall";
        const [wx, wz] = world(x, z1);
        jobs.push(place(scene, piece, wx, wz, 0, Math.PI / 2));
        addBoxCollider(wx, wz, CELL_HALF, CELL_HALF);
        if (gate && x === gate[0] && z1 === gate[1]) {
          jobs.push(place(scene, "door", wx, wz, 0, Math.PI));
        }
      }
    }

    const towerKind = towers[i];
    if (towerKind) {
      jobs.push(buildTower(scene, wx1, wz1, towerKind));
    } else {
      const inDir = dirOf(x1 - px, z1 - pz);
      const outDir = dirOf(x2 - x1, z2 - z1);
      jobs.push(place(scene, "wall-corner", wx1, wz1, 0, turnRotation(inDir, outDir)));
      addBoxCollider(wx1, wz1, CELL_HALF, CELL_HALF);
    }
  }
  return Promise.all(jobs);
}

async function buildTower(scene, x, z, kind) {
  const jobs = [];
  let topY;

  if (kind === "keep") {
    jobs.push(
      place(scene, "tower-square-base", x, z, 0),
      place(scene, "tower-square-mid", x, z, 1.01),
      place(scene, "tower-square-mid-windows", x, z, 2.02),
      place(scene, "tower-square-mid-windows", x, z, 3.03),
      place(scene, "tower-square-top-roof-high", x, z, 4.04),
    );
    topY = 4.04 + 1.35;
    addCircleCollider(x, z, 0.55);
  } else if (kind === "square" || kind === "gate") {
    jobs.push(
      place(scene, "tower-square-base", x, z, 0),
      place(scene, "tower-square-mid", x, z, 1.01),
      place(scene, "tower-square-mid-windows", x, z, 2.02),
      place(scene, "tower-square-top-roof-rounded", x, z, 3.03),
    );
    topY = 3.03 + 0.95;
    addCircleCollider(x, z, 0.55);
  } else if (kind === "hexRound") {
    jobs.push(
      place(scene, "tower-hexagon-base", x, z, 0),
      place(scene, "tower-hexagon-mid", x, z, 1.31),
      place(scene, "tower-hexagon-roof", x, z, 1.31 + 0.46),
    );
    topY = 1.31 + 0.46 + 0.83;
    addCircleCollider(x, z, 0.48);
  } else {
    // hexSecondary
    jobs.push(
      place(scene, "tower-hexagon-base", x, z, 0),
      place(scene, "tower-hexagon-mid", x, z, 1.31),
      place(scene, "tower-hexagon-roof-secondary", x, z, 1.31 + 0.46),
    );
    topY = 1.31 + 0.46 + 0.754;
    addCircleCollider(x, z, 0.48);
  }

  jobs.push(place(scene, "flag-wide", x, z, topY));
  return Promise.all(jobs);
}

// A handful of Nature Kit rocks and small trees against the interior wall
// base of one castle, breaking up otherwise-plain stretches.
function buildWallFixtures(scene, offsetX, offsetZ) {
  const fixtures = [
    ["rock_largeB", -8.5, -6.5, 0],
    ["tree_default", -8.5, 0, 0],
    ["rock_tallA", -8.5, 4, -0.2],
  ];
  return fixtures.map(([name, x, z, rot]) =>
    place(scene, name, x + offsetX, z + offsetZ, 0, rot, NATURE_BASE),
  );
}

// --- The three areas, each its own small castle ---------------------------
// Spread across the terrain, not too far apart / not too close (~42 units
// center-to-center — each castle is 16-18 units wide, so there's a solid
// open gap of terrain between any two of them). Sealed, same as before —
// no gate is a real opening; "gate" just marks a decorative door prop.
// Exported so main.js can point a camera at each one's center.
export const ZONES = {
  questHub: { center: [0, 1] },
  sparringArena: { center: [42, 0] },
  spellPractice: { center: [-42, 0] },
};

function questHubOutline() {
  // Rectangle (18x14) + a south gatehouse bump — the fullest composition
  // of the three, six towers total.
  return {
    offsetX: 0,
    offsetZ: 0,
    outline: [
      [-9, -7],
      [9, -7],
      [9, 7],
      [3, 7],
      [3, 10],
      [-3, 10],
      [-3, 7],
      [-9, 7],
    ],
    towers: { 0: "keep", 1: "square", 2: "hexRound", 4: "gate", 5: "gate", 7: "hexSecondary" },
    gate: [0, 10],
  };
}

function sparringArenaOutline() {
  // Square-ish (16x16) with an east notch, no gatehouse — all-hexagon
  // towers for a rounder, "fortress ring" silhouette.
  return {
    offsetX: 42,
    offsetZ: 0,
    outline: [
      [-8, -8],
      [8, -8],
      [8, -2],
      [4, -2],
      [4, 4],
      [8, 4],
      [8, 8],
      [-8, 8],
    ],
    towers: { 0: "hexRound", 1: "hexRound", 6: "hexRound", 7: "hexRound" },
    gate: null,
  };
}

function spellPracticeOutline() {
  // Plain rectangle, tall and narrow (12x20), no notch or bump — the
  // simplest silhouette of the three. Just one tall keep tower rather
  // than one at every corner, for a starker "single spire" look.
  return {
    offsetX: -42,
    offsetZ: 0,
    outline: [
      [-6, -10],
      [6, -10],
      [6, 10],
      [-6, 10],
    ],
    towers: { 0: "keep" },
    gate: null,
  };
}

export async function buildCastle(scene) {
  const configs = [questHubOutline(), sparringArenaOutline(), spellPracticeOutline()];
  const jobs = configs.map((cfg) => buildCastleShell(scene, cfg));
  jobs.push(...buildWallFixtures(scene, 0, 0));
  await Promise.all(jobs);
}
