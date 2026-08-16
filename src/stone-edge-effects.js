import * as THREE from "three";
import { loadParticleTexture } from "./particle-textures.js";

const sparkTextures = [loadParticleTexture("spark_01"), loadParticleTexture("star_02")];
const glowTexture = loadParticleTexture("flare_01");

const SPIKE_COUNT = 5; // last one is the bigger "final" spike
const SPIKE_SPACING = 0.75; // units between spikes along the cast direction
const SPIKE_STAGGER = 0.09; // seconds between each spike erupting — the "traveling" feel
const SPIKE_RISE_DURATION = 0.22;
const SPIKE_HOLD_DURATION = 0.35;
const SPIKE_FADE_DURATION = 0.35;
const SPIKE_HEIGHT = 1.0;
const SPIKE_RADIUS = 0.16;
const FINAL_SPIKE_HEIGHT = 1.8;
const FINAL_SPIKE_RADIUS = 0.3;

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

// Standard easeOutBack — overshoots slightly past 1 before settling there,
// which is what sells a spike "punching" up out of the ground rather than
// just growing smoothly.
function easeOutBack(t) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  const x = t - 1;
  return 1 + c3 * x * x * x + c1 * x * x;
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

// A jagged, glowing shard rather than a smooth cone — low radial segment
// count so it reads as faceted rock, translated so its local origin is the
// base (not the center), so scaling mesh.scale.y grows it up from the
// ground instead of from its middle.
function makeCrystalMesh(radius, height, color) {
  const geometry = new THREE.ConeGeometry(radius, height, 5, 1);
  geometry.translate(0, height / 2, 0);
  const material = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 1.1,
    transparent: true,
    opacity: 0.92,
    roughness: 0.25,
    metalness: 0.1,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  return mesh;
}

// Stone Edge: a line of crystal spikes erupts one after another away from
// the cast point in the caster's facing direction, each with its own small
// impact burst, ending in a bigger final spike with a bigger burst.
export function createStoneEdgeEffect(color = 0xffdd44) {
  const group = new THREE.Group();
  const spikes = [];
  const sparks = [];
  const flashes = [];

  function spawnImpact(position, big) {
    const flash = makeAdditiveSprite(glowTexture, 0xffffff);
    flash.position.copy(position);
    flash.position.y += 0.1;
    flash.scale.setScalar(0.1);
    group.add(flash);
    flashes.push({ sprite: flash, age: 0, maxScale: big ? 2.2 : 1.1 });

    const count = big ? 20 : 8;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = randomBetween(1.5, big ? 5 : 3.2);
      const sprite = makeAdditiveSprite(sparkTextures[i % sparkTextures.length], color);
      sprite.scale.setScalar(randomBetween(0.1, big ? 0.3 : 0.2));
      sprite.position.copy(position);
      group.add(sprite);
      sparks.push({
        sprite,
        velocity: new THREE.Vector3(Math.cos(angle) * speed, randomBetween(1.5, big ? 5 : 3), Math.sin(angle) * speed),
        age: 0,
        lifetime: randomBetween(0.3, 0.55),
      });
    }
  }

  // origin: THREE.Vector3, direction: THREE.Vector3 (need not be normalized/flat)
  function trigger(origin, direction) {
    const dir = direction.clone().setY(0);
    if (dir.lengthSq() < 1e-6) dir.set(0, 0, 1);
    dir.normalize();

    for (let i = 0; i < SPIKE_COUNT; i++) {
      const isFinal = i === SPIKE_COUNT - 1;
      const radius = isFinal ? FINAL_SPIKE_RADIUS : SPIKE_RADIUS;
      const height = isFinal ? FINAL_SPIKE_HEIGHT : SPIKE_HEIGHT * randomBetween(0.85, 1.15);
      const mesh = makeCrystalMesh(radius, height, color);

      const position = origin.clone().addScaledVector(dir, SPIKE_SPACING * (i + 1));
      position.x += randomBetween(-0.12, 0.12);
      position.z += randomBetween(-0.12, 0.12);
      position.y = 0;
      mesh.position.copy(position);
      mesh.rotation.y = Math.random() * Math.PI * 2;
      mesh.rotation.z = randomBetween(-0.12, 0.12);
      mesh.scale.y = 0.001;
      group.add(mesh);

      spikes.push({ mesh, position, isFinal, erupted: false, age: -i * SPIKE_STAGGER });
    }
  }

  function update(dt) {
    const totalLifetime = SPIKE_RISE_DURATION + SPIKE_HOLD_DURATION + SPIKE_FADE_DURATION;

    for (let i = spikes.length - 1; i >= 0; i--) {
      const s = spikes[i];
      s.age += dt;
      if (s.age < 0) continue; // still waiting its turn in the line

      if (!s.erupted) {
        s.erupted = true;
        spawnImpact(s.position, s.isFinal);
      }

      if (s.age >= totalLifetime) {
        group.remove(s.mesh);
        s.mesh.geometry.dispose();
        s.mesh.material.dispose();
        spikes.splice(i, 1);
        continue;
      }

      if (s.age < SPIKE_RISE_DURATION) {
        s.mesh.scale.y = Math.max(0.001, easeOutBack(s.age / SPIKE_RISE_DURATION));
      } else if (s.age < SPIKE_RISE_DURATION + SPIKE_HOLD_DURATION) {
        s.mesh.scale.y = 1;
      } else {
        const fadeT = (s.age - SPIKE_RISE_DURATION - SPIKE_HOLD_DURATION) / SPIKE_FADE_DURATION;
        s.mesh.scale.y = 1 - fadeT * 0.3;
        s.mesh.material.opacity = 0.92 * (1 - fadeT);
      }
    }

    for (let i = flashes.length - 1; i >= 0; i--) {
      const f = flashes[i];
      f.age += dt;
      const t = Math.min(1, f.age / 0.18);
      if (t >= 1) {
        group.remove(f.sprite);
        f.sprite.material.dispose();
        flashes.splice(i, 1);
        continue;
      }
      f.sprite.scale.setScalar(f.maxScale * (0.3 + t * 0.7));
      f.sprite.material.opacity = 1 - t;
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
      s.velocity.y -= 6 * dt; // gravity — arcs back down like flung debris
      s.sprite.position.addScaledVector(s.velocity, dt);
      if (s.sprite.position.y < 0) {
        s.sprite.position.y = 0;
        s.velocity.y *= -0.3; // a small bounce instead of clipping through the ground
      }
      s.sprite.material.opacity = 1 - s.age / s.lifetime;
    }
  }

  return { group, trigger, update };
}
