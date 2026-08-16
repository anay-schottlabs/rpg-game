// A plain HTML/CSS HUD element rather than a 3D mesh — crisper text,
// no render/composer involvement, and it never has to worry about camera
// perspective or occlusion.
export function createHealthBar({ max = 100 } = {}) {
  const container = document.createElement("div");
  container.style.cssText = `
    position: fixed;
    top: 16px;
    left: 16px;
    width: 220px;
    height: 24px;
    background: rgba(0, 0, 0, 0.45);
    border: 2px solid rgba(255, 255, 255, 0.65);
    border-radius: 6px;
    overflow: hidden;
    z-index: 10;
    font-family: sans-serif;
  `;

  const fill = document.createElement("div");
  fill.style.cssText = `
    height: 100%;
    width: 100%;
    background: linear-gradient(180deg, #ff6b6b, #d32f2f);
    transition: width 0.2s ease-out, background 0.2s ease-out;
  `;
  container.appendChild(fill);

  const label = document.createElement("div");
  label.style.cssText = `
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 12px;
    font-weight: bold;
    letter-spacing: 0.02em;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
    pointer-events: none;
  `;
  container.appendChild(label);

  document.body.appendChild(container);

  let current = max;

  function setHealth(value) {
    current = Math.max(0, Math.min(max, value));
    const ratio = current / max;
    fill.style.width = `${ratio * 100}%`;
    fill.style.background =
      ratio <= 0.25 ? "linear-gradient(180deg, #ff8a65, #b71c1c)" : "linear-gradient(180deg, #ff6b6b, #d32f2f)";
    label.textContent = `${Math.round(current)} / ${max}`;
  }

  setHealth(max);

  return {
    setHealth,
    damage: (amount) => setHealth(current - amount),
    heal: (amount) => setHealth(current + amount),
    get value() {
      return current;
    },
    get max() {
      return max;
    },
  };
}
