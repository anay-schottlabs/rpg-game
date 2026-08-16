import * as THREE from "three";
import { place, FANTASY_TOWN_BASE as T } from "./kit-loader.js";
import { addBoxCollider, addCircleCollider } from "./collision.js";

// Procedural fantasy village, v2 — full rebuild. Built entirely from
// Fantasy Town Kit pieces on a 1-meter grid (confirmed from real GLB
// bounding boxes). This kit ships no prefab buildings or cliff meshes —
// its own official promo render assembles both from the same modular
// wall/roof/rock pieces cataloged here, so that's what this generator does
// too: multi-story timber buildings (wall loops stacked per floor, capped
// with a peaked roof), and rock-cluster "elevation" backdrops built from
// rock-large/rock-small/rock-wide.
//
// Rotation conventions (confirmed empirically, screenshot-verified against
// a closed rectangle loop and an assembled 2-story test building):
//   "wall"/"wall-wood" rotationY=0      -> spans Z, sits at its cell's +X edge
//   "wall"/"wall-wood" rotationY=PI/2   -> spans X
//   "wall-corner"/"wall-wood-corner" rotationY=0        -> arms run South(+Z)+East(+X) ("NW post")
//   rotationY=PI/2   -> arms run North(-Z)+East(+X) ("SW post")
//   rotationY=PI     -> arms run North(-Z)+West(-X) ("SE post")
//   rotationY=3*PI/2 -> arms run South(+Z)+West(-X) ("NE post")
// "fence"/"fence-curved" and "balcony-wall" share the same pivot pattern.
// Roof pieces needing a multi-part ridge (roof-gable + ends) didn't line up
// cleanly within the available time — "roof-point"/"roof-high-point"
// (single-piece pyramid caps, symmetric, no rotation risk) are used
// instead, tiled per roof cell. Not a literal match for Kenney's promo
// ridge line, but a real peaked roof rather than the flat cap v1 used.

const SPAN_Z = 0;
const SPAN_X = Math.PI / 2;
const CORNER_ROT = { NW: 0, SW: Math.PI / 2, SE: Math.PI, NE: (3 * Math.PI) / 2 };

function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function p(scene, jobs, name, x, z, rot = 0, y = 0) {
  jobs.push(place(scene, name, x, z, y, rot, T));
}

function rectsOverlap(a, b, margin = 0) {
  return (
    a.x0 - margin < b.x1 && a.x1 + margin > b.x0 && a.z0 - margin < b.z1 && a.z1 + margin > b.z0
  );
}

