import * as THREE from "three";

const loader = new THREE.TextureLoader();
const cache = new Map();

// Cached loader for Kenney's Particle Pack (CC0) sprites — shared across
// effect modules (focus-particles.js, dash-effects.js, ...) so the same
// texture isn't fetched/decoded more than once.
export function loadParticleTexture(name) {
  if (!cache.has(name)) {
    cache.set(name, loader.load(`/assets/particle-pack/png-transparent/${name}.png`));
  }
  return cache.get(name);
}
