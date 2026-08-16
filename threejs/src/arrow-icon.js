import * as THREE from "three";

// A DDR-style arrow: a notched chevron silhouette, extruded for real depth
// instead of a flat sprite. The base shape points toward local +Y.
function buildArrowShape(size) {
  const w = size / 2;
  const h = size / 2;
  const shape = new THREE.Shape();
  shape.moveTo(0, h); // tip
  shape.lineTo(w, 0); // right shoulder
  shape.lineTo(w * 0.5, -h); // right tail
  shape.lineTo(0, -h * 0.5); // tail notch (concave, gives it the arrow silhouette)
  shape.lineTo(-w * 0.5, -h); // left tail
  shape.lineTo(-w, 0); // left shoulder
  shape.closePath();
  return shape;
}

// In-plane rotation (radians) that points the "up" base shape toward each
// direction, matching this game's WASD axes (w = -Z, s = +Z, a = -X, d = +X).
export const ARROW_DIRECTIONS = {
  up: 0,
  right: -Math.PI / 2,
  down: Math.PI,
  left: Math.PI / 2,
};

export const ARROW_COLORS = {
  up: 0xff4d4d,
  down: 0x4dff88,
  left: 0x4d9fff,
  right: 0xffd24d,
};

// Neutral dim color arrows sit at until setArrowLit(..., true) brightens
// them to their direction's signature color — makes a press read as a
// clear state change instead of just a color swap.
const UNLIT_COLOR = 0x55555f;

function buildArrowMesh({ size, depth, litColor }) {
  const geometry = new THREE.ExtrudeGeometry(buildArrowShape(size), {
    depth,
    bevelEnabled: true,
    bevelThickness: depth * 0.2,
    bevelSize: depth * 0.15,
    bevelSegments: 2,
    curveSegments: 1,
  });
  geometry.center();
  const material = new THREE.MeshStandardMaterial({
    color: UNLIT_COLOR,
    emissive: 0x000000,
    metalness: 0.1,
    roughness: 0.4,
  });
  material.userData.litColor = litColor;
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

// An upright arrow facing +Z, e.g. for a HUD panel or floating prompt —
// direction is baked into its in-plane rotation, no further orientation needed.
export function createArrowMesh(
  direction,
  { size = 1, depth = 0.15, color = ARROW_COLORS[direction] ?? 0xffffff } = {},
) {
  const mesh = buildArrowMesh({ size, depth, litColor: color });
  mesh.rotation.z = ARROW_DIRECTIONS[direction] ?? 0;
  return mesh;
}

// The same arrow laid flat on the ground, pointing across the XZ plane.
// Returned as a group so "lie flat" and "which way it points" stay two
// separate rotations rather than one hand-combined Euler. The lightable
// material is exposed via group.userData.material for setArrowLit().
export function createFloorArrow(
  direction,
  { size = 1, depth = 0.08, color = ARROW_COLORS[direction] ?? 0xffffff } = {},
) {
  const mesh = buildArrowMesh({ size, depth, litColor: color });
  mesh.rotation.x = -Math.PI / 2;
  const group = new THREE.Group();
  group.add(mesh);
  group.rotation.y = ARROW_DIRECTIONS[direction] ?? 0;
  group.userData.material = mesh.material;
  return group;
}

// Toggles an arrow created above between its dim idle look and a bright,
// glowing "lit" state (used to show which arrows the player has pressed).
export function setArrowLit(arrowObject, lit) {
  const material = arrowObject.material ?? arrowObject.userData.material;
  if (!material) return;
  if (lit) {
    material.color.setHex(material.userData.litColor);
    material.emissive.setHex(material.userData.litColor);
    material.emissiveIntensity = 1.4;
  } else {
    material.color.setHex(UNLIT_COLOR);
    material.emissive.setHex(0x000000);
    material.emissiveIntensity = 0;
  }
}
