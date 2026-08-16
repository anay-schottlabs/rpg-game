import { clone as cloneSkinned } from "three/addons/utils/SkeletonUtils.js";

const POSITION_SMOOTH_RATE = 12; // per second — how fast position eases toward the latest network sample
const ROTATION_SMOOTH_RATE = 12;
const HEALTH_BAR_HEIGHT = 1.15; // above the avatar's local origin (feet)

function angleLerpStep(current, target, rate, dt) {
  let diff = (target - current) % (Math.PI * 2);
  if (diff > Math.PI) diff -= Math.PI * 2;
  if (diff < -Math.PI) diff += Math.PI * 2;
  return current + diff * (1 - Math.exp(-rate * dt));
}

function createHealthSprite(THREE) {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 16;
  const ctx = canvas.getContext("2d");
  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture, depthTest: false, transparent: true });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(0.8, 0.1, 1);
  sprite.renderOrder = 999;

  function draw(ratio) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = ratio > 0.25 ? "#ff6b6b" : "#ff3b3b";
    ctx.fillRect(2, 2, (canvas.width - 4) * Math.max(0, ratio), canvas.height - 4);
    texture.needsUpdate = true;
  }
  draw(1);

  return { sprite, draw, dispose: () => { texture.dispose(); material.dispose(); } };
}

// One avatar for a connected peer — cloned from the same GLTF the local
// player uses (via SkeletonUtils.clone, same technique as the dash
// afterimage trail in dash-effects.js) so no extra network fetch is needed.
// Geometry/materials are SHARED with the template (SkeletonUtils.clone only
// deep-clones the node/skeleton hierarchy) — dispose() must not touch them,
// only the resources this module actually created itself (the health
// sprite's own canvas texture + material).
//
// Position/rotation smoothly interpolate toward the latest network sample
// rather than snapping, since state updates only arrive ~15/s.
export function createRemotePlayer({ THREE, scene, gltfTemplate, scale }) {
  const object3D = cloneSkinned(gltfTemplate.scene);
  object3D.scale.setScalar(scale);
  object3D.traverse((node) => {
    if (node.isMesh) node.castShadow = true;
  });
  scene.add(object3D);

  const mixer = new THREE.AnimationMixer(object3D);
  const actions = {};
  const clipNames = {
    idle: "Idle",
    walk: "Walking_A",
    death: "Death_A",
    shockwave: "1H_Melee_Attack_Chop",
    stoneEdge: "Spellcast_Raise",
  };
  for (const [key, clipName] of Object.entries(clipNames)) {
    const clip = THREE.AnimationClip.findByName(gltfTemplate.animations, clipName);
    if (!clip) continue;
    const action = mixer.clipAction(clip);
    if (key === "death" || key === "shockwave" || key === "stoneEdge") {
      action.setLoop(THREE.LoopOnce);
      action.clampWhenFinished = true;
    }
    actions[key] = action;
  }

  let currentAction = actions.idle ?? null;
  currentAction?.play();

  function setAction(name) {
    const next = actions[name];
    if (!next || currentAction === next) return;
    currentAction?.fadeOut(0.15);
    next.reset().fadeIn(0.15).play();
    currentAction = next;
  }

  const healthBarOffset = new THREE.Vector3(0, HEALTH_BAR_HEIGHT, 0);
  const health = createHealthSprite(THREE);
  scene.add(health.sprite);

  const targetPos = object3D.position.clone();
  let targetRotY = 0;

  function setTargetTransform(pos, rotY) {
    targetPos.set(pos[0], pos[1], pos[2]);
    targetRotY = rotY;
  }

  function update(dt) {
    object3D.position.lerp(targetPos, 1 - Math.exp(-POSITION_SMOOTH_RATE * dt));
    object3D.rotation.y = angleLerpStep(object3D.rotation.y, targetRotY, ROTATION_SMOOTH_RATE, dt);
    mixer.update(dt);
    health.sprite.position.copy(object3D.position).add(healthBarOffset);
  }

  function setHealthRatio(ratio) {
    health.draw(ratio);
  }

  // dash has no dedicated clip here (the walk pose already reads fine for a
  // quick reposition) — only the two attack spells get a played animation.
  function playCastAnimation(type) {
    if (type === "shockwave") setAction("shockwave");
    else if (type === "stoneEdge") setAction("stoneEdge");
  }

  function playDeath() {
    setAction("death");
  }

  function playRespawn() {
    setAction("idle");
  }

  function dispose() {
    scene.remove(object3D);
    scene.remove(health.sprite);
    health.dispose();
  }

  return {
    object3D,
    setTargetTransform,
    update,
    setAction,
    setHealthRatio,
    playCastAnimation,
    playDeath,
    playRespawn,
    dispose,
  };
}
