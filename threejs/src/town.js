import * as THREE from "three";
import { place, FANTASY_TOWN_BASE as T } from "./kit-loader.js";
import { addBoxCollider, addCircleCollider } from "./collision.js";

// Procedural fantasy town, built entirely from Fantasy Town Kit pieces on a
// 1-meter grid. Grid unit confirmed from real GLB bounding boxes (see the
// Step 1 inventory) — every wall/corner/roof/road/fence piece is ~1x1 in
// footprint, sharing the kit's consistent pivot convention.
//
// Rotation conventions below were confirmed empirically (isolated test
// rigs, screenshot-verified against a closed 4x4 rectangle loop before
// trusting them here) — NOT guessed from the old Castle Kit values, which
// don't apply to this kit's differently-authored pivots:
//   "wall" rotationY=0      -> panel spans the Z axis, sits at its cell's +X edge
//   "wall" rotationY=PI/2   -> panel spans the X axis
//   "wall-corner" rotationY=0        -> solid arms run South(+Z) and East(+X) ("NW post")
//   "wall-corner" rotationY=PI/2     -> arms run North(-Z) and East(+X) ("SW post")
//   "wall-corner" rotationY=PI       -> arms run North(-Z) and West(-X) ("SE post")
//   "wall-corner" rotationY=3*PI/2   -> arms run South(+Z) and West(-X) ("NE post")
// "fence"/"fence-curved" and "hedge"/"hedge-curved" share the same thin-strip
// / symmetric-corner pivot pattern as wall/wall-corner (confirmed from their
// bounding boxes in the Step 1 inventory), so the same rotation values are
// reused for them below.

const SPAN_Z = 0;
const SPAN_X = Math.PI / 2;
const CORNER_ROT = { NW: 0, SW: Math.PI / 2, SE: Math.PI, NE: (3 * Math.PI) / 2 };

// Parameterized town footprint — nothing below is hand-eyeballed against
// this specific size; changing these regenerates a differently-sized,
// differently-populated town.
export const TOWN = {
  originX: -13,
  originZ: 6,
  width: 26,
  depth: 26,
  gateWidth: 3,
  houseCount: { north: 2, east: 2 },
};

function p(scene, jobs, name, x, z, rot = 0, y = 0) {
  jobs.push(place(scene, name, x, z, y, rot, T));
}

// Rectangular wall-loop from grid corner (x0,z0) to (x1,z1). `gates`:
// [{side:'N'|'S'|'E'|'W', at, width}], `at` = 1-based cell index along that
// edge, `width` = how many consecutive cells to leave open (no collider —
// a true walkable gap). The single cell flanking each side of a gate gets a
// pillar instead of a plain wall panel, doubling as a gate-post marker.
// wallPiece/cornerPiece let the same primitive build the town's stone
// perimeter, low fences (arena), or a small house's walls.
function buildPerimeter(scene, jobs, x0, z0, x1, z1, gates = [], opts = {}) {
  const { wallPiece = "wall", cornerPiece = "wall-corner", flankPiece = "pillar-stone", collide = true } = opts;
  const isGate = (side, idx) => gates.some((g) => g.side === side && idx >= g.at && idx < g.at + g.width);
  const isFlank = (side, idx) =>
    gates.some((g) => g.side === side && (idx === g.at - 1 || idx === g.at + g.width));

  p(scene, jobs, cornerPiece, x0, z0, CORNER_ROT.NW);
  p(scene, jobs, cornerPiece, x1, z0, CORNER_ROT.NE);
  p(scene, jobs, cornerPiece, x1, z1, CORNER_ROT.SE);
  p(scene, jobs, cornerPiece, x0, z1, CORNER_ROT.SW);
  if (collide) {
    for (const [cx, cz] of [
      [x0, z0],
      [x1, z0],
      [x1, z1],
      [x0, z1],
    ]) {
      addBoxCollider(cx, cz, 0.5, 0.5);
    }
  }

  for (let i = 1, idx = 1; i < x1 - x0; i++, idx++) {
    const x = x0 + i;
    for (const [side, z] of [
      ["N", z0],
      ["S", z1],
    ]) {
      if (isGate(side, idx)) continue;
      const piece = isFlank(side, idx) ? flankPiece : wallPiece;
      p(scene, jobs, piece, x, z, piece === flankPiece ? 0 : SPAN_X);
      if (collide) addBoxCollider(x, z, 0.5, 0.5);
    }
  }

  for (let i = 1, idx = 1; i < z1 - z0; i++, idx++) {
    const z = z0 + i;
    for (const [side, x] of [
      ["W", x0],
      ["E", x1],
    ]) {
      if (isGate(side, idx)) continue;
      const piece = isFlank(side, idx) ? flankPiece : wallPiece;
      p(scene, jobs, piece, x, z, piece === flankPiece ? 0 : SPAN_Z);
      if (collide) addBoxCollider(x, z, 0.5, 0.5);
    }
  }
}

