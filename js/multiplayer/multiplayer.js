// Facade — the ONLY multiplayer module game.js (a classic script) or
// lobby.js talks to. Picks host vs peer vs solo and dispatches to the
// right HOST-ONLY or PEER-ONLY module below; callers don't need to know
// which mode is active.
import * as Room from "./room.js";
import * as HostSim from "./host-sim.js";
import * as PeerSync from "./peer-sync.js";

let roomHandle = null;

const Multiplayer = {
  mode: "solo", // "solo" | "host" | "peer"
  roomCode: null,
  playerCount: 1,

  hostGame() {
    roomHandle = Room.host();
    this.mode = "host";
    this.roomCode = roomHandle.code;
    this.playerCount = 1;

    // Picking the seed itself is the one random call in this whole flow
    // that's allowed to be "real" randomness (window.RNG.seed reseeds
    // everything world-generation-related from this point on).
    const seed = Math.floor(Math.random() * 2 ** 31);
    window.RNG.seed(seed);
    window.startGame();

    HostSim.init(roomHandle);
    roomHandle.onPeerJoin((peerId) => {
      HostSim.addPeer(peerId, window.campfire);
      roomHandle.sendSeed(seed, peerId);
      this.playerCount++;
    });
    roomHandle.onPeerLeave((peerId) => {
      HostSim.removePeer(peerId);
      this.playerCount = Math.max(1, this.playerCount - 1);
    });

    return roomHandle.code;
  },

  joinGame(code) {
    return new Promise((resolve) => {
      roomHandle = Room.join(code);
      this.mode = "peer";
      this.roomCode = code;

      roomHandle.onSeed((seed) => {
        window.RNG.seed(seed);
        window.startGame();
        PeerSync.init(roomHandle, roomHandle.selfId);
        resolve();
      });
    });
  },

  update(dt) {
    if (this.mode === "host") {
      HostSim.update(dt, window.player, roomHandle.selfId);
    } else if (this.mode === "peer") {
      PeerSync.update(dt);
    }
  },

  getRemotePlayers() {
    if (this.mode === "host") return HostSim.getRenderPlayers();
    if (this.mode === "peer") return PeerSync.getRemotePlayers(performance.now());
    return [];
  },

  getLocalOverride() {
    return this.mode === "peer" ? PeerSync.getLocalOverride(performance.now()) : null;
  },

  isHostDisconnected() {
    return this.mode === "peer" && PeerSync.isHostDisconnected();
  },
};

// game.js is a classic script and can only see true globals, not this
// module's own top-level bindings — so this facade publishes itself
// explicitly. See the window.keys comment in game.js for the other half
// of this bridge.
window.Multiplayer = Multiplayer;

export { Multiplayer };
