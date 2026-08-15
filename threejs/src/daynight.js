import * as THREE from "three";

// Simple day/night cycle: 4 phases (day -> dusk -> night -> dawn -> repeat),
// each PHASE_SECONDS long. Kenney's skyboxes are equirectangular panoramas
// (4096x2048, confirmed 2:1) — EquirectangularReflectionMapping is the
// correct Three.js mapping for that format, not a cube texture.
// Swaps are instant at phase boundaries (no crossfade) — a reasonable
// first pass; smoothly blending between two skybox textures would need a
// custom shader, which felt like more risk than this was worth right now.
//
// Only scene.background is set, not scene.environment — setting the
// latter turns the skybox into an image-based-lighting source, which gave
// every PBR material (ground, walls) a strong glossy tint of the sky
// color instead of their own defined colors. Sun/ambient light color and
// intensity carry the whole day/night mood shift instead.
const SKYBOX_BASE = "/assets/skyboxes/";
const PHASE_SECONDS = 30;

const PHASES = [
  { texture: "skybox-day.png", sunColor: 0xffffff, sunIntensity: 1.2, ambientIntensity: 0.6 },
  { texture: "skybox-morning.png", sunColor: 0xffaa66, sunIntensity: 0.8, ambientIntensity: 0.4 }, // dusk
  { texture: "skybox-night.png", sunColor: 0x5566aa, sunIntensity: 0.25, ambientIntensity: 0.28 },
  { texture: "skybox-morning.png", sunColor: 0xffaa66, sunIntensity: 0.8, ambientIntensity: 0.4 }, // dawn
];

export function createDayNightCycle(scene, sun, ambient) {
  const loader = new THREE.TextureLoader();
  const textureCache = new Map();

  function loadPhaseTexture(name) {
    if (!textureCache.has(name)) {
      const tex = loader.load(`${SKYBOX_BASE}${name}`);
      tex.mapping = THREE.EquirectangularReflectionMapping;
      tex.colorSpace = THREE.SRGBColorSpace;
      textureCache.set(name, tex);
    }
    return textureCache.get(name);
  }

  let elapsed = 0;
  let currentPhaseIndex = -1; // forces the first update() call to apply phase 0

  function applyPhase(index) {
    const phase = PHASES[index];
    const tex = loadPhaseTexture(phase.texture);
    scene.background = tex;
    sun.color.setHex(phase.sunColor);
    sun.intensity = phase.sunIntensity;
    ambient.intensity = phase.ambientIntensity;
  }

  function update(dt) {
    elapsed += dt;
    const totalPhaseTime = PHASES.length * PHASE_SECONDS;
    const t = elapsed % totalPhaseTime;
    const phaseIndex = Math.floor(t / PHASE_SECONDS);
    if (phaseIndex !== currentPhaseIndex) {
      currentPhaseIndex = phaseIndex;
      applyPhase(phaseIndex);
    }
  }

  applyPhase(0);
  return { update };
}