function buildRoadLine(scene, jobs, x0, z0, x1, z1) {
  const dx = Math.sign(x1 - x0);
  const dz = Math.sign(z1 - z0);
  let x = x0;
  let z = z0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    p(scene, jobs, "road", x, z, 0);
    if (x === x1 && z === z1) break;
    if (x !== x1) x += dx;
    if (z !== z1) z += dz;
  }
}

// L-shaped road path: straight along X first, then straight along Z —
// avoids diagonal tile placement (road tiles only touch cleanly along a
// shared edge, not corner-to-corner) for branches that need to bend.
function buildRoadPath(scene, jobs, x0, z0, x1, z1) {
  buildRoadLine(scene, jobs, x0, z0, x1, z0);
  buildRoadLine(scene, jobs, x1, z0, x1, z1);
}

function buildRoadArea(scene, jobs, x0, z0, x1, z1) {
  for (let x = x0; x <= x1; x++) {
    for (let z = z0; z <= z1; z++) {
      p(scene, jobs, "road", x, z, 0);
    }
  }
}

function buildFlatRoof(scene, jobs, x0, z0, x1, z1, y) {
  for (let x = x0; x <= x1; x++) {
    for (let z = z0; z <= z1; z++) {
      p(scene, jobs, "roof-flat", x, z, 0, y);
    }
  }
}

// A small house: wall-loop + a single door gap facing the road + a flat
// roof cap. `doorSide` picks which edge gets the opening.
function buildHouse(scene, jobs, cx, cz, w, d, doorSide) {
  const x0 = cx - Math.floor(w / 2);
  const z0 = cz - Math.floor(d / 2);
  const x1 = x0 + w;
  const z1 = z0 + d;
  const span = doorSide === "N" || doorSide === "S" ? x1 - x0 : z1 - z0;
  const doorAt = Math.floor(span / 2);
  buildPerimeter(scene, jobs, x0, z0, x1, z1, [{ side: doorSide, at: doorAt, width: 1 }], {
    flankPiece: "wall", // houses don't need gate-post pillars, just skip the one panel
  });
  buildFlatRoof(scene, jobs, x0, z0, x1, z1, 1);
  return { x0, z0, x1, z1 };
}

// Corner flourish for the main perimeter — this kit has no dedicated tower
// piece (confirmed in the Step 1 inventory), so a short pillar-stone stack
// capped with a roof-point substitutes for a corner tower.
function buildCornerTower(scene, jobs, x, z) {
  p(scene, jobs, "pillar-stone", x, z, 0, 1);
  p(scene, jobs, "roof-point", x, z, 0, 2);
}

// --- Zone: central plaza -------------------------------------------------
function buildPlaza(scene, jobs, cx, cz, r) {
  buildRoadArea(scene, jobs, cx - r, cz - r, cx + r, cz + r);
  p(scene, jobs, "fountain-round", cx, cz, 0, 0);
  p(scene, jobs, "fountain-round-detail", cx, cz, 0, 0);
  const stallSpots = [
    [cx - r + 1, cz - r + 1, "stall-green"],
    [cx + r - 1, cz - r + 1, "stall-red"],
    [cx - r + 1, cz + r - 1, "stall"],
    [cx + r - 1, cz + r - 1, "stall-bench"],
  ];
  for (const [x, z, name] of stallSpots) p(scene, jobs, name, x, z, 0);
  for (const [dx, dz] of [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ]) {
    p(scene, jobs, "lantern", cx + dx * (r - 2), cz + dz * (r - 2), 0);
  }
  addCircleCollider(cx, cz, 1.1); // fountain itself blocks the very center
  return { cx, cz, r };
}

