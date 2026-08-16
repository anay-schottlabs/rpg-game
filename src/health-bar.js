// Built from Kenney's UI Pack: RPG Expansion (CC0) — 3-slice bar sprites
// (left cap / stretchy mid / right cap) matching the pixel-art fantasy style
// of the rest of the kits already in this project.
const SPRITE_BASE = `${import.meta.env.BASE_URL}assets/ui-pack-rpg-expansion/PNG/`;
const SPRITE_HEIGHT = 18; // native pixel height of the bar sprites
const SPRITE_CAP_WIDTH = 9; // native pixel width of the left/right cap sprites

const SCALE = 1.6;
const BAR_WIDTH = 220;
const BAR_HEIGHT = Math.round(SPRITE_HEIGHT * SCALE);
const CAP_WIDTH = Math.round(SPRITE_CAP_WIDTH * SCALE);

// One left-cap/stretchy-mid/right-cap row for a given bar color ("Back",
// "Red", "Green", ...) — used for both the static frame and the fill.
function buildBarRow(colorName, width) {
  const row = document.createElement("div");
  row.style.cssText = `
    display: flex;
    width: ${width}px;
    height: ${BAR_HEIGHT}px;
    image-rendering: pixelated;
  `;

  const capStyle = `width: ${CAP_WIDTH}px; height: ${BAR_HEIGHT}px; display: block; image-rendering: pixelated; flex: none;`;
  const left = document.createElement("img");
  left.src = `${SPRITE_BASE}bar${colorName}_horizontalLeft.png`;
  left.style.cssText = capStyle;

  const mid = document.createElement("img");
  mid.src = `${SPRITE_BASE}bar${colorName}_horizontalMid.png`;
  mid.style.cssText = `flex: 1 1 auto; min-width: 0; height: ${BAR_HEIGHT}px; display: block; image-rendering: pixelated;`;

  const right = document.createElement("img");
  right.src = `${SPRITE_BASE}bar${colorName}_horizontalRight.png`;
  right.style.cssText = capStyle;

  row.append(left, mid, right);
  return row;
}

export function createHealthBar({ max = 100, color = "Red" } = {}) {
  const container = document.createElement("div");
  // barBack_* turns out to be a near-transparent inner-shadow overlay (checked
  // its actual pixels — ~10% alpha), not an opaque panel on its own, so a
  // solid backing goes behind it or the drained portion of the bar would
  // just show the 3D scene through it.
  container.style.cssText = `
    position: fixed;
    top: 16px;
    left: 16px;
    width: ${BAR_WIDTH}px;
    height: ${BAR_HEIGHT}px;
    z-index: 10;
    background: rgba(20, 16, 12, 0.55);
    border-radius: ${BAR_HEIGHT / 2}px;
  `;

  container.appendChild(buildBarRow("Back", BAR_WIDTH));

  // The fill row is a fixed BAR_WIDTH — it's the clip window around it that
  // shrinks with health, so the bar drains from the right while its left
  // cap stays anchored in place instead of the whole row rescaling.
  const fillClip = document.createElement("div");
  fillClip.style.cssText = `
    position: absolute;
    inset: 0;
    width: ${BAR_WIDTH}px;
    overflow: hidden;
    transition: width 0.2s ease-out;
  `;
  fillClip.appendChild(buildBarRow(color, BAR_WIDTH));
  container.appendChild(fillClip);

  document.body.appendChild(container);

  let current = max;

  function setHealth(value) {
    current = Math.max(0, Math.min(max, value));
    fillClip.style.width = `${(current / max) * BAR_WIDTH}px`;
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
