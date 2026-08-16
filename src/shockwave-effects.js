import * as THREE from "three";
import { loadParticleTexture } from "./particle-textures.js";

const sparkTextures = [loadParticleTexture("spark_01"), loadParticleTexture("star_02"), loadParticleTexture("spark_03")];
const glowTexture = loadParticleTexture("flare_01"); // soft round glow, used for the pillar + a few big flares

// Tuned by actually measuring what the previous version looked like on
// screen: RING_MAX_SCALE=11 meant the ring's radius blew past the visible
// framing almost instantly (confirmed by sampling its live scale mid-flight
// — it was already 8+ units out, off in the grass). Bringing the max scale
// down and adding a second, slower afterglow ring is what makes it actually
// read as a sweep across the ground instead of an instant blink.
const RING_INNER_DURATION = 0.4;
const RING_INNER_MAX_SCALE = 4.2;
const RING_OUTER_DURATION = 0.75;
const RING_OUTER_MAX_SCALE = 5.2;
const RING_OUTER_DELAY = 0.08;

const FLASH_DURATION = 0.18;
const FLASH_MAX_SCALE = 1.6;

const PILLAR_DURATION = 0.45;
const PILLAR_MAX_HEIGHT = 3.2;

const GROUND_BURST_COUNT = 46;
const ERUPTION_BURST_COUNT = 16;
const BURST_LIFETIME_RANGE = [0.35, 0.7];
const BURST_SIZE_RANGE = [0.14, 0.32];
const FLARE_SIZE_RANGE = [0.35, 0.6];
const BURST_DRAG = 3;
const GRAVITY = 2.2; // pulls the eruption particles back down

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function makeAdditiveSprite(texture, color) {
  const material = new THREE.SpriteMaterial({
    map: texture,
    color,
    transparent: true,
    opacity: 1,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  return new THREE.Sprite(material);
}

// A genuinely showy ground-impact: two expanding rings (fast bright inner +
// slower afterglow outer), a quick flash disc at the cast point, a rising
// energy pillar, and a two-part particle burst — most sparks kicked out
// low across the ground, plus a smaller batch erupting upward and arcing
// back down under gravity. All additive-blended gold so it also catches
// the bloom pass.
export function createShockwaveEffect(color = 0xffdd44) {
  const group = new THREE.Group();
  const rings = [];
  const flashes = [];
  const pillars = [];
  const sparks = [];

  function spawnRing(origin, duration, maxScale, delay) {
    const mesh = new THREE.Mesh(
      new THREE.RingGeometry(0.85, 1, 64),
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.copy(origin);
    mesh.position.y = 0.05;
    mesh.scale.setScalar(0.01);
    group.add(mesh);
    rings.push({ mesh, age: -delay, duration, maxScale });
  }

  function spawnFlash(origin) {
    const sprite = makeAdditiveSprite(glowTexture, 0xffffff);
    sprite.position.copy(origin);
    sprite.position.y = 0.15;
    sprite.scale.setScalar(0.1);
    group.add(sprite);
    flashes.push({ sprite, age: 0 });
  }

  function spawnPillar(origin) {
    const sprite = makeAdditiveSprite(glowTexture, color);
    sprite.center.set(0.5, 0); // scale/grow up from its base instead of its middle
    sprite.position.copy(origin);
    sprite.position.y = 0;
    sprite.scale.set(1.1, 0.1, 1);
    group.add(sprite);
    pillars.push({ sprite, age: 0 });
  }

  function spawnSparks(origin, count, { eruption } = {}) {
    for (let i = 0; i < count; i++) {
      const isFlare = !eruption && i % 9 === 0;
      const texture = isFlare ? glowTexture : sparkTextures[i % sparkTextures.length];
      const sprite = makeAdditiveSprite(texture, color);
      sprite.scale.setScalar(isFlare ? randomBetween(...FLARE_SIZE_RANGE) : randomBetween(...BURST_SIZE_RANGE));
      sprite.position.copy(origin);
      sprite.position.y += 0.05;
      group.add(sprite);

      let velocity;
      if (eruption) {
        const angle = Math.random() * Math.PI * 2;
        const radius = randomBetween(0.2, 1.2);
        velocity = new THREE.Vector3(Math.cos(angle) * radius, randomBetween(3.5, 6), Math.sin(angle) * radius);
      } else {
        const angle = (i / count) * Math.PI * 2 + randomBetween(-0.12, 0.12);
        const speed = randomBetween(2.5, 6);
        velocity = new THREE.Vector3(Math.cos(angle) * speed, randomBetween(0.3, 1.4), Math.sin(angle) * speed);
      }

      sparks.push({
        sprite,
        velocity,
        age: 0,
        lifetime: randomBetween(...BURST_LIFETIME_RANGE),
        gravity: eruption,
      });
    }
  }

  function trigger(origin) {
    spawnRing(origin, RING_INNER_DURATION, RING_INNER_MAX_SCALE, 0);
    spawnRing(origin, RING_OUTER_DURATION, RING_OUTER_MAX_SCALE, RING_OUTER_DELAY);
    spawnFlash(origin);
    spawnPillar(origin);
    spawnSparks(origin, GROUND_BURST_COUNT);
    spawnSparks(origin, ERUPTION_BURST_COUNT, { eruption: true });
  }

  function update(dt) {
    for (let i = rings.length - 1; i >= 0; i--) {
      const r = rings[i];
      r.age += dt;
      if (r.age < 0) continue; // still waiting out its delay
      const t = Math.min(1, r.age / r.duration);
      if (t >= 1) {
        group.remove(r.mesh);
        r.mesh.geometry.dispose();
        r.mesh.material.dispose();
        rings.splice(i, 1);
        continue;
      }
      const eased = 1 - Math.pow(1 - t, 2);
      r.mesh.scale.setScalar(0.01 + eased * r.maxScale);
      r.mesh.material.opacity = 0.9 * (1 - t * t);
    }

    for (let i = flashes.length - 1; i >= 0; i--) {
      const f = flashes[i];
      f.age += dt;
      const t = Math.min(1, f.age / FLASH_DURATION);
      if (t >= 1) {
        group.remove(f.sprite);
        f.sprite.material.dispose();
        flashes.splice(i, 1);
        continue;
      }
      f.sprite.scale.setScalar(FLASH_MAX_SCALE * (0.3 + t * 0.7));
      f.sprite.material.opacity = 1 - t;
    }

    for (let i = pillars.length - 1; i >= 0; i--) {
      const p = pillars[i];
      p.age += dt;
      const t = Math.min(1, p.age / PILLAR_DURATION);
      if (t >= 1) {
        group.remove(p.sprite);
        p.sprite.material.dispose();
        pillars.splice(i, 1);
        continue;
      }
      const grow = 1 - Math.pow(1 - Math.min(1, t / 0.35), 2); // rises quickly
      p.sprite.scale.set(1.1, grow * PILLAR_MAX_HEIGHT, 1);
      p.sprite.material.opacity = 0.8 * (1 - Math.pow(t, 1.5));
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
      if (s.gravity) s.velocity.y -= GRAVITY * dt;
      s.velocity.x *= Math.max(0, 1 - dt * BURST_DRAG);
      s.velocity.z *= Math.max(0, 1 - dt * BURST_DRAG);
      s.sprite.position.addScaledVector(s.velocity, dt);
      if (s.sprite.position.y < 0.02) {
        s.sprite.position.y = 0.02;
        s.velocity.y = 0;
      }
      s.sprite.material.opacity = 1 - s.age / s.lifetime;
    }
  }

  return { group, trigger, update };
}
