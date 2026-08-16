import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

// Shared glTF loader/cache/placer for the Kenney asset kits under
// assets/models/ — used by surroundings.js so the Nature Kit
// metalness fix (see below) and load caching stay in one place.
export const NATURE_BASE = `${import.meta.env.BASE_URL}assets/models/nature-kit/`;
export const FANTASY_TOWN_BASE = `${import.meta.env.BASE_URL}assets/models/fantasy-town-kit/`;

const loader = new GLTFLoader();
const cache = new Map();

export function loadModel(name, base) {
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

export async function place(scene, name, x, z, y = 0, rotationY = 0, base = NATURE_BASE, scale = 1) {
  const template = await loadModel(name, base);
  const instance = template.clone(true);
  instance.position.set(x, y, z);
  instance.rotation.y = rotationY;
  if (scale !== 1) instance.scale.setScalar(scale);
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
