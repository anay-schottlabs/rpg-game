import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { addCircleCollider, addBoxCollider } from "./collision.js";

// Kenney Castle Kit pieces sit on a 1-unit grid, each ~1x1 in footprint —
// see threejs/assets/models/CREDITS.md. Corner towers anchor a square
// perimeter; straight wall segments fill the 1-unit gaps between them.
const CASTLE_BASE = "/assets/models/castle-kit/";
const NATURE_BASE = "/assets/models/nature-kit/";
const CASTLE_HALF = 6; // corner tower centers, so the wall ring spans -6..6
const GATE_X = 0; // wall segment skipped here, on the south (+Z) wall
const MOAT_INNER = 8.5; // both edge-aligned to the same 1-unit grid as the
const MOAT_OUTER = 11.5; // castle pieces — see the wall/bridge loops below
const TOWER_COLLIDER_RADIUS = 0.55;
const CELL_HALF = 0.5; // every wall/moat piece here is a ~1x1 footprint

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

// Nature Kit's river tiles are on the same 1-unit grid as the castle pieces.
// "ground_riverOpen" is the one tile in that set textured as pure open
// water with no baked-in bank/grass edge, so tiling it across the whole
// moat band avoids guessing bank-tile rotations — every cell looks correct
// regardless of orientation.
function buildMoat(scene) {
  const jobs = [];
  for (let x = -MOAT_OUTER + 0.5; x <= MOAT_OUTER - 0.5; x++) {
    for (let z = -MOAT_OUTER + 0.5; z <= MOAT_OUTER - 0.5; z++) {
      if (Math.max(Math.abs(x), Math.abs(z)) < MOAT_INNER) continue; // inside the castle apron
      // ground_riverOpen's own mesh sits ~0.05 units below its node origin
      // (it's modeled as a recessed riverbed) — 0.1 clears the flat ground
      // plane at y=0, which fully hid it at smaller offsets.
      jobs.push(place(scene, "ground_riverOpen", x, z, 0.15, 0, NATURE_BASE));

      const underBridge = x === GATE_X && z > CASTLE_HALF; // the bridge crosses here — leave it walkable
      if (!underBridge) addBoxCollider(x, z, CELL_HALF, CELL_HALF);
    }
  }
  return jobs;
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

// Straight wall segments between the corner towers. Every 4th segment is
// swapped for "wall-pillar" (same 1x1 footprint, a buttressed look) purely
// for visual variety along an otherwise repetitive run.
function buildWalls(scene) {
  const jobs = [];
  const pieceFor = (i) => (Math.abs(i) % 4 === 0 ? "wall-pillar" : "wall");
  for (let i = -CASTLE_HALF + 1; i <= CASTLE_HALF - 1; i++) {
    jobs.push(place(scene, pieceFor(i), i, -CASTLE_HALF, 0, 0)); // north wall
    addBoxCollider(i, -CASTLE_HALF, CELL_HALF, CELL_HALF);

    if (i !== GATE_X) {
      jobs.push(place(scene, pieceFor(i), i, CASTLE_HALF, 0, 0)); // south wall, gate gap left open
      addBoxCollider(i, CASTLE_HALF, CELL_HALF, CELL_HALF);
    }

    jobs.push(place(scene, pieceFor(i), -CASTLE_HALF, i, 0, Math.PI / 2)); // west wall
    addBoxCollider(-CASTLE_HALF, i, CELL_HALF, CELL_HALF);

    jobs.push(place(scene, pieceFor(i), CASTLE_HALF, i, 0, Math.PI / 2)); // east wall
    addBoxCollider(CASTLE_HALF, i, CELL_HALF, CELL_HALF);
  }
  return jobs;
}

function buildBridge(scene) {
  const jobs = [];
  for (let z = CASTLE_HALF + 1; z <= MOAT_OUTER - 0.5; z++) {
    jobs.push(place(scene, "bridge-straight", GATE_X, z, 0, 0));
  }
  return jobs;
}

// A little atmosphere just outside the moat, near the approach — not part
// of the castle structure itself, so no colliders (small/decorative enough
// to walk past without needing to be blocking).
function buildApproachDressing(scene) {
  return [
    place(scene, "siege-ballista", -3, MOAT_OUTER + 2.5, 0, Math.PI, CASTLE_BASE),
    place(scene, "siege-catapult", 3.5, MOAT_OUTER + 3, 0, Math.PI * 0.85, CASTLE_BASE),
    place(scene, "rocks-large", -6.5, MOAT_OUTER + 1, 0, 0.4, CASTLE_BASE),
    place(scene, "rocks-small", 6, MOAT_OUTER + 1.5, 0, -0.6, CASTLE_BASE),
  ];
}

export async function buildCastle(scene) {
  const jobs = [
    ...buildTowers(scene),
    ...buildWalls(scene),
    ...buildBridge(scene),
    ...buildMoat(scene),
    ...buildApproachDressing(scene),
  ];
  await Promise.all(jobs);
}
