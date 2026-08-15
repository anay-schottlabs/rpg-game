import { addCircleCollider, addBoxCollider } from "./collision.js";
import { place, NATURE_BASE } from "./kit-loader.js";

// Kenney Castle Kit pieces sit on a 1-unit grid, each ~1x1 in footprint —
// see threejs/assets/models/CREDITS.md.
//
// Redesigned again after feedback on the plain-rectangle version: it
// needed real corners/angles (not just a box), and the wall pieces
// weren't actually connecting — towers were plugging the corners instead
// of dedicated corner pieces, leaving a visible gap/mismatch at every
// join. Fixed by empirically testing "wall-corner": built small standalone
// test rectangles/L-shapes with it at various rotations and looked at the
// results (screenshots recovered mid-session — see chat). Rotation 0,
// used at literally every vertex regardless of turn direction (including
// concave notch corners), connects cleanly — confirmed on both a plain
// rectangle and an L-shaped outline before trusting it here.
//
// Fully sealed — no functional gate, just a "wall-gated" piece at the
// entrance that reads as a door without actually being one — the player
// spawns inside (see main.js SPAWN) with no way out.
const CELL_HALF = 0.5; // every wall/corner piece here is a ~1x1 footprint

// Clockwise outline of the whole perimeter. Two features break up what
// would otherwise be a plain rectangle: a notch cut into the east wall,
// and a gatehouse bump projecting out from the south wall.
const OUTLINE = [
  [-14, -10], // 0  NW
  [14, -10], //  1  NE
  [14, -2], //   2  east notch, top
  [10, -2], //   3  east notch, inner
  [10, 6], //    4  east notch, inner
  [14, 6], //    5  east notch, bottom
  [14, 10], //   6  SE
  [4, 10], //    7  gatehouse, east shoulder
  [4, 13], //    8  gatehouse, east tower
  [-4, 13], //   9  gatehouse, west tower
  [-4, 10], //   10 gatehouse, west shoulder
  [-14, 10], //  11 SW
];

// Towers only at some corners (index into OUTLINE) — the rest are plain
// "wall-corner" joins. Mixes square/hexagon (regular/rounded) and heights.
const TOWERS = {
  0: "keep", // tallest — the main keep
  1: "square",
  6: "hexRound",
  8: "gate",
  9: "gate",
  11: "hexSecondary",
};

// The entrance: centered in the gatehouse bump's front wall (between
// vertices 8 and 9), one "wall-gated" piece instead of a plain "wall" —
// same footprint and collider, just reads as a door.
const GATE_POSITION = { x: 0, z: 13 };

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

// "wall-corner" at rotation 0 connects cleanly for most turn patterns
// (confirmed on a plain rectangle and an L-shape), but not all of them —
// three vertices here (the east notch's two inner corners, and the
// gatehouse's east shoulder) turn a way that needed a different rotation.
// Determined empirically the same way as the rotation-0 default: built
// isolated test corners for each untested turn pattern at all 4 rotations
// and compared screenshots. Keyed by OUTLINE index; anything absent uses
// the rotation-0 default.
const CORNER_ROTATION_OVERRIDES = {
  3: Math.PI, // east notch, top-inner — "west then south" turn
  4: Math.PI / 2, // east notch, bottom-inner — "south then east" turn
  7: Math.PI, // gatehouse east shoulder — "west then south" turn, same as 3
};

// Walks OUTLINE, filling each edge with straight wall segments (every 4th
// swapped for "wall-pillar" for variety) and placing either a tower or a
// plain "wall-corner" at each vertex.
function buildWallsAndTowers(scene) {
  const jobs = [];
  const n = OUTLINE.length;

  for (let i = 0; i < n; i++) {
    const [x1, z1] = OUTLINE[i];
    const [x2, z2] = OUTLINE[(i + 1) % n];

    if (x1 === x2) {
      const lo = Math.min(z1, z2);
      const hi = Math.max(z1, z2);
      for (let z = lo + 1; z <= hi - 1; z++) {
        const piece = Math.abs(z) % 4 === 0 ? "wall-pillar" : "wall";
        jobs.push(place(scene, piece, x1, z, 0, Math.PI));
        addBoxCollider(x1, z, CELL_HALF, CELL_HALF);
      }
    } else {
      const lo = Math.min(x1, x2);
      const hi = Math.max(x1, x2);
      for (let x = lo + 1; x <= hi - 1; x++) {
        const piece = Math.abs(x) % 4 === 0 ? "wall-pillar" : "wall";
        jobs.push(place(scene, piece, x, z1, 0, Math.PI / 2));
        addBoxCollider(x, z1, CELL_HALF, CELL_HALF);
        // A real "wall" segment stays here for solid, reliable collision —
        // the "door" prop is layered on top purely for the visual detail
        // rather than swapped in for an unverified asymmetric-footprint
        // door/gate piece that might not actually fill the 1-unit cell.
        if (x === GATE_POSITION.x && z1 === GATE_POSITION.z) {
          jobs.push(place(scene, "door", x, z1, 0, Math.PI / 2));
        }
      }
    }

    const towerKind = TOWERS[i];
    if (towerKind) {
      jobs.push(buildTower(scene, x1, z1, towerKind));
    } else {
      jobs.push(place(scene, "wall-corner", x1, z1, 0, CORNER_ROTATION_OVERRIDES[i] ?? 0));
      addBoxCollider(x1, z1, CELL_HALF, CELL_HALF);
    }
  }
  return jobs;
}

