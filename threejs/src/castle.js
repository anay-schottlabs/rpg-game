import * as THREE from "three";
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
// prop on top of the solid wall segment there. `openings` (optional) is a
// list of local [x,z] cells to skip entirely — no wall, no collider — for
// a hallway to connect through.
async function buildCastleShell(scene, { offsetX, offsetZ, outline, towers = {}, gate = null, openings = [] }) {
  const jobs = [];
  const n = outline.length;
  const world = (x, z) => [x + offsetX, z + offsetZ];
  const isOpening = (x, z) => openings.some(([ox, oz]) => ox === x && oz === z);

  for (let i = 0; i < n; i++) {
    const [x1, z1] = outline[i];
    const [x2, z2] = outline[(i + 1) % n];
    const [px, pz] = outline[(i - 1 + n) % n];
    const [wx1, wz1] = world(x1, z1);

    if (x1 === x2) {
      const lo = Math.min(z1, z2);
      const hi = Math.max(z1, z2);
      for (let z = lo + 1; z <= hi - 1; z++) {
        if (isOpening(x1, z)) continue;
        const piece = Math.abs(z - z1) % 4 === 0 ? "wall-pillar" : "wall";
        const [wx, wz] = world(x1, z);
        jobs.push(place(scene, piece, wx, wz, 0, Math.PI));
        addBoxCollider(wx, wz, CELL_HALF, CELL_HALF);
      }
    } else {
      const lo = Math.min(x1, x2);
      const hi = Math.max(x1, x2);
      for (let x = lo + 1; x <= hi - 1; x++) {
        if (isOpening(x, z1)) continue;
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

// --- Hallways connecting the castles ------------------------------------
// Thin (1-wide walkway) corridors on the open terrain, each a pair of
// parallel "wall" lines offset +-1 from the centerline. Where two straight
// legs meet at a 90 degree bend, a small 2x2 "junction" box handles the
// turn — topologically it's just a plain rectangle (proven: every corner
// of a simple rectangle connects cleanly at rotation 0, see the very first
// corner test), with the single wall piece on 2 of its 4 sides skipped to
// let the corridor pass through. Straight legs stop 2 cells short of a
// junction's center (so the junction's own corner pieces are the ones
// touching it, not a duplicate/conflicting piece) and 1 cell short of
// whichever castle wall they run up to (so they don't collide with that
// wall's own already-placed pieces flanking its opening).
function buildHallwaySegment(scene, x1, z1, x2, z2) {
  const jobs = [];
  if (z1 === z2) {
    const lo = Math.min(x1, x2);
    const hi = Math.max(x1, x2);
    for (let x = lo; x <= hi; x++) {
      for (const side of [-1, 1]) {
        const z = z1 + side;
        jobs.push(place(scene, "wall", x, z, 0, Math.PI / 2));
        addBoxCollider(x, z, CELL_HALF, CELL_HALF);
      }
    }
  } else {
    const lo = Math.min(z1, z2);
    const hi = Math.max(z1, z2);
    for (let z = lo; z <= hi; z++) {
      for (const side of [-1, 1]) {
        const x = x1 + side;
        jobs.push(place(scene, "wall", x, z, 0, Math.PI));
        addBoxCollider(x, z, CELL_HALF, CELL_HALF);
      }
    }
  }
  return jobs;
}

function buildJunction(scene, bx, bz, openSides) {
  const jobs = [];
  for (const [cx, cz] of [
    [bx - 1, bz - 1],
    [bx + 1, bz - 1],
    [bx + 1, bz + 1],
    [bx - 1, bz + 1],
  ]) {
    jobs.push(place(scene, "wall-corner", cx, cz, 0, 0));
    addBoxCollider(cx, cz, CELL_HALF, CELL_HALF);
  }
  const sides = {
    N: [bx, bz - 1, Math.PI / 2],
    S: [bx, bz + 1, Math.PI / 2],
    W: [bx - 1, bz, Math.PI],
    E: [bx + 1, bz, Math.PI],
  };
  for (const [dir, [x, z, rot]] of Object.entries(sides)) {
    if (openSides.includes(dir)) continue;
    jobs.push(place(scene, "wall", x, z, 0, rot));
    addBoxCollider(x, z, CELL_HALF, CELL_HALF);
  }
  return jobs;
}

function buildHallways(scene) {
  return [
    // quest hub <-> sparring arena, bending at (14,0)
    ...buildHallwaySegment(scene, 10, 0, 12, 0),
    ...buildJunction(scene, 14, 0, ["W", "S"]),
    ...buildHallwaySegment(scene, 14, 2, 14, 8),
    // quest hub <-> spell practice, bending at (-15,0)
    ...buildHallwaySegment(scene, -13, 0, -10, 0),
    ...buildJunction(scene, -15, 0, ["E", "N"]),
    ...buildHallwaySegment(scene, -15, -14, -15, -2),
    // quest hub <-> armory — straight, no bend needed (both openings share x=2)
    ...buildHallwaySegment(scene, 2, -15, 2, -8),
  ];
}

// --- The four areas, each its own small castle -----------------------
// Spread across the terrain in a non-linear cluster (quest hub roughly
// central, the other three fanned out around it at different distances
// and directions — not a row) rather than too far apart or collinear.
// Sealed, same as before — no gate is a real opening; "gate" just marks a
// decorative door prop. Exported so main.js can point a camera at each
// one's center.
export const ZONES = {
  questHub: { center: [0, 1] },
  sparringArena: { center: [22, 9] },
  spellPractice: { center: [-21, -15] },
  armory: { center: [2, -25] },
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
    // Hub connects to all three other castles: east to sparring arena,
    // west to spell practice, north to armory.
    openings: [
      [9, 0],
      [-9, 0],
      [2, -7], // x=2 to line up straight with armory's opening — no bend needed for that hallway
    ],
  };
}

function sparringArenaOutline() {
  // Square-ish (16x16) with an east notch, no gatehouse — all-hexagon
  // towers for a rounder, "fortress ring" silhouette.
  return {
    offsetX: 22,
    offsetZ: 9,
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
    openings: [[-8, 0]], // west, toward the quest hub
  };
}

function spellPracticeOutline() {
  // Plain rectangle, tall and narrow (12x20), no notch or bump — the
  // simplest silhouette of the three. Just one tall keep tower rather
  // than one at every corner, for a starker "single spire" look.
  return {
    offsetX: -21,
    offsetZ: -15,
    outline: [
      [-6, -10],
      [6, -10],
      [6, 10],
      [-6, 10],
    ],
    towers: { 0: "keep" },
    gate: null,
    openings: [[6, 0]], // east, toward the quest hub
  };
}

function armoryOutline() {
  // Rectangle (16x12) + a south bump like the quest hub's gatehouse, but
  // plain — no towers on the bump itself, just wall-corners — and every
  // main corner is a "square" tower (unlike the other three, which mix
  // styles or go all-hexagon or single-tower). A sturdier, blockier
  // composition than any of the others.
  return {
    offsetX: 2,
    offsetZ: -25,
    outline: [
      [-8, -6],
      [8, -6],
      [8, 6],
      [2, 6],
      [2, 9],
      [-2, 9],
      [-2, 6],
      [-8, 6],
    ],
    towers: { 0: "square", 1: "square", 2: "square", 7: "square" },
    gate: null,
    openings: [[0, 9]], // south (the bump's front wall), toward the quest hub
  };
}

function allCastleConfigs() {
  return [questHubOutline(), sparringArenaOutline(), spellPracticeOutline(), armoryOutline()];
}

export async function buildCastle(scene) {
  const jobs = allCastleConfigs().map((cfg) => buildCastleShell(scene, cfg));
  jobs.push(...buildWallFixtures(scene, 0, 0));
  jobs.push(...buildHallways(scene));
  await Promise.all(jobs);
}

// A flat ground plane with a hole cut out under each castle's exact
// footprint (reusing the same outline data buildCastle() walks), so
// there's no terrain floor inside any of the rooms — just open space
// until real flooring is added. #2cd8b8 matches Nature Kit's own "grass"
// material color.
export function buildGround(scene, size = 200) {
  // ShapeGeometry is built in the XY plane; rotating it flat (-PI/2 on X)
  // maps shape-Y to world **-Z**, confirmed empirically (a shape point at
  // y=1 lands at world z=-1) — not the naive assumption that Y maps
  // straight to Z. Negate Z everywhere below so the holes actually land
  // under the walls instead of being mirrored across the X axis.
  const half = size / 2;
  const shape = new THREE.Shape();
  shape.moveTo(-half, -half);
  shape.lineTo(half, -half);
  shape.lineTo(half, half);
  shape.lineTo(-half, half);
  shape.closePath();

  for (const { outline, offsetX, offsetZ } of allCastleConfigs()) {
    const hole = new THREE.Path();
    outline.forEach(([x, z], i) => {
      const hx = x + offsetX;
      const hz = -(z + offsetZ);
      if (i === 0) hole.moveTo(hx, hz);
      else hole.lineTo(hx, hz);
    });
    hole.closePath();
    shape.holes.push(hole);
  }

  const ground = new THREE.Mesh(
    new THREE.ShapeGeometry(shape),
    new THREE.MeshStandardMaterial({ color: 0x2cd8b8 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);
}