// Rectangular wall-loop at a given floor (y). `gates`: [{side, at, width}].
function buildPerimeterAtY(scene, jobs, x0, z0, x1, z1, y, gates, opts = {}) {
  const { wallPiece = "wall", cornerPiece = "wall-corner", flankPiece = wallPiece, collide = false } = opts;
  const isGate = (side, idx) => gates.some((g) => g.side === side && idx >= g.at && idx < g.at + g.width);
  const isFlank = (side, idx) =>
    gates.some((g) => g.side === side && (idx === g.at - 1 || idx === g.at + g.width));

  p(scene, jobs, cornerPiece, x0, z0, CORNER_ROT.NW, y);
  p(scene, jobs, cornerPiece, x1, z0, CORNER_ROT.NE, y);
  p(scene, jobs, cornerPiece, x1, z1, CORNER_ROT.SE, y);
  p(scene, jobs, cornerPiece, x0, z1, CORNER_ROT.SW, y);
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
      p(scene, jobs, piece, x, z, SPAN_X, y);
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
      p(scene, jobs, piece, x, z, SPAN_Z, y);
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

// A timber building: `storeys` stacked wall-loops (ground floor gets a
// door, upper floors get a balcony panel facing the door side), capped
// with a peaked roof tiled across the footprint. One wall style for the
// whole building — never mixed mid-run.
function buildTimberBuilding(scene, jobs, placedRects, cx, cz, w, d, storeys, opts = {}) {
  const {
    wallPiece = "wall-wood",
    cornerPiece = "wall-corner",
    roofPiece = "roof-point",
    doorSide = "S",
    margin = 2.5,
  } = opts;
  const x0 = cx - Math.floor(w / 2);
  const z0 = cz - Math.floor(d / 2);
  const x1 = x0 + w;
  const z1 = z0 + d;
  const rect = { x0, z0, x1, z1 };
  if (placedRects.some((r) => rectsOverlap(rect, r, margin))) return null;
  placedRects.push(rect);

  const span = doorSide === "N" || doorSide === "S" ? x1 - x0 : z1 - z0;
  const openAt = Math.floor(span / 2);

  for (let s = 0; s < storeys; s++) {
    // Ground floor gets a real doorway gap; upper floors stay fully
    // enclosed but swap the two cells flanking that same position to
    // balcony-wall for a "balcony over the door" look (width:0 means the
    // gate itself never opens — only the flank swap triggers).
    const gates = [{ side: doorSide, at: openAt, width: s === 0 ? 1 : 0 }];
    buildPerimeterAtY(scene, jobs, x0, z0, x1, z1, s, gates, {
      wallPiece,
      cornerPiece,
      flankPiece: s === storeys - 1 ? "balcony-wall" : wallPiece,
      collide: s === 0,
    });
  }
  for (let x = x0; x <= x1; x++) {
    for (let z = z0; z <= z1; z++) {
      p(scene, jobs, roofPiece, x, z, 0, storeys);
    }
  }
  if ((cx + cz) % 2 === 0) {
    p(scene, jobs, "chimney", x1, z0, 0, storeys + (roofPiece === "roof-high-point" ? 1 : 0.5));
  }
  return rect;
}

function buildRockCluster(scene, jobs, rng, cx, cz, count, radius) {
  const kinds = ["rock-large", "rock-small", "rock-wide"];
  for (let i = 0; i < count; i++) {
    const a = rng() * Math.PI * 2;
    const r = rng() * radius;
    const x = Math.round((cx + Math.cos(a) * r) * 2) / 2;
    const z = Math.round((cz + Math.sin(a) * r) * 2) / 2;
    p(scene, jobs, kinds[Math.floor(rng() * kinds.length)], x, z, rng() * Math.PI * 2);
  }
}

function buildTreeCluster(scene, jobs, rng, cx, cz, count, radius) {
  const kinds = ["tree", "tree-crooked", "tree-high", "tree-high-round"];
  for (let i = 0; i < count; i++) {
    const a = rng() * Math.PI * 2;
    const r = rng() * radius;
    const x = Math.round((cx + Math.cos(a) * r) * 2) / 2;
    const z = Math.round((cz + Math.sin(a) * r) * 2) / 2;
    p(scene, jobs, kinds[Math.floor(rng() * kinds.length)], x, z, rng() * Math.PI * 2);
  }
}

// Scatters `count` buildings in a loose ring around (anchorX, anchorZ),
// skipping any placement that would overlap an already-placed rect —
// this is how "dense, organic cluster" is generated without hand-picking
// coordinates: positions come from the ring formula + seeded jitter, not
// from eyeballing a layout.
function scatterBuildings(scene, jobs, placedRects, rng, anchorX, anchorZ, count, ringR) {
  const styles = [
    { wallPiece: "wall-wood", cornerPiece: "wall-wood-corner" },
    { wallPiece: "wall", cornerPiece: "wall-corner" },
  ];
  const roofs = ["roof-point", "roof-high-point"];
  const sizes = [
    [2, 2],
    [3, 2],
    [2, 3],
  ];
  const doorSides = ["N", "S", "E", "W"];
  let placed = 0;
  let attempts = 0;
  while (placed < count && attempts < count * 20) {
    attempts++;
    const a = rng() * Math.PI * 2;
    const r = ringR * (0.4 + rng() * 0.6);
    const cx = Math.round(anchorX + Math.cos(a) * r);
    const cz = Math.round(anchorZ + Math.sin(a) * r);
    const [w, d] = sizes[Math.floor(rng() * sizes.length)];
    const style = styles[Math.floor(rng() * styles.length)];
    const storeys = rng() < 0.5 ? 2 : 1;
    const built = buildTimberBuilding(scene, jobs, placedRects, cx, cz, w, d, storeys, {
      ...style,
      roofPiece: storeys === 2 ? roofs[1] : roofs[0],
      doorSide: doorSides[Math.floor(rng() * doorSides.length)],
    });
    if (built) placed++;
  }
}

// "windmill.glb"/"blade.glb" turned out to be just the diagonal cross-brace
// + fan meant to hang flush on a wall face (confirmed via its raw bbox:
// single mesh, 0.47 thick, 3.1 tall/deep — not a standalone tower). The
// tower itself is a real 3-story timber building like any other, with the
// cross brace mounted on its south face.
function buildLandmarkWindmill(scene, jobs, placedRects, cx, cz, rng) {
  buildRockCluster(scene, jobs, rng, cx, cz, 6, 2.6);
  const built = buildTimberBuilding(scene, jobs, placedRects, cx, cz, 2, 2, 3, {
    wallPiece: "wall-wood",
    cornerPiece: "wall-wood-corner",
    roofPiece: "roof-high-point",
    doorSide: "S",
    margin: 3,
  });
  if (!built) return;
  const faceZ = built.z1 + 0.05;
  p(scene, jobs, "windmill", cx, faceZ, 0, 1.9);
  p(scene, jobs, "blade", cx, faceZ, 0, 1.9);
}

// --- Zone: sparring arena (low fence ring, not full walls) --------------
function buildArena(scene, jobs, cx, cz, r, gateSide = "N") {
  buildRoadArea(scene, jobs, cx - r, cz - r, cx + r, cz + r);
  buildPerimeterAtY(scene, jobs, cx - r, cz - r, cx + r, cz + r, 0, [{ side: gateSide, at: r, width: 2 }], {
    wallPiece: "fence",
    cornerPiece: "fence-curved",
    flankPiece: "pillar-wood",
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
  buildPerimeterAtY(scene, jobs, cx - r, cz - r, cx + r, cz + r, 0, [{ side: "N", at: r, width: 1 }], {
    wallPiece: "wall-block-half",
    cornerPiece: "wall-corner",
    flankPiece: "wall-block-half",
  });
  p(scene, jobs, "stairs-stone", cx, cz - r, Math.PI, 0);
  p(scene, jobs, "stairs-stone", cx, cz - r + 1, Math.PI, 0);
  p(scene, jobs, "rock-large", cx, cz, 0, 0);
  return { cx, cz, r };
}

// --- Zone: central plaza --------------------------------------------------
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
  addCircleCollider(cx, cz, 1.1);
  return { cx, cz, r };
}

export const TOWN = {
  seed: 1337,
  frontZ: 6, // gate line
  plazaZ: 15,
  backStart: 30, // where the wild/rocky back quarter begins
  backEnd: 46,
};

export async function buildTown(scene) {
  const jobs = [];
  const rng = mulberry32(TOWN.seed);
  const placedRects = [];
  const { frontZ, plazaZ, backStart, backEnd } = TOWN;

  // --- Phase: front gate + tapering side fences (no full perimeter — the
  // back of the village is meant to open straight into the wild, per the
  // front/back asymmetric layout) ------------------------------------
  const gateHalf = 2;
  p(scene, jobs, "wall-corner", -gateHalf - 3, frontZ, CORNER_ROT.NW);
  p(scene, jobs, "wall-corner", gateHalf + 3, frontZ, CORNER_ROT.NE);
  for (let x = -gateHalf - 2; x <= gateHalf + 2; x++) {
    if (x >= -gateHalf && x <= gateHalf) continue; // gate opening
    p(scene, jobs, "wall", x, frontZ, SPAN_X);
    addBoxCollider(x, frontZ, 0.5, 0.5);
  }
  addBoxCollider(-gateHalf - 3, frontZ, 0.5, 0.5);
  addBoxCollider(gateHalf + 3, frontZ, 0.5, 0.5);
  p(scene, jobs, "pillar-stone", -gateHalf, frontZ, 0, 1);
  p(scene, jobs, "roof-point", -gateHalf, frontZ, 0, 2);
  p(scene, jobs, "pillar-stone", gateHalf, frontZ, 0, 1);
  p(scene, jobs, "roof-point", gateHalf, frontZ, 0, 2);
  // Fences trail back from the two front corners for a short stretch, then
  // simply stop — the enclosure fades rather than forming a hard box.
  for (let i = 1; i <= 4; i++) {
    p(scene, jobs, "fence", -gateHalf - 3, frontZ + i, SPAN_Z);
    p(scene, jobs, "fence", gateHalf + 3, frontZ + i, SPAN_Z);
  }
  placedRects.push({ x0: -gateHalf - 3, z0: frontZ - 1, x1: gateHalf + 3, z1: frontZ + 1 });

  // --- Phase: road spine, front gate -> plaza -> fading out at the back
  buildRoadLine(scene, jobs, 0, frontZ, 0, backStart - 4);

  // --- Phase: central plaza --------------------------------------------
  const plazaR = 3;
  buildPlaza(scene, jobs, 0, plazaZ, plazaR);
  placedRects.push({ x0: -plazaR, z0: plazaZ - plazaR, x1: plazaR, z1: plazaZ + plazaR });

  // Landmarks reserve their footprint FIRST so the building scatter below
  // avoids them, instead of potentially placing a building on top.
  buildLandmarkWindmill(scene, jobs, placedRects, -11, frontZ + 3, rng);

  // --- Phase: dense building clusters, front/middle only -----------------
  scatterBuildings(scene, jobs, placedRects, rng, -9, frontZ + 6, 4, 5.5);
  scatterBuildings(scene, jobs, placedRects, rng, 9, frontZ + 5, 4, 5.5);
  scatterBuildings(scene, jobs, placedRects, rng, -9, plazaZ + 3, 3, 4.5);
  scatterBuildings(scene, jobs, placedRects, rng, 9, plazaZ + 2, 3, 4.5);

  // watermill built into the plaza's edge.
  // watermill.glb's pivot is also at its vertical center (min Y ~ -0.9).
  p(scene, jobs, "watermill", plazaR + 1, plazaZ, Math.PI / 2, 0.9);

  // Rocks tucked behind/around the front clusters, echoing the reference's
  // buildings-against-rock look (not just confined to the back quarter).
  buildRockCluster(scene, jobs, rng, -9, frontZ + 8, 4, 2);
  buildRockCluster(scene, jobs, rng, 10, frontZ + 7, 4, 2);
  buildTreeCluster(scene, jobs, rng, -4, frontZ - 2, 3, 2);
  buildTreeCluster(scene, jobs, rng, 4, frontZ - 2, 3, 2);

  // --- Phase: the three secondary zones, connected off the plaza, kept
  // toward the middle of the village rather than the wild back quarter --
  const arenaCx = -9;
  const arenaCz = plazaZ + 10;
  buildRoadPath(scene, jobs, -plazaR, plazaZ + 3, arenaCx, arenaCz - 3);
  buildArena(scene, jobs, arenaCx, arenaCz, 3, "N");

  const spellZ = plazaZ + 9;
  buildRoadPath(scene, jobs, 0, plazaZ + 3, -3, spellZ);
  buildSpellCourse(scene, jobs, -10, -3, spellZ);

  const dungeonCx = 9;
  const dungeonCz = plazaZ + 9;
  buildRoadPath(scene, jobs, plazaR, plazaZ + 3, dungeonCx, dungeonCz - 2);
  buildDungeonStairs(scene, jobs, dungeonCx, dungeonCz);

  // --- Phase: wild back quarter — rocks + thinning trees, no structures,
  // no wall, the road simply stops and the ground takes over -------------
  const backCenterZ = (backStart + backEnd) / 2;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const bx = Math.cos(a) * 10;
    const bz = backCenterZ + Math.sin(a) * 7;
    buildRockCluster(scene, jobs, rng, bx, bz, 3 + Math.floor(rng() * 3), 2.5);
  }
  for (let i = 0; i < 10; i++) {
    const bx = (rng() - 0.5) * 26;
    const bz = backStart + rng() * (backEnd - backStart);
    buildTreeCluster(scene, jobs, rng, bx, bz, 1, 0.5);
  }

  await Promise.all(jobs);

  return {
    plaza: { cx: 0, cz: plazaZ, r: plazaR },
    arena: { cx: arenaCx, cz: arenaCz, r: 3 },
    spellCourse: { x0: -10, x1: -3, z: spellZ },
    dungeon: { cx: dungeonCx, cz: dungeonCz, r: 2 },
    bounds: { x0: -14, z0: frontZ, x1: 14, z1: backEnd },
    front: { x: 0, z: frontZ },
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
    contains: (x, z) => x >= bounds.x0 && x <= bounds.x1 && z >= bounds.z0 && z <= bounds.z1,
    anchor: anchor(plaza.cx, 14, plaza.cz + 11, plaza.cx, 0, plaza.cz),
  };

  return [arenaZone, spellZone, dungeonZone, plazaZone];
}
