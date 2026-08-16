import * as THREE from "three";
import { loadParticleTexture } from "./particle-textures.js";

// Kenney's Particle Pack (CC0) — small twinkly shapes read well as magic
// motes at the sizes we use here.
const textures = [loadParticleTexture("spark_02"), loadParticleTexture("star_04")];

const PARTICLE_COUNT = 36;
const DRIFT_RADIUS = 0.5; // how far a particle spirals out from the spawn column
const RISE_HEIGHT = 1.6; // total height climbed over a particle's lifetime
const LIFETIME_RANGE = [0.9, 1.6]; // seconds
const SIZE_RANGE = [0.12, 0.26];
const SPAWN_CHANCE_PER_SECOND = 6; // per idle particle slot, while active

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

// A pool of additive-blended sparkle sprites that spawn low around a center
// point, spiral upward while fading, and recycle once they expire — gives
// the focus glow an actual emanating-magic feel instead of a static outline.
// Call update(dt, center, active) every frame; particles only spawn while
// `active` is true, but any already in flight finish their arc so the
// effect doesn't cut off abruptly the instant focus ends.
export function createFocusParticles(color = 0xffdd44) {
  const group = new THREE.Group();
  const particles = [];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const material = new THREE.SpriteMaterial({
      map: textures[i % textures.length],
      color,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const sprite = new THREE.Sprite(material);
    sprite.visible = false;
    group.add(sprite);
    particles.push({ sprite, age: 0, lifetime: 0, angle: 0, radius: 0, baseY: 0 });
  }

  function respawn(p, center) {
    p.age = 0;
    p.lifetime = randomBetween(...LIFETIME_RANGE);
    p.angle = Math.random() * Math.PI * 2;
    p.radius = randomBetween(0.1, DRIFT_RADIUS);
    p.baseY = center.y;
    p.sprite.scale.setScalar(randomBetween(...SIZE_RANGE));
    p.sprite.position.set(
      center.x + Math.cos(p.angle) * p.radius,
      p.baseY,
      center.z + Math.sin(p.angle) * p.radius,
    );
    p.sprite.visible = true;
  }

  function update(dt, center, active) {
    for (const p of particles) {
      if (p.sprite.visible) {
        p.age += dt;
        if (p.age >= p.lifetime) {
          if (active) {
            respawn(p, center);
          } else {
            p.sprite.visible = false;
          }
          continue;
        }
        const t = p.age / p.lifetime;
        p.angle += dt * 1.4;
        const pull = 1 - t * 0.4; // spirals slightly inward as it rises
        p.sprite.position.set(
          center.x + Math.cos(p.angle) * p.radius * pull,
          p.baseY + t * RISE_HEIGHT,
          center.z + Math.sin(p.angle) * p.radius * pull,
        );
        // quick fade in, hold, fade out over the back half of its life
        const fade = t < 0.15 ? t / 0.15 : 1 - Math.max(0, (t - 0.5) / 0.5);
        p.sprite.material.opacity = Math.max(0, fade) * 0.9;
      } else if (active && Math.random() < dt * SPAWN_CHANCE_PER_SECOND) {
        respawn(p, center); // staggered so they don't all burst in on the same frame
      }
    }
  }

  return { group, update };
}
