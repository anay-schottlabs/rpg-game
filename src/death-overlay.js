// Plain DOM "You Died" overlay with a respawn countdown — same inline-style
// approach as health-bar.js. main.js drives show()/hide() explicitly rather
// than this module managing its own respawn timing.
export function createDeathOverlay() {
  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(80, 0, 0, 0.35);
    display: none;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    z-index: 90;
    font-family: sans-serif;
    pointer-events: none;
  `;

  const title = document.createElement("div");
  title.textContent = "You Died";
  title.style.cssText = `
    font-size: 42px;
    font-weight: bold;
    color: #ff4444;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
    letter-spacing: 0.05em;
  `;

  const subtitle = document.createElement("div");
  subtitle.style.cssText = "font-size: 16px; color: #fff; margin-top: 10px; text-shadow: 0 1px 4px rgba(0, 0, 0, 0.8);";

  overlay.append(title, subtitle);
  document.body.appendChild(overlay);

  let countdownInterval = null;

  function show(seconds) {
    overlay.style.display = "flex";
    let remaining = seconds;
    subtitle.textContent = `Respawning in ${remaining}...`;
    clearInterval(countdownInterval);
    countdownInterval = setInterval(() => {
      remaining -= 1;
      if (remaining > 0) subtitle.textContent = `Respawning in ${remaining}...`;
      else clearInterval(countdownInterval);
    }, 1000);
  }

  function hide() {
    clearInterval(countdownInterval);
    overlay.style.display = "none";
  }

  return { show, hide };
}
