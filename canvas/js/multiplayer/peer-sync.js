// PEER-ONLY. Every export here only ever runs in tabs that joined via a
// room code — multiplayer.js only calls into this module when
// Multiplayer.mode === "peer". Sends local input to the host, and buffers/
// interpolates the host's state broadcasts so every rendered player —
// including our own avatar, per the "strict host authority" design — moves
// smoothly despite updates arriving at ~15Hz rather than every frame.

const INTERP_DELAY_MS = 100; // deliberate render lag behind the latest snapshot, smooths over jitter
const HEARTBEAT_INTERVAL_MS = 150; // resend input even if unchanged, in case a packet was lost

const buffers = new Map(); // peerId -> up to 2 most recent {t, x, y, facingX, facingY, isCasting, isDashing, color}

let roomHandle = null;
let selfId = null;
let hostPeerId = null;
let hostDisconnected = false;
let lastSentInput = null;
let heartbeatAccumulatorMs = 0;

function init(room, id) {
  roomHandle = room;
  selfId = id;
  hostPeerId = null;
  hostDisconnected = false;
  buffers.clear();

  room.onState(({ t, players }, fromPeerId) => {
    // Trystero has no built-in notion of "host" — a room is just a mesh of
    // peers. We treat whoever sends `state` messages as the host, since
    // only host-sim.js ever calls sendState.
    if (hostPeerId === null) hostPeerId = fromPeerId;
    if (fromPeerId !== hostPeerId) return;

    for (const [peerId, snap] of Object.entries(players)) {
      let buf = buffers.get(peerId);
      if (!buf) {
        buf = [];
        buffers.set(peerId, buf);
      }
      buf.push({ t, ...snap });
      if (buf.length > 2) buf.shift();
    }
  });

  room.onSeed((_seed, fromPeerId) => {
    if (hostPeerId === null) hostPeerId = fromPeerId;
  });

  room.onPeerLeave((peerId) => {
    if (peerId === hostPeerId) hostDisconnected = true;
    buffers.delete(peerId);
  });
}

function update(dt) {
  if (hostDisconnected) return;

  const k = window.keys;
  const input = {
    dx: (k.d ? 1 : 0) - (k.a ? 1 : 0),
    dy: (k.s ? 1 : 0) - (k.w ? 1 : 0),
    e: k.shift,
  };

  heartbeatAccumulatorMs += dt * 1000;
  const changed =
    !lastSentInput ||
    input.dx !== lastSentInput.dx ||
    input.dy !== lastSentInput.dy ||
    input.e !== lastSentInput.e;

  if (changed || heartbeatAccumulatorMs >= HEARTBEAT_INTERVAL_MS) {
    heartbeatAccumulatorMs = 0;
    lastSentInput = input;
    roomHandle.sendInput(input);
  }
}

// Linearly interpolates every known player's last two snapshots to the
// render time `now - INTERP_DELAY_MS`, falling back to the latest snapshot
// if only one exists yet (just joined) or the two are too far apart.
function interpolateAll(now) {
  const renderTime = now - INTERP_DELAY_MS;
  const out = [];

  for (const [peerId, buf] of buffers) {
    if (buf.length === 0) continue;

    let snap;
    if (buf.length === 1) {
      snap = buf[0];
    } else {
      const [a, b] = buf;
      const span = b.t - a.t;
      const t = span > 0 ? Math.min(1, Math.max(0, (renderTime - a.t) / span)) : 1;
      snap = {
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t,
        facingX: b.facingX,
        facingY: b.facingY,
        isCasting: b.isCasting,
        isDashing: b.isDashing,
        color: b.color,
      };
    }
    out.push({ id: peerId, ...snap });
  }
  return out;
}

function getRemotePlayers(now) {
  return interpolateAll(now).filter((p) => p.id !== selfId);
}

function getLocalOverride(now) {
  return interpolateAll(now).find((p) => p.id === selfId) || null;
}

function isHostDisconnected() {
  return hostDisconnected;
}

export { init, update, getRemotePlayers, getLocalOverride, isHostDisconnected };
