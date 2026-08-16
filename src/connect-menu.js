const ROOM_CODE_LENGTH = 6;
const ROOM_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars (0/O, 1/I)

function randomRoomCode() {
  let code = "";
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    code += ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)];
  }
  return code;
}

// Escape-triggered connect/create-room overlay — plain DOM (same inline-style
// approach as health-bar.js, no build step needed). The room code is
// mirrored into location.hash so a link can be shared directly; the input
// pre-fills from the hash on load.
export function createConnectMenu({ onConnect, onDisconnect }) {
  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.65);
    display: none;
    align-items: center;
    justify-content: center;
    z-index: 100;
    font-family: sans-serif;
  `;

  const panel = document.createElement("div");
  panel.style.cssText = `
    background: #1c1c24;
    border: 2px solid #ffdd44;
    border-radius: 10px;
    padding: 24px 28px;
    width: 300px;
    color: #fff;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  `;

  const title = document.createElement("div");
  title.textContent = "Multiplayer";
  title.style.cssText = "font-size: 18px; font-weight: bold; margin-bottom: 14px; color: #ffdd44;";

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Room code";
  input.maxLength = 12;
  input.style.cssText = `
    width: 100%;
    box-sizing: border-box;
    padding: 8px 10px;
    margin-bottom: 10px;
    border-radius: 6px;
    border: 1px solid #555;
    background: #111;
    color: #fff;
    font-size: 14px;
    text-transform: uppercase;
  `;

  function makeButton(label) {
    const btn = document.createElement("button");
    btn.textContent = label;
    btn.style.cssText = `
      flex: 1;
      padding: 8px 0;
      border-radius: 6px;
      border: none;
      background: #ffdd44;
      color: #1c1c24;
      font-weight: bold;
      cursor: pointer;
      font-size: 13px;
    `;
    return btn;
  }

  const buttonRow = document.createElement("div");
  buttonRow.style.cssText = "display: flex; gap: 8px; margin-bottom: 10px;";
  const createButton = makeButton("Create");
  const joinButton = makeButton("Join");
  buttonRow.append(createButton, joinButton);

  const status = document.createElement("div");
  status.style.cssText = "font-size: 13px; color: #ccc; min-height: 18px; margin-bottom: 6px;";

  const leaveButton = document.createElement("button");
  leaveButton.textContent = "Leave room";
  leaveButton.style.cssText = `
    width: 100%;
    padding: 8px 0;
    border-radius: 6px;
    border: 1px solid #aa4444;
    background: transparent;
    color: #ff8888;
    cursor: pointer;
    font-size: 13px;
    margin-top: 6px;
    display: none;
  `;

  const hint = document.createElement("div");
  hint.textContent = "Press Esc to close";
  hint.style.cssText = "font-size: 11px; color: #777; margin-top: 12px; text-align: center;";

  panel.append(title, input, buttonRow, status, leaveButton, hint);
  overlay.appendChild(panel);
  document.body.appendChild(overlay);

  let isOpen = false;
  let connected = false;

  function setConnectedUI(value) {
    connected = value;
    leaveButton.style.display = value ? "block" : "none";
    joinButton.disabled = value;
    createButton.disabled = value;
    input.disabled = value;
  }

  function setStatus(text) {
    status.textContent = text;
  }

  function setPeerCount(n) {
    if (connected) status.textContent = `Connected — ${n} other player${n === 1 ? "" : "s"}`;
  }

  function connectWithCode(code) {
    if (!code) return;
    location.hash = code;
    onConnect(code);
    setConnectedUI(true);
    setStatus("Connecting...");
  }

  joinButton.addEventListener("click", () => connectWithCode(input.value.trim().toUpperCase()));
  createButton.addEventListener("click", () => {
    const code = randomRoomCode();
    input.value = code;
    connectWithCode(code);
  });
  leaveButton.addEventListener("click", () => {
    onDisconnect();
    setConnectedUI(false);
    setStatus("Disconnected");
  });

  // Keep keys typed here from reaching the game's WASD/Shift handlers, but
  // let Escape bubble up so the window-level listener can still close this.
  input.addEventListener("keydown", (e) => {
    if (e.key === "Escape") return;
    e.stopPropagation();
    if (e.key === "Enter") connectWithCode(input.value.trim().toUpperCase());
  });
  input.addEventListener("keyup", (e) => {
    if (e.key !== "Escape") e.stopPropagation();
  });

  if (location.hash.length > 1) {
    input.value = location.hash.slice(1).toUpperCase();
  }

  function open() {
    isOpen = true;
    overlay.style.display = "flex";
  }

  function close() {
    isOpen = false;
    overlay.style.display = "none";
  }

  function toggle() {
    if (isOpen) close();
    else open();
  }

  return {
    open,
    close,
    toggle,
    get isOpen() {
      return isOpen;
    },
    setStatus,
    setPeerCount,
  };
}
