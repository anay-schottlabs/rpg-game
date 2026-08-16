import * as THREE from "three";
import { loadParticleTexture } from "./particle-textures.js";

const textures = [loadParticleTexture("spark_01"), loadParticleTexture("star_02")];

const RING_DURATION = 0.5; // seconds
const RING_MAX_SCALE = 11;
const BURST_COUNT = 28;
const BURST_LIFETIME_RANGE = [0.3, 0.55];
const BURST_SIZE_RANGE = [0.1, 0.24];
const BURST_DRAG = 3.5; // per second, exponential-ish velocity falloff

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

// Expanding ground ring + omnidirectional spark burst for the shockwave
// spell — unlike the dash's backward-biased kick-up, this one radiates
// evenly in every direction from the cast point.
export function createShockwaveEffect(color = 0xffdd44) {
  const group = new THREE.Group();
  const rings = [];
  const sparks = [];

  function trigger(origin) {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.85, 1, 48),
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.copy(origin);
    ring.position.y = 0.05;
    ring.scale.setScalar(0.01);
    group.add(ring);
    rings.push({ mesh: ring, age: 0 });

    for (let i = 0; i < BURST_COUNT; i++) {
      const angle = (i / BURST_COUNT) * Math.PI * 2 + randomBetween(-0.15, 0.15);
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

      const speed = randomBetween(2, 4.5);
      const velocity = new THREE.Vector3(
        Math.cos(angle) * speed,
        randomBetween(0.1, 0.6),
        Math.sin(angle) * speed,
      );
      sparks.push({ sprite, velocity, age: 0, lifetime: randomBetween(...BURST_LIFETIME_RANGE) });
    }
  }

  function update(dt) {
    for (let i = rings.length - 1; i >= 0; i--) {
      const r = rings[i];
      r.age += dt;
      const t = Math.min(1, r.age / RING_DURATION);
      if (t >= 1) {
        group.remove(r.mesh);
        r.mesh.geometry.dispose();
        r.mesh.material.dispose();
        rings.splice(i, 1);
        continue;
      }
      const eased = 1 - Math.pow(1 - t, 2); // fast expansion, easing off toward the end
      r.mesh.scale.setScalar(0.01 + eased * RING_MAX_SCALE);
      r.mesh.material.opacity = 0.85 * (1 - t);
    }

    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.age += dt;
      if (s.age >= s.lifetime) {
        group.remove(s.sprite);
        s.sprite.material.dispose();
        sparks.splice(i, 1);
        continue;
      }
      s.velocity.multiplyScalar(Math.max(0, 1 - dt * BURST_DRAG));
      s.sprite.position.addScaledVector(s.velocity, dt);
      s.sprite.material.opacity = 1 - s.age / s.lifetime;
    }
  }

  return { group, trigger, update };
}
