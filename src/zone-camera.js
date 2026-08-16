import * as THREE from "three";

// Reusable per-zone fixed-camera-anchor system, scoped to the village only.
// Each zone owns a fixed {position, lookAt} anchor; whichever zone contains
// the player's (x,z) wins (checked in list order, most-specific first) and
// the camera holds at that anchor regardless of small player movement.
// A `zones` list entry with `contains` returning false for everywhere is
// how the caller opts a whole region out (e.g. outside the town) — pass
// `fallback(playerPos)` to compute a live position/lookAt (a normal follow
// camera) for whenever no zone contains the player, so this same system
// keeps working as more zones are added later without touching main.js.
//
// On any change of active zone (including into/out of the fallback),
// position and look-at both smoothly lerp from wherever the camera
// currently is to the new target over `transitionDuration` seconds — no
// hard cuts. While the fallback is active the *target* itself may keep
// moving (it's a live follow cam), so the transition eases toward a moving
// point rather than a fixed one, then tracks it normally once settled.
export function createZoneCamera(camera, zones, { transitionDuration = 0.8 } = {}) {
  let activeZone = null; // null = fallback (e.g. follow-cam outside the village)
  let t = 1; // 1 = settled (no transition in progress)
  const fromPos = new THREE.Vector3();
  const fromLook = new THREE.Vector3();
  const curLook = new THREE.Vector3();
  const desiredPos = new THREE.Vector3();
  const desiredLook = new THREE.Vector3();

  function pickZone(x, z) {
    for (const zone of zones) {
      if (zone.contains(x, z)) return zone;
    }
    return null;
  }

  function ease(x) {
    return x * x * (3 - 2 * x); // smoothstep
  }

  return {
    update(dt, playerPos, fallback) {
      const zone = pickZone(playerPos.x, playerPos.z);
      if (zone !== activeZone) {
        fromPos.copy(camera.position);
        fromLook.copy(curLook);
        activeZone = zone;
        t = 0;
      }

      if (activeZone) {
        desiredPos.copy(activeZone.anchor.position);
        desiredLook.copy(activeZone.anchor.lookAt);
      } else {
        const live = fallback(playerPos);
        desiredPos.copy(live.position);
        desiredLook.copy(live.lookAt);
      }

      if (t < 1) {
        t = Math.min(1, t + dt / transitionDuration);
        const a = ease(t);
        camera.position.lerpVectors(fromPos, desiredPos, a);
        curLook.lerpVectors(fromLook, desiredLook, a);
      } else {
        camera.position.copy(desiredPos);
        curLook.copy(desiredLook);
      }
      camera.lookAt(curLook);
    },
  };
}
