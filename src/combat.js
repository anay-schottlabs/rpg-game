// Pure hit-detection math — takes plain {x,y,z}-shaped points (works with
// THREE.Vector3 or a network-deserialized plain object either way), no
// THREE/DOM dependency of its own.

export const SHOCKWAVE_DAMAGE = 18;
export const SHOCKWAVE_HIT_RADIUS = 4.5; // roughly matches the outer ring's max scale in shockwave-effects.js

export const STONE_EDGE_DAMAGE = 30;
export const STONE_EDGE_HIT_HALF_WIDTH = 0.7; // how close to the line counts as "in the way"

export function distanceToPoint(a, b) {
  const dx = a.x - b.x;
  const dz = a.z - b.z;
  return Math.hypot(dx, dz);
}

// Distance (in the XZ plane) from `point` to the segment [segStart, segEnd].
export function distanceToSegment(point, segStart, segEnd) {
  const dx = segEnd.x - segStart.x;
  const dz = segEnd.z - segStart.z;
  const lengthSq = dx * dx + dz * dz;

  if (lengthSq < 1e-6) return distanceToPoint(point, segStart);

  const t = Math.max(0, Math.min(1, ((point.x - segStart.x) * dx + (point.z - segStart.z) * dz) / lengthSq));
  const closest = { x: segStart.x + t * dx, z: segStart.z + t * dz };
  return distanceToPoint(point, closest);
}