// A handful of Nature Kit rocks and small trees against the interior wall
// base, breaking up otherwise-plain stretches — decorative only, sitting
// well inside the already-collided wall line so they can't be used to
// hide movement exploits.
function buildWallFixtures(scene) {
  const fixtures = [
    ["rock_largeB", -12, -8.5, 0],
    ["rock_largeD", -12, -4, 0.3],
    ["tree_default", -12.5, 0, 0],
    ["rock_tallA", -12, 4, -0.2],
    ["tree_small", -12.5, 8, 0.4],
    ["rock_largeC", 12, -8, 0],
    ["tree_default", 9, -9, 0.5],
    ["rock_largeA", -8, 9, 0.1],
    ["tree_small", 11, 9, -0.3],
  ];
  return fixtures.map(([name, x, z, rot]) => place(scene, name, x, z, 0, rot, NATURE_BASE));
}

// --- Interior zones ---------------------------------------------------
// Three areas carved out of the interior, connected by actual walled
// corridors (not just a gap in a single dividing wall) — each corridor is
// a short hallway with its own side walls, so there's real length to walk
// through, not an instant threshold. No flooring/dressing yet — structure
// only. Exported so main.js can point the per-zone cameras at the same
// centers used here.
export const ZONES = {
  spellPractice: { x0: -14, x1: -7, z0: -10, z1: 10, center: [-10.5, 0] },
  questHub: { x0: -3, x1: 4, z0: -10, z1: 13, center: [0.5, 1] },
  sparringArena: { x0: 8, x1: 14, z0: -10, z1: 10, center: [11, 0] },
};

// Each corridor: a gap of GAP_CELLS in the divider wall at each end, plus
// side walls (at the cells just outside the gap) running the corridor's
// length to actually enclose the passage. Deliberately plain "wall"
// pieces only, no corners — a corridor wall that doesn't touch another
// wall at an angle needs no corner/T-junction piece, so this can't hit an
// unverified rotation case.
const GAP_CELLS = [-1, 0, 1]; // z-cells left open in each divider (the doorway width)
const SIDE_Z = [-2, 2]; // z-position of the corridor's two side walls

const CORRIDORS = [
  { xStart: -7, xEnd: -3 }, // spell practice <-> quest hub
  { xStart: 4, xEnd: 8 }, // quest hub <-> sparring arena
];

function buildDividerWithGap(scene, x) {
  const jobs = [];
  for (let z = -9; z <= 9; z++) {
    if (GAP_CELLS.includes(z)) continue;
    jobs.push(place(scene, "wall", x, z, 0, Math.PI));
    addBoxCollider(x, z, CELL_HALF, CELL_HALF);
  }
  return jobs;
}

function buildCorridor(scene, xStart, xEnd) {
  const jobs = [...buildDividerWithGap(scene, xStart), ...buildDividerWithGap(scene, xEnd)];
  for (const z of SIDE_Z) {
    for (let x = xStart + 1; x <= xEnd - 1; x++) {
      jobs.push(place(scene, "wall", x, z, 0, Math.PI / 2));
      addBoxCollider(x, z, CELL_HALF, CELL_HALF);
    }
  }
  return jobs;
}

function buildCorridors(scene) {
  return CORRIDORS.flatMap(({ xStart, xEnd }) => buildCorridor(scene, xStart, xEnd));
}

export async function buildCastle(scene) {
  const jobs = [...buildWallsAndTowers(scene), ...buildWallFixtures(scene), ...buildCorridors(scene)];
  await Promise.all(jobs);
}
