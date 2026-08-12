// DOM wiring for the campfire menu (Host/Join). Pure UI glue — all the
// actual networking lives behind Multiplayer (js/multiplayer/multiplayer.js);
// this file never touches Trystero or game state directly, only
// window.startGame() (game.js) and Multiplayer's public methods.
//
// js/game.js owns *when* the menu is shown (F while near the campfire); this
// file owns what's inside it and reacts to it opening/closing.

const JOIN_TIMEOUT_MS = 15000;

const lobbyEl = document.getElementById("lobby");
const closeBtn = document.getElementById("lobby-close-btn");
const hostBtn = document.getElementById("lobby-host-btn");
const joinBtn = document.getElementById("lobby-join-btn");
const joinInput = document.getElementById("lobby-join-code");
const codeDisplay = document.getElementById("lobby-code-display");
const statusEl = document.getElementById("lobby-status");
const connectFormEl = document.getElementById("lobby-connect-form");
const connectedStatusEl = document.getElementById("lobby-connected-status");
const connectedCodeEl = document.getElementById("lobby-connected-code");
const connectedCountEl = document.getElementById("lobby-connected-count");
const badgeEl = document.getElementById("session-badge");
const badgeCodeEl = document.getElementById("session-badge-code");
const badgeCountEl = document.getElementById("session-badge-count");
const hostDisconnectedEl = document.getElementById("host-disconnected");

// The game plays immediately in solo mode by default, and this must not
// depend on Trystero/multiplayer loading successfully — a flaky CDN, an ad
// blocker, or no internet at all should degrade to "solo only," never break
// the game outright. So this import is dynamic and failure-tolerant, loaded
// *after* solo play has already started, not a static top-of-file import.
window.startGame();

let Multiplayer = null;
import("./multiplayer/multiplayer.js")
  .then((mod) => {
    Multiplayer = mod.Multiplayer;
  })
  .catch((err) => {
    console.warn("Multiplayer unavailable — solo play is unaffected.", err);
    hostBtn.disabled = true;
    joinBtn.disabled = true;
    statusEl.textContent = "Multiplayer isn't available right now — solo play still works.";
  });

function closeMenu() {
  lobbyEl.classList.add("lobby-hidden");
}

function refreshMenuView() {
  const connected = Multiplayer && Multiplayer.mode !== "solo";
  connectFormEl.classList.toggle("hidden", connected);
  connectedStatusEl.classList.toggle("hidden", !connected);
  if (connected) {
    connectedCodeEl.textContent = Multiplayer.roomCode;
    connectedCountEl.textContent = String(Multiplayer.playerCount);
  }
}

// game.js toggles #lobby's own visibility directly (it's the one that knows
// the player's distance to the campfire); react to that rather than owning
// when the menu opens.
new MutationObserver(() => {
  if (!lobbyEl.classList.contains("lobby-hidden")) refreshMenuView();
}).observe(lobbyEl, { attributes: true, attributeFilter: ["class"] });

function showSessionBadge() {
  badgeEl.classList.remove("hidden");
  badgeCodeEl.textContent = Multiplayer.roomCode;
  badgeCountEl.textContent = String(Multiplayer.playerCount);
  setInterval(() => {
    badgeCountEl.textContent = String(Multiplayer.playerCount);
  }, 1000);
}

hostBtn.addEventListener("click", () => {
  if (!Multiplayer) return;
  const code = Multiplayer.hostGame();
  codeDisplay.textContent = code;
  codeDisplay.classList.remove("hidden");
  statusEl.textContent = "Share this code with friends. Close this menu (F or Esc) when ready.";
  showSessionBadge();
});

joinBtn.addEventListener("click", async () => {
  if (!Multiplayer) return;
  const code = joinInput.value.trim().toUpperCase();
  if (!code) return;

  statusEl.textContent = "Connecting...";
  joinBtn.disabled = true;

  // Trystero has no concept of an "invalid" room code — any code is just an
  // ad-hoc room name, so a typo'd code silently waits for a host that will
  // never appear. Time out rather than hang the UI forever.
  const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), JOIN_TIMEOUT_MS));

  try {
    await Promise.race([Multiplayer.joinGame(code), timeout]);
    statusEl.textContent = "";
    joinBtn.disabled = false;
    closeMenu();
    showSessionBadge();
  } catch (err) {
    statusEl.textContent = "No host found at that code. Check it and try again.";
    joinBtn.disabled = false;
  }
});

closeBtn.addEventListener("click", closeMenu);

joinInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") joinBtn.click();
});

// A tiny UI status readout — polling is simpler than plumbing a callback
// through Multiplayer for something this infrequent and non-critical.
setInterval(() => {
  if (Multiplayer && Multiplayer.isHostDisconnected()) {
    hostDisconnectedEl.classList.remove("hidden");
  }
}, 500);
