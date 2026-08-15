// HOST-ONLY. Every export here only ever runs in the browser tab that
// clicked "Host Game" — multiplayer.js only calls into this module when
// Multiplayer.mode === "host". It owns the authoritative position of every
// *remote* player; the host's own player is simulated directly by the
// normal Player.update() in game.js (unchanged, zero lag, since the host
// tab *is* the source of truth) and just gets folded into the broadcast
// snapshot here.

const BROADCAST_INTERVAL_MS = 1000 / 15; // ~15Hz, per the 10-20Hz target
const INPUT_TIMEOUT_MS = 500; // stop moving a peer if we haven't heard from them

const NEUTRAL_INPUT = { dx: 0, dy: 0, e: false };
const COLORS = ["#7fb0d8", "#8fc48a", "#d88fc4", "#c48a5c", "#a08fd8", "#e0d060"];

const remotePlayers = new Map(); // peerId -> simulation state (same shape simulatePlayerMovement expects)

let roomHandle = null;
let broadcastAccumulatorMs = 0;
let nextColorIndex = 0;

function addPeer(peerId, campfire) {
  // A one-time spawn position the host decides and then broadcasts — this
  // does NOT need to come from the seeded RNG (that's only for world
  // generation, which must be independently reproducible on every client;
  // this value is computed once, here, and transmitted, never recomputed).
  const jitter = 40;
  remotePlayers.set(peerId, {
    x: campfire.x + (Math.random() - 0.5) * jitter,
    y: campfire.y + 110 + (Math.random() - 0.5) * jitter,
    facingX: 0,
    facingY: 1,
    dashTimeLeft: 0,
    isCasting: false,
    color: COLORS[nextColorIndex++ % COLORS.length],
    lastInput: NEUTRAL_INPUT,
    lastSeenAt: performance.now(),
  });
}

function removePeer(peerId) {
  remotePlayers.delete(peerId);
}

function init(room) {
  roomHandle = room;
  room.onInput((input, peerId) => {
    const p = remotePlayers.get(peerId);
    if (!p) return; // input arrived before/after this peer's join/leave bookkeeping
    p.lastInput = input;
    p.lastSeenAt = performance.now();
  });
}

function update(dt, localPlayer, localPeerId) {
  const now = performance.now();

  for (const p of remotePlayers.values()) {
    const input = now - p.lastSeenAt > INPUT_TIMEOUT_MS ? NEUTRAL_INPUT : p.lastInput;
    // Same physics as the local player, every frame — not just at the
    // broadcast rate — so remote players move smoothly on the host's own
    // screen too; broadcasting below just samples this at a lower rate.
    window.simulatePlayerMovement(p, input, dt);
  }

  broadcastAccumulatorMs += dt * 1000;
  if (broadcastAccumulatorMs >= BROADCAST_INTERVAL_MS) {
    broadcastAccumulatorMs = 0;
    broadcast(localPlayer, localPeerId);
  }
}

function snapshot(p) {
  return {
    x: p.x,
    y: p.y,
    facingX: p.facingX,
    facingY: p.facingY,
    isCasting: p.isCasting,
    isDashing: p.dashTimeLeft > 0,
    color: p.color || "#e0b64a",
  };
}

function broadcast(localPlayer, localPeerId) {
  const players = { [localPeerId]: snapshot(localPlayer) };
  for (const [peerId, p] of remotePlayers) players[peerId] = snapshot(p);
  roomHandle.sendState({ t: performance.now(), players });
}

function getRenderPlayers() {
  const out = [];
  for (const [peerId, p] of remotePlayers) {
    out.push({ id: peerId, ...snapshot(p) });
  }
  return out;
}

export { init, addPeer, removePeer, update, getRenderPlayers };
