import { place, NATURE_BASE } from "./kit-loader.js";

// A backdrop ring of Nature Kit terrain around the sealed castle, visible
// over/around the walls from the player's elevated camera — purely
// decorative (nothing here has a collider; the walls already stop the
// player from ever reaching it) so the world reads as a real place instead
// of the castle floating in a flat green void.
const RING_INNER = 15; // just outside the wall (wall face is at 12.5)
const RING_OUTER = 45;
const TREE_COUNT = 220;
const ROCK_COUNT = 50;

const TREE_KINDS = [
  "tree_pineTallA",
  "tree_pineTallB",
  "tree_pineTallC",
  "tree_pineTallD",
  "tree_pineRoundA",
  "tree_pineRoundB",
  "tree_pineRoundC",
  "tree_oak",
  "tree_default",
  "tree_detailed",
];

const ROCK_KINDS = ["rock_largeA", "rock_largeB", "rock_largeC", "rock_largeD", "rock_tallA", "rock_tallB"];

// Raised cliff formations framing the castle at a few points around the
// ring, echoing the layered-terrain look of Kenney's own Nature Kit
// promo shots — a couple of stacked cliff blocks topped with pine trees.
const CLIFF_CLUSTERS = 7;
const CLIFF_KINDS = ["cliff_block_rock", "cliff_large_rock", "cliff_half_rock"];

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function ringPoint(innerR = RING_INNER, outerR = RING_OUTER) {
  const angle = Math.random() * Math.PI * 2;
  const radius = innerR + Math.random() * (outerR - innerR);
  return { x: Math.cos(angle) * radius, z: Math.sin(angle) * radius, angle };
}

function buildTrees(scene) {
  const jobs = [];
  for (let i = 0; i < TREE_COUNT; i++) {
    const { x, z } = ringPoint();
    const scale = 0.8 + Math.random() * 0.6;
    jobs.push(place(scene, pick(TREE_KINDS), x, z, 0, Math.random() * Math.PI * 2, NATURE_BASE, scale));
  }
  return jobs;
}

function buildRocks(scene) {
  const jobs = [];
  for (let i = 0; i < ROCK_COUNT; i++) {
    const { x, z } = ringPoint(RING_INNER, RING_OUTER * 0.7); // keep rocks a bit closer in than the far treeline
    jobs.push(place(scene, pick(ROCK_KINDS), x, z, 0, Math.random() * Math.PI * 2, NATURE_BASE));
  }
  return jobs;
}

function buildCliffClusters(scene) {
  const jobs = [];
  for (let i = 0; i < CLIFF_CLUSTERS; i++) {
    const angle = (i / CLIFF_CLUSTERS) * Math.PI * 2 + Math.random() * 0.4;
    const radius = 22 + Math.random() * 10;
    const cx = Math.cos(angle) * radius;
    const cz = Math.sin(angle) * radius;
    const rotationY = Math.random() * Math.PI * 2;

    // A little 2x2 raised block so the cluster reads as a small hill, not
    // a single floating rock.
    for (const [dx, dz] of [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ]) {
      jobs.push(place(scene, pick(CLIFF_KINDS), cx + dx, cz + dz, 0, rotationY, NATURE_BASE));
    }
    // Pine trees on top of the rise.
    for (let t = 0; t < 3; t++) {
      const tx = cx + Math.random() * 2 - 0.5;
      const tz = cz + Math.random() * 2 - 0.5;
      jobs.push(place(scene, pick(TREE_KINDS), tx, tz, 1, Math.random() * Math.PI * 2, NATURE_BASE, 0.9));
    }
  }
  return jobs;
}

export async function buildSurroundings(scene) {
  const jobs = [...buildTrees(scene), ...buildRocks(scene), ...buildCliffClusters(scene)];
  await Promise.all(jobs);
}