// --- Zone: sparring arena (low fence ring, not full walls) --------------
function buildArena(scene, jobs, cx, cz, r, gateSide = "N") {
  buildRoadArea(scene, jobs, cx - r, cz - r, cx + r, cz + r);
  buildPerimeter(scene, jobs, cx - r, cz - r, cx + r, cz + r, [{ side: gateSide, at: r, width: 2 }], {
    wallPiece: "fence",
    cornerPiece: "fence-curved",
    flankPiece: "pillar-wood",
    collide: false,
  });
  for (const [dx, dz] of [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ]) {
    p(scene, jobs, "rock-small", cx + dx * (r - 1), cz + dz * (r - 1), Math.random() * Math.PI * 2);
  }
  p(scene, jobs, "banner-red", cx, cz - r, Math.PI / 2);
  return { cx, cz, r };
}

// --- Zone: spell practice course (long lane, evenly spaced markers) -----
function buildSpellCourse(scene, jobs, x0, x1, z) {
  buildRoadLine(scene, jobs, x0, z, x1, z);
  for (let x = x0 + 1; x < x1; x += 2) {
    p(scene, jobs, "lantern", x, z - 1, 0);
    p(scene, jobs, "lantern", x, z + 1, 0);
  }
  p(scene, jobs, "banner-green", x1, z, Math.PI);
  return { x0, x1, z };
}

// --- Zone: dungeon staircase (recessed pit faked with kit wall pieces) --
function buildDungeonStairs(scene, jobs, cx, cz) {
  const r = 2;
  buildPerimeter(scene, jobs, cx - r, cz - r, cx + r, cz + r, [{ side: "N", at: r, width: 1 }], {
    wallPiece: "wall-block-half",
    cornerPiece: "wall-corner", // no half-height corner exists; regular corner reads fine as a low retaining post
    flankPiece: "wall-block-half",
    collide: false,
  });
  p(scene, jobs, "stairs-stone", cx, cz - r, Math.PI, 0);
  p(scene, jobs, "stairs-stone", cx, cz - r + 1, Math.PI, 0);
  p(scene, jobs, "rock-large", cx, cz, 0, 0);
  return { cx, cz, r };
}

