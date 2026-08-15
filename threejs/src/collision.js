// Simple 2D (XZ-plane) collider registry + resolver for the castle. Colliders
// are static circles (towers) and axis-aligned boxes (walls, moat tiles).
// Movement is resolved by pushing the player's circle out of any overlap
// along the actual direction of penetration — not the old axis-separated
// "try X, then try Y" approach that caused the corner/overlap bugs in the
// canvas version — so sliding along a wall or a tower's curve feels smooth
// and getting wedged between two colliders isn't possible.
const colliders = [];

export function addCircleCollider(x, z, radius) {
  colliders.push({ type: "circle", x, z, radius });
}

export function addBoxCollider(x, z, halfX, halfZ) {
  colliders.push({ type: "box", x, z, halfX, halfZ });
}

export function clearColliders() {
  colliders.length = 0;
}

// Mutates `pos` ({x, z}) so a circle of `radius` centered on it no longer
// overlaps any registered collider. Runs a couple of passes since pushing
// out of one collider can push into another (e.g. the wall/tower seam).
export function resolveCollisions(pos, radius) {
  for (let pass = 0; pass < 3; pass++) {
    for (const c of colliders) {
      if (c.type === "circle") {
        resolveCircle(pos, radius, c);
      } else {
        resolveBox(pos, radius, c);
      }
    }
  }
}

function resolveCircle(pos, radius, c) {
  const dx = pos.x - c.x;
  const dz = pos.z - c.z;
  const dist = Math.hypot(dx, dz);
  const minDist = c.radius + radius;
  if (dist >= minDist) return;
  if (dist > 1e-6) {
    const push = (minDist - dist) / dist;
    pos.x += dx * push;
    pos.z += dz * push;
  } else {
    pos.x += minDist; // degenerate (exact same point) — nudge out arbitrarily
  }
}

function resolveBox(pos, radius, c) {
  const closestX = Math.max(c.x - c.halfX, Math.min(pos.x, c.x + c.halfX));
  const closestZ = Math.max(c.z - c.halfZ, Math.min(pos.z, c.z + c.halfZ));
  const dx = pos.x - closestX;
  const dz = pos.z - closestZ;
  const dist = Math.hypot(dx, dz);

  if (dist > 1e-6) {
    if (dist >= radius) return;
    const push = (radius - dist) / dist;
    pos.x += dx * push;
    pos.z += dz * push;
    return;
  }

  // Player's center is inside the box — push out along the shallower axis.
  const penX = c.halfX + radius - Math.abs(pos.x - c.x);
  const penZ = c.halfZ + radius - Math.abs(pos.z - c.z);
  if (penX < penZ) {
    pos.x += Math.sign(pos.x - c.x || 1) * penX;
  } else {
    pos.z += Math.sign(pos.z - c.z || 1) * penZ;
  }
}
