import { addCircleCollider, addBoxCollider } from "./collision.js";
import { place } from "./kit-loader.js";

// Kenney Castle Kit pieces sit on a 1-unit grid, each ~1x1 in footprint —
// see threejs/assets/models/CREDITS.md. Corner towers anchor a rectangular
// perimeter; straight wall segments fill the 1-unit gaps between them.
//
// Redesigned after being pointed at Kenney's own Castle Kit promo shot:
// what makes that build read as cohesive rather than copy-pasted is four
// genuinely different towers (heights, roof styles, square vs. hexagon)
// plus banners breaking up the wall run — not a stepped/irregular floor
// plan. I skipped attempting the promo shot's notched, non-rectangular
// footprint: that needs concave-corner wall pieces whose correct rotation
// I can't verify without seeing it rendered (see chat — screenshots are
// stale in this session), and a wrong guess there would look worse than a
// plain corner. This keeps the same rectangular-with-simple-corners
// structure that's already confirmed working, with the towers/banners
// doing the work of making it feel designed.
//
// Fully sealed — no gate — the player spawns inside (see main.js SPAWN)
// with no way out.
const HALF_X = 14; // east/west extent — wall ring spans -14..14
const HALF_Z = 10; // north/south extent — wall ring spans -10..10, non-square on purpose
const CELL_HALF = 0.5; // every wall piece here is a ~1x1 footprint

// Four corners, four different towers — this is the main lever for
// "cohesive instead of repetitive": varied heights, a mix of square and
// hexagon towers, and different roof caps.
const CORNERS = [
  { x: -HALF_X, z: -HALF_Z, kind: "keep" }, // tallest — the main keep
  { x: HALF_X, z: -HALF_Z, kind: "hexRound" },
  { x: HALF_X, z: HALF_Z, kind: "square" },
  { x: -HALF_X, z: HALF_Z, kind: "hexSecondary" },
];

async function buildTower(scene, x, z, kind) {
  const jobs = [];
  let topY;

  if (kind === "keep") {
    // Tallest tower: an extra mid section over the standard stack.
    jobs.push(
      place(scene, "tower-square-base", x, z, 0),
      place(scene, "tower-square-mid", x, z, 1.01),
      place(scene, "tower-square-mid-windows", x, z, 2.02),
      place(scene, "tower-square-mid-windows", x, z, 3.03),
      place(scene, "tower-square-top-roof-high", x, z, 4.04),
    );
    topY = 4.04 + 1.35;
    addCircleCollider(x, z, 0.55);
  } else if (kind === "square") {
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

function buildTowers(scene) {
  return CORNERS.map(({ x, z, kind }) => buildTower(scene, x, z, kind));
}

// Straight wall segments between the corner towers, fully enclosing the
// rectangle — no gate. Every 4th segment is swapped for "wall-pillar"
// (same 1x1 footprint, a buttressed look) for variety along the run.
function buildWalls(scene) {
  const jobs = [];
  const pieceFor = (i) => (Math.abs(i) % 4 === 0 ? "wall-pillar" : "wall");

  for (let i = -HALF_X + 1; i <= HALF_X - 1; i++) {
    jobs.push(place(scene, pieceFor(i), i, -HALF_Z, 0, 0)); // north wall
    addBoxCollider(i, -HALF_Z, CELL_HALF, CELL_HALF);
    jobs.push(place(scene, pieceFor(i), i, HALF_Z, 0, 0)); // south wall
    addBoxCollider(i, HALF_Z, CELL_HALF, CELL_HALF);
  }
  for (let i = -HALF_Z + 1; i <= HALF_Z - 1; i++) {
    jobs.push(place(scene, pieceFor(i), -HALF_X, i, 0, Math.PI / 2)); // west wall
    addBoxCollider(-HALF_X, i, CELL_HALF, CELL_HALF);
    jobs.push(place(scene, pieceFor(i), HALF_X, i, 0, Math.PI / 2)); // east wall
    addBoxCollider(HALF_X, i, CELL_HALF, CELL_HALF);
  }
  return jobs;
}

// A handful of banners hung on the south wall (the one the follow-camera
// mostly frames), breaking up the flat run of crenellations — the
// colorful-banner detail that stands out in Kenney's promo shot.
// flag-banner-long is 2.17 units tall — way past the 1.31-unit wall, so it
// would stick up well above the parapet instead of reading as wall-mounted.
// flag-banner-short (0.78 tall) actually fits the wall's proportions.
// The banner's face normal defaults to the X axis (it's ~0.04 thick in X,
// wide in Z) rather than matching the "wall" piece's own default facing —
// rotationY 0 left it edge-on and invisible from the front; PI/2 turns its
// face to match the south wall.
function buildBanners(scene) {
  const jobs = [];
  const positions = [-6, -3, 3, 6];
  for (const x of positions) {
    jobs.push(place(scene, "flag-banner-short", x, HALF_Z - 0.48, 0, Math.PI / 2));
  }
  return jobs;
}

export async function buildCastle(scene) {
  const jobs = [...buildTowers(scene), ...buildWalls(scene), ...buildBanners(scene)];
  await Promise.all(jobs);
}
