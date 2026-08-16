import { joinRoom, selfId } from "trystero";

// Trystero's default strategy (Nostr relays) — zero config, no signup/API
// keys, same spirit as the old "torrent" strategy but that one now needs a
// separate package in this Trystero version.
const APP_ID = "rpg-game-mage-arena";

export { selfId };

// Thin wrapper around a Trystero room: four named channels (state/cast/hit/
// death/respawn) plus peer join/leave. Callbacks are plain properties you
// assign after calling createNetwork() — see main.js for usage.
export function createNetwork() {
  let room = null;
  const actions = {};
  const handlers = {
    onPeerJoin: null,
    onPeerLeave: null,
    onState: null,
    onCast: null,
    onHit: null,
    onDeath: null,
    onRespawn: null,
  };

  function connect(roomId) {
    disconnect();
    room = joinRoom({ appId: APP_ID }, roomId);

    actions.state = room.makeAction("state");
    actions.cast = room.makeAction("cast");
    actions.hit = room.makeAction("hit");
    actions.death = room.makeAction("death");
    actions.respawn = room.makeAction("respawn");

    actions.state.onMessage = (data, context) => handlers.onState?.(data, context.peerId);
    actions.cast.onMessage = (data, context) => handlers.onCast?.(data, context.peerId);
    actions.hit.onMessage = (data, context) => handlers.onHit?.(data, context.peerId);
    actions.death.onMessage = (data, context) => handlers.onDeath?.(data, context.peerId);
    actions.respawn.onMessage = (data, context) => handlers.onRespawn?.(data, context.peerId);

    room.onPeerJoin = (peerId) => handlers.onPeerJoin?.(peerId);
    room.onPeerLeave = (peerId) => handlers.onPeerLeave?.(peerId);
  }

  function disconnect() {
    if (room) room.leave();
    room = null;
  }

  function sendState(data) {
    actions.state?.send(data);
  }

  function sendCast(data) {
    actions.cast?.send(data);
  }

  function sendHit(peerId, data) {
    actions.hit?.send(data, { target: peerId });
  }

  function sendDeath(data) {
    actions.death?.send(data);
  }

  function sendRespawn(data) {
    actions.respawn?.send(data);
  }

  return {
    connect,
    disconnect,
    sendState,
    sendCast,
    sendHit,
    sendDeath,
    sendRespawn,
    get connected() {
      return room !== null;
    },
    get peerIds() {
      return room ? Object.keys(room.getPeers()) : [];
    },
    set onPeerJoin(cb) {
      handlers.onPeerJoin = cb;
    },
    set onPeerLeave(cb) {
      handlers.onPeerLeave = cb;
    },
    set onState(cb) {
      handlers.onState = cb;
    },
    set onCast(cb) {
      handlers.onCast = cb;
    },
    set onHit(cb) {
      handlers.onHit = cb;
    },
    set onDeath(cb) {
      handlers.onDeath = cb;
    },
    set onRespawn(cb) {
      handlers.onRespawn = cb;
    },
  };
}
