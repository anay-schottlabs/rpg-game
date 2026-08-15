import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { addCircleCollider, addBoxCollider } from "./collision.js";

// Kenney Castle Kit pieces sit on a 1-unit grid, each ~1x1 in footprint —
// see threejs/assets/models/CREDITS.md. Corner towers anchor a square
// perimeter; straight wall segments fill the 1-unit gaps between them.
//
// No gate/moat/exterior dressing anymore — the castle is a fully sealed
// square, and the player spawns inside it (see main.js SPAWN) with no way
// out, while the interior itself gets built out next.
const CASTLE_BASE = "/assets/models/castle-kit/";
const CASTLE_HALF = 12; // corner tower centers, so the wall ring spans -12..12
const TOWER_COLLIDER_RADIUS = 0.55;
const CELL_HALF = 0.5; // every wall piece here is a ~1x1 footprint

const loader = new GLTFLoader();
const cache = new Map();

function loadModel(name, base = CASTLE_BASE) {
  const key = base + name;
  if (!cache.has(key)) {
    cache.set(
      key,
      new Promise((resolve, reject) => {
        loader.load(`${base}${name}.glb`, (gltf) => resolve(gltf.scene), undefined, reject);
      }),
    );
  }
  return cache.get(key);
}

async function place(scene, name, x, z, y = 0, rotationY = 0, base = CASTLE_BASE) {
  const template = await loadModel(name, base);
  const instance = template.clone(true);
  instance.position.set(x, y, z);
  instance.rotation.y = rotationY;
  instance.traverse((n) => {
    if (n.isMesh) {
      n.castShadow = true;
      n.receiveShadow = true;
      // Nature Kit's flat-color materials are authored with metalness: 1 —
      // with no environment map that reads as dull grey instead of the
      // intended flat color, since a metallic surface only shows reflected
      // light, not its base color. Force it off; Castle/Fantasy/Graveyard
      // kit materials are already non-metal, so this is a no-op for them.
      const mats = Array.isArray(n.material) ? n.material : [n.material];
      for (const m of mats) if (m) m.metalness = 0;
    }
  });
  scene.add(instance);
  return instance;
}

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
