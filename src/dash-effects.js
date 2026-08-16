import * as THREE from "three";
import { clone as cloneSkinned } from "three/addons/utils/SkeletonUtils.js";
import { loadParticleTexture } from "./particle-textures.js";

const textures = [loadParticleTexture("spark_01"), loadParticleTexture("star_02")];

const BURST_COUNT = 18;
const BURST_LIFETIME_RANGE = [0.35, 0.6];
const BURST_SIZE_RANGE = [0.12, 0.28];
const BURST_DRAG = 4; // per second, exponential-ish velocity falloff

const AFTERIMAGE_LIFETIME = 0.35;
const AFTERIMAGE_OPACITY = 0.45;

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

// Radial spark burst + frozen-pose afterimage trail for the dash spell.
// Both are pooled as plain arrays rather than object pools since dashes are
// infrequent bursts of activity, not a sustained per-frame emitter.
export function createDashEffects(color = 0xffdd44) {
  const group = new THREE.Group();
  const bursts = [];
  const afterimages = [];

  // Kicks up mostly behind the dash direction with some sideways spread and
  // a little lift, like dust/sparks kicked up by the launch.
  function spawnBurst(origin, direction) {
    const back = direction.clone().multiplyScalar(-1);
    const sideways = new THREE.Vector3(-direction.z, 0, direction.x);

    for (let i = 0; i < BURST_COUNT; i++) {
      const material = new THREE.SpriteMaterial({
        map: textures[i % textures.length],
        color,
        transparent: true,
        opacity: 1,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const sprite = new THREE.Sprite(material);
      sprite.scale.setScalar(randomBetween(...BURST_SIZE_RANGE));
      sprite.position.copy(origin);
      group.add(sprite);

      const velocity = back
        .clone()
        .multiplyScalar(randomBetween(1.5, 3.5))
        .addScaledVector(sideways, randomBetween(-0.9, 0.9))
        .add(new THREE.Vector3(0, randomBetween(0.2, 1.2), 0));

      bursts.push({ sprite, velocity, age: 0, lifetime: randomBetween(...BURST_LIFETIME_RANGE) });
    }
  }

  // Freezes a tinted, silhouette-only snapshot of the player's current pose
  // in place. Uses SkeletonUtils.clone so the skinned mesh comes along with
  // its own independent skeleton — since nothing drives that clone's
  // skeleton afterward, it just stays frozen in the pose it was cloned at,
  // no manual vertex baking needed. Effect meshes riding along in the
  // hierarchy (the X-ray ghost, the focus glow rim — both flagged with
  // userData.isEffectMesh) are hidden rather than tinted so they don't
  // double up in the snapshot.
  function spawnAfterimage(playerRoot) {
    const ghost = cloneSkinned(playerRoot);
    ghost.position.copy(playerRoot.position);
    ghost.quaternion.copy(playerRoot.quaternion);
    ghost.scale.copy(playerRoot.scale);

    const materials = [];
    ghost.traverse((node) => {
      if (!node.isMesh) return;
      if (node.userData.isEffectMesh) {
        node.visible = false;
        return;
      }
      const material = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: AFTERIMAGE_OPACITY,
        depthWrite: false,
      });
      node.material = material;
      materials.push(material);
    });

    group.add(ghost);
    afterimages.push({ root: ghost, materials, age: 0 });
  }

  function update(dt) {
    for (let i = bursts.length - 1; i >= 0; i--) {
      const b = bursts[i];
      b.age += dt;
      if (b.age >= b.lifetime) {
        group.remove(b.sprite);
        b.sprite.material.dispose();
        bursts.splice(i, 1);
        continue;
      }
      b.velocity.multiplyScalar(Math.max(0, 1 - dt * BURST_DRAG));
      b.sprite.position.addScaledVector(b.velocity, dt);
      b.sprite.material.opacity = 1 - b.age / b.lifetime;
    }

    for (let i = afterimages.length - 1; i >= 0; i--) {
      const a = afterimages[i];
      a.age += dt;
      const t = a.age / AFTERIMAGE_LIFETIME;
      if (t >= 1) {
        group.remove(a.root);
        for (const material of a.materials) material.dispose();
        afterimages.splice(i, 1);
        continue;
      }
      for (const material of a.materials) material.opacity = AFTERIMAGE_OPACITY * (1 - t);
    }
  }

  return { group, spawnBurst, spawnAfterimage, update };
}
