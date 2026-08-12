// Trystero boundary — the ONLY file in this codebase that talks to Trystero
// directly. Everything else (host-sim.js, peer-sync.js, multiplayer.js)
// goes through the plain handle object returned by host()/join() below, so
// swapping signaling strategies later only ever touches this one file.
//
// Using the "torrent" strategy: WebRTC signaling over public BitTorrent
// trackers, which is what makes this genuinely serverless (no app backend
// of any kind, just peers finding each other through existing public
// infrastructure). Loaded straight from a CDN since this project has no
// build step — see index.html. Trystero split its per-strategy builds into
// scoped packages (the old "trystero/torrent" subpath now just throws a
// deprecation error pointing here).
import { joinRoom, selfId } from "https://esm.sh/@trystero-p2p/torrent";

// Namespaces this app's rooms away from other Trystero apps using the same
// trackers. Room codes only need to be unique within this namespace.
const APP_ID = "forest-rpg-boilerplate";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I — easy to read aloud

function randomRoomCode(length = 5) {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return code;
}

// Wraps a raw Trystero room into the flat handle shape every other
// multiplayer module uses, so nobody else needs to know Trystero's
// makeAction/onPeerJoin API shapes directly.
function buildHandle(code, trysteroRoom) {
  const [sendInput, onInput] = trysteroRoom.makeAction("input");
  const [sendState, onState] = trysteroRoom.makeAction("state");
  const [sendSeed, onSeed] = trysteroRoom.makeAction("seed");

  return {
    code,
    selfId,
    onPeerJoin: trysteroRoom.onPeerJoin,
    onPeerLeave: trysteroRoom.onPeerLeave,
    sendInput,
    onInput,
    sendState,
    onState,
    sendSeed,
    onSeed,
    leave: () => trysteroRoom.leave(),
  };
}

function host() {
  const code = randomRoomCode();
  return buildHandle(code, joinRoom({ appId: APP_ID }, code));
}

function join(code) {
  return buildHandle(code, joinRoom({ appId: APP_ID }, code));
}

export { host, join, selfId };
