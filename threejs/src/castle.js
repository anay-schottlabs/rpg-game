import { addCircleCollider, addBoxCollider } from "./collision.js";
import { place } from "./kit-loader.js";

// Kenney Castle Kit pieces sit on a 1-unit grid, each ~1x1 in footprint —
// see threejs/assets/models/CREDITS.md. Corner towers anchor a square
// perimeter; straight wall segments fill the 1-unit gaps between them.
//
// No gate/moat/exterior dressing anymore — the castle is a fully sealed
// square, and the player spawns inside it (see main.js SPAWN) with no way
// out, while the interior itself gets built out next.
const CASTLE_HALF = 12; // corner tower centers, so the wall ring spans -12..12
const TOWER_COLLIDER_RADIUS = 0.55;
const CELL_HALF = 0.5; // every wall piece here is a ~1x1 footprint

// Four corner towers, each varied a little (window mid-section, alternating
// roof style, a flag) so the castle isn't four identical copy-pasted
// turrets — while keeping every corner the same 1x1 footprint so the walls
// still line up cleanly against them.
function buildTowers(scene) {
  const corners = [
    { x: -CASTLE_HALF, z: -CASTLE_HALF, roof: "tower-square-top-roof-high" },
    { x: CASTLE_HALF, z: -CASTLE_HALF, roof: "tower-square-top-roof-rounded" },
    { x: CASTLE_HALF, z: CASTLE_HALF, roof: "tower-square-top-roof-high" },
    { x: -CASTLE_HALF, z: CASTLE_HALF, roof: "tower-square-top-roof-rounded" },
  ];
  const jobs = corners.flatMap(({ x, z, roof }) => {
    addCircleCollider(x, z, TOWER_COLLIDER_RADIUS);
    return [
      place(scene, "tower-square-base", x, z, 0),
      place(scene, "tower-square-mid", x, z, 1.01),
      place(scene, "tower-square-mid-windows", x, z, 2.02),
      place(scene, roof, x, z, 3.03),
      place(scene, "flag-wide", x, z, 3.03 + 1.3),
    ];
  });
  return jobs;
}

// Straight wall segments between the corner towers, fully enclosing the
// square — no gate. Every 4th segment is swapped for "wall-pillar" (same
// 1x1 footprint, a buttressed look) purely for visual variety along an
// otherwise repetitive run.
function buildWalls(scene) {
  const jobs = [];
  const pieceFor = (i) => (Math.abs(i) % 4 === 0 ? "wall-pillar" : "wall");
  for (let i = -CASTLE_HALF + 1; i <= CASTLE_HALF - 1; i++) {
    jobs.push(place(scene, pieceFor(i), i, -CASTLE_HALF, 0, 0)); // north wall
    addBoxCollider(i, -CASTLE_HALF, CELL_HALF, CELL_HALF);

    jobs.push(place(scene, pieceFor(i), i, CASTLE_HALF, 0, 0)); // south wall
    addBoxCollider(i, CASTLE_HALF, CELL_HALF, CELL_HALF);

    jobs.push(place(scene, pieceFor(i), -CASTLE_HALF, i, 0, Math.PI / 2)); // west wall
    addBoxCollider(-CASTLE_HALF, i, CELL_HALF, CELL_HALF);

    jobs.push(place(scene, pieceFor(i), CASTLE_HALF, i, 0, Math.PI / 2)); // east wall
    addBoxCollider(CASTLE_HALF, i, CELL_HALF, CELL_HALF);
  }
  return jobs;
}

export async function buildCastle(scene) {
  const jobs = [...buildTowers(scene), ...buildWalls(scene)];
  await Promise.all(jobs);
}
