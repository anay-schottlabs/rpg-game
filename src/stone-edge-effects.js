import * as THREE from "three";
import { loadParticleTexture } from "./particle-textures.js";

const sparkTextures = [loadParticleTexture("spark_01"), loadParticleTexture("star_02")];
const glowTexture = loadParticleTexture("flare_01");

const SPIKE_COUNT = 6; // last one is the bigger "final" spike
const SPIKE_SPACING = 0.58; // units between spikes along the cast direction — closer than a spread-out trail, but not so tight the clusters merge into one blob
const SPIKE_STAGGER = 0.13; // seconds between each spike starting its buildup — the "traveling" feel
const SPIKE_RISE_DURATION = 0.28;
const SPIKE_HOLD_DURATION = 0.85; // stays fully formed a good while before fading
const SPIKE_FADE_DURATION = 0.5;
const SPIKE_HEIGHT = 1.15;
const SPIKE_RADIUS = 0.18;
const FINAL_SPIKE_HEIGHT = 2.2;
const FINAL_SPIKE_RADIUS = 0.36;
const SHARDS_PER_CLUSTER = [4, 5]; // inclusive range

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

// A geode-like cluster: one tall central shard surrounded by several
// smaller, outward-tilted ones, all sharing a single material (so its
// opacity fade only has to be driven once per cluster, not per shard).
// Uniform scaling on the returned group grows the whole cluster from the
// ground without shearing the tilted shards (each shard's own geometry is
// pre-translated so its base sits at its local origin — see makeShard).
function makeCrystalCluster(baseRadius, baseHeight, color) {
  const material = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.55,
    transparent: true,
    opacity: 1,
    roughness: 0.25,
    metalness: 0.15,
  });

  const group = new THREE.Group();
  const shardCount = Math.round(randomBetween(SHARDS_PER_CLUSTER[0], SHARDS_PER_CLUSTER[1]));

  for (let i = 0; i < shardCount; i++) {
    const isCenter = i === 0;
    const radius = baseRadius * (isCenter ? 1 : randomBetween(0.45, 0.75));
    const height = baseHeight * (isCenter ? 1 : randomBetween(0.4, 0.78));
    const geometry = new THREE.ConeGeometry(radius, height, 5, 1);
    geometry.translate(0, height / 2, 0);
    const shard = new THREE.Mesh(geometry, material);
    shard.castShadow = true;

    if (!isCenter) {
      const offsetRadius = randomBetween(baseRadius * 0.35, baseRadius * 0.85);
      const angle = (i / shardCount) * Math.PI * 2 + randomBetween(-0.3, 0.3);
      shard.position.set(Math.cos(angle) * offsetRadius, 0, Math.sin(angle) * offsetRadius);
      shard.rotation.x = randomBetween(-0.2, 0.2);
      shard.rotation.z = randomBetween(-0.4, 0.4);
    } else {
      shard.rotation.z = randomBetween(-0.06, 0.06);
    }
    shard.rotation.y = Math.random() * Math.PI * 2;
    group.add(shard);
  }

  group.userData.material = material;
  return group;
}

// Stone Edge: a tight line of geode-like crystal clusters erupts one after
// another away from the cast point in the caster's facing direction, each
// preceded by a brief glowing "charge" cue at its spot, ending in a bigger
// final cluster with a bigger burst.
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
    flashes.push({ sprite: flash, age: 0, duration: big ? 0.2 : 0.13, maxScale: big ? 1.7 : 0.85 });

    const count = big ? 18 : 9;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = randomBetween(1.5, big ? 5.5 : 3.6);
      const sprite = makeAdditiveSprite(sparkTextures[i % sparkTextures.length], color);
      sprite.scale.setScalar(randomBetween(0.1, big ? 0.26 : 0.18));
      sprite.position.copy(position);
      group.add(sprite);
      sparks.push({
        sprite,
        velocity: new THREE.Vector3(Math.cos(angle) * speed, randomBetween(1.5, big ? 5.5 : 3.4), Math.sin(angle) * speed),
        age: 0,
        lifetime: randomBetween(0.35, 0.65),
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
      const cluster = makeCrystalCluster(radius, height, color);

      const position = origin.clone().addScaledVector(dir, SPIKE_SPACING * (i + 1));
      position.x += randomBetween(-0.08, 0.08);
      position.z += randomBetween(-0.08, 0.08);
      position.y = 0;
      cluster.position.copy(position);
      cluster.scale.setScalar(0.001);
      group.add(cluster);

      const delayDuration = i * SPIKE_STAGGER;
      let chargeGlow = null;
      if (delayDuration > 0) {
        chargeGlow = makeAdditiveSprite(glowTexture, 0xffe9a8);
        chargeGlow.position.copy(position);
        chargeGlow.position.y = 0.03;
        chargeGlow.scale.setScalar(0.02);
        chargeGlow.material.opacity = 0;
        group.add(chargeGlow);
      }

      spikes.push({
        cluster,
        material: cluster.userData.material,
        position,
        isFinal,
        erupted: false,
        age: -delayDuration,
        delayDuration,
        chargeGlow,
      });
    }
  }

  function update(dt) {
    const totalLifetime = SPIKE_RISE_DURATION + SPIKE_HOLD_DURATION + SPIKE_FADE_DURATION;

    for (let i = spikes.length - 1; i >= 0; i--) {
      const s = spikes[i];
      s.age += dt;

      if (s.age < 0) {
        // Building up to its own eruption — the charge glow grows and
        // brightens (eased in, so it feels like it's gathering energy
        // rather than ticking up linearly) right up until contact.
        if (s.chargeGlow) {
          const t = Math.min(1, (s.delayDuration + s.age) / s.delayDuration);
          const eased = t * t;
          s.chargeGlow.scale.setScalar(0.02 + eased * 0.28);
          s.chargeGlow.material.opacity = eased * 0.55;
        }
        continue;
      }

      if (!s.erupted) {
        s.erupted = true;
        if (s.chargeGlow) {
          group.remove(s.chargeGlow);
          s.chargeGlow.material.dispose();
          s.chargeGlow = null;
        }
        spawnImpact(s.position, s.isFinal);
      }

      if (s.age >= totalLifetime) {
        group.remove(s.cluster);
        s.material.dispose();
        for (const shard of s.cluster.children) shard.geometry.dispose();
        spikes.splice(i, 1);
        continue;
      }

      if (s.age < SPIKE_RISE_DURATION) {
        s.cluster.scale.setScalar(Math.max(0.001, easeOutBack(s.age / SPIKE_RISE_DURATION)));
      } else if (s.age < SPIKE_RISE_DURATION + SPIKE_HOLD_DURATION) {
        s.cluster.scale.setScalar(1);
      } else {
        const fadeT = (s.age - SPIKE_RISE_DURATION - SPIKE_HOLD_DURATION) / SPIKE_FADE_DURATION;
        s.cluster.scale.setScalar(1 - fadeT * 0.25);
        s.material.opacity = 1 - fadeT;
      }
    }

    for (let i = flashes.length - 1; i >= 0; i--) {
      const f = flashes[i];
      f.age += dt;
      const t = Math.min(1, f.age / f.duration);
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