export async function buildTown(scene) {
  const jobs = [];
  const { originX, originZ, width, depth, gateWidth } = TOWN;
  const x0 = originX;
  const z0 = originZ;
  const x1 = originX + width;
  const z1 = originZ + depth;
  const plazaCx = (x0 + x1) / 2;
  const plazaCz = (z0 + z1) / 2;
  const plazaR = 4;

  const northGateAt = Math.floor(width / 2) - Math.floor(gateWidth / 2);
  const eastGateAt = Math.floor(depth / 2) - Math.floor(gateWidth / 2);

  // Phase: perimeter wall loop with 2 gate entrances.
  buildPerimeter(scene, jobs, x0, z0, x1, z1, [
    { side: "N", at: northGateAt, width: gateWidth },
    { side: "E", at: eastGateAt, width: gateWidth },
  ]);
  for (const [cx, cz] of [
    [x0, z0],
    [x1, z0],
    [x1, z1],
    [x0, z1],
  ]) {
    buildCornerTower(scene, jobs, cx, cz);
  }

  const northGateX = x0 + northGateAt + Math.floor(gateWidth / 2);
  const eastGateZ = z0 + eastGateAt + Math.floor(gateWidth / 2);

  // Phase: road spine from each gate converging on the plaza.
  buildRoadLine(scene, jobs, northGateX, z0, plazaCx, plazaCz - plazaR);
  buildRoadLine(scene, jobs, x1, eastGateZ, plazaCx + plazaR, plazaCz);

  // Phase: building footprints reserved along the entrance spines, facing the road.
  buildHouse(scene, jobs, northGateX - 4, z0 + 5, 3, 3, "S");
  buildHouse(scene, jobs, northGateX + 4, z0 + 5, 3, 3, "S");
  buildHouse(scene, jobs, x1 - 4, eastGateZ - 3, 3, 3, "E");
  buildHouse(scene, jobs, x1 - 4, eastGateZ + 3, 3, 3, "E");

  // Phase: the four functional zones, each connected to the plaza by road.
  buildPlaza(scene, jobs, plazaCx, plazaCz, plazaR);

  // Sparring arena — tucked in the far south-west corner, reached by an
  // L-shaped branch off the plaza's south-west edge.
  const arenaCx = x0 + 4;
  const arenaCz = z1 - 5;
  buildRoadPath(scene, jobs, plazaCx - plazaR, plazaCz + plazaR, arenaCx, arenaCz - 3);
  buildArena(scene, jobs, arenaCx, arenaCz, 3, "N");

  // Spell practice course — a straight lane due west of the plaza; its own
  // east end already touches the plaza's west edge, so no extra branch road
  // is needed.
  const spellZ = plazaCz;
  buildSpellCourse(scene, jobs, x0 + 2, plazaCx - plazaR, spellZ);

  // Dungeon staircase — straight south of the plaza.
  const dungeonCx = plazaCx;
  const dungeonCz = plazaCz + plazaR + 6;
  buildRoadLine(scene, jobs, plazaCx, plazaCz + plazaR, dungeonCx, dungeonCz - 2);
  buildDungeonStairs(scene, jobs, dungeonCx, dungeonCz);

  await Promise.all(jobs);

  return {
    plaza: { cx: plazaCx, cz: plazaCz, r: plazaR },
    arena: { cx: arenaCx, cz: arenaCz, r: 3 },
    spellCourse: { x0: x0 + 2, x1: plazaCx - plazaR, z: spellZ },
    dungeon: { cx: dungeonCx, cz: dungeonCz, r: 2 },
    bounds: { x0, z0, x1, z1 },
  };
}

// Builds the zone list for zone-camera.js's createZoneCamera() from the
// data buildTown() returns — the single source of truth for zone geometry
// stays here, so adding a 5th zone later only means adding one more entry
// to this list plus its own build*() call above.
export function buildZoneCameraList(townData) {
  const { plaza, arena, spellCourse, dungeon, bounds } = townData;
  const anchor = (px, py, pz, lx, ly, lz) => ({
    position: new THREE.Vector3(px, py, pz),
    lookAt: new THREE.Vector3(lx, ly, lz),
  });

  const arenaZone = {
    name: "arena",
    contains: (x, z) => (x - arena.cx) ** 2 + (z - arena.cz) ** 2 < (arena.r + 1) ** 2,
    anchor: anchor(arena.cx, 12, arena.cz + 8, arena.cx, 0, arena.cz),
  };
  const spellMidX = (spellCourse.x0 + spellCourse.x1) / 2;
  const spellZone = {
    name: "spell-course",
    contains: (x, z) =>
      x >= spellCourse.x0 - 1 && x <= spellCourse.x1 + 1 && Math.abs(z - spellCourse.z) < 3,
    anchor: anchor(spellMidX, 11, spellCourse.z + 9, spellMidX, 0, spellCourse.z),
  };
  const dungeonZone = {
    name: "dungeon",
    contains: (x, z) => (x - dungeon.cx) ** 2 + (z - dungeon.cz) ** 2 < (dungeon.r + 1.5) ** 2,
    anchor: anchor(dungeon.cx, 8, dungeon.cz + 6, dungeon.cx, 0, dungeon.cz),
  };
  const plazaZone = {
    name: "plaza",
    // Catch-all for the rest of the walled town (plaza itself + connecting
    // roads) — checked last, after the more specific zones above.
    contains: (x, z) => x >= bounds.x0 && x <= bounds.x1 && z >= bounds.z0 && z <= bounds.z1,
    anchor: anchor(plaza.cx, 14, plaza.cz + 11, plaza.cx, 0, plaza.cz),
  };

  return [arenaZone, spellZone, dungeonZone, plazaZone];
}
