// --- Setup ---------------------------------------------------------------

const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// --- Input -----------------------------------------------------------------

const keys = {
  w: false,
  a: false,
  s: false,
  d: false,
};

window.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();
  if (key in keys) keys[key] = true;
});

window.addEventListener("keyup", (e) => {
  const key = e.key.toLowerCase();
  if (key in keys) keys[key] = false;
});

// --- World -----------------------------------------------------------------

const WORLD_WIDTH = 2000;
const WORLD_HEIGHT = 2000;

// Static forest decoration, generated once so trees don't jump around each frame.
function pickTreeType() {
  const r = Math.random();
  if (r < 0.7) return "common";
  if (r < 0.92) return "elder";
  return "dead";
}

const trees = [];
for (let i = 0; i < 150; i++) {
  trees.push({
    x: Math.random() * WORLD_WIDTH,
    y: Math.random() * WORLD_HEIGHT,
    type: pickTreeType(),
    scale: 0.75 + Math.random() * 0.55,
  });
}

// --- Player ------------------------------------------------------------------

class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 14;
    this.speed = 220; // pixels per second
    this.facing = "down";
    this.color = "#e0b64a";
  }

  update(dt) {
    let dx = 0;
    let dy = 0;

    if (keys.w) dy -= 1;
    if (keys.s) dy += 1;
    if (keys.a) dx -= 1;
    if (keys.d) dx += 1;

    if (dx !== 0 || dy !== 0) {
      // Normalize so diagonal movement isn't faster.
      const len = Math.hypot(dx, dy);
      dx /= len;
      dy /= len;

      this.x += dx * this.speed * dt;
      this.y += dy * this.speed * dt;

      if (Math.abs(dx) > Math.abs(dy)) {
        this.facing = dx > 0 ? "right" : "left";
      } else {
        this.facing = dy > 0 ? "down" : "up";
      }
    }

    this.x = Math.max(this.radius, Math.min(WORLD_WIDTH - this.radius, this.x));
    this.y = Math.max(this.radius, Math.min(WORLD_HEIGHT - this.radius, this.y));
  }

  draw(ctx, camera) {
    const screenX = this.x - camera.x;
    const screenY = this.y - camera.y;

    // Shadow
    ctx.beginPath();
    ctx.ellipse(screenX, screenY + this.radius * 0.7, this.radius * 0.8, this.radius * 0.35, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.fill();

    // Body
    ctx.beginPath();
    ctx.arc(screenX, screenY, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.strokeStyle = "#5a3d1c";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Facing indicator
    ctx.beginPath();
    const dirOffsets = {
      up: [0, -1],
      down: [0, 1],
      left: [-1, 0],
      right: [1, 0],
    };
    const [ox, oy] = dirOffsets[this.facing];
    ctx.arc(screenX + ox * this.radius * 0.6, screenY + oy * this.radius * 0.6, 3, 0, Math.PI * 2);
    ctx.fillStyle = "#3a2a10";
    ctx.fill();
  }
}

const player = new Player(WORLD_WIDTH / 2, WORLD_HEIGHT / 2);

// --- Camera ------------------------------------------------------------------

const camera = { x: 0, y: 0 };

function updateCamera() {
  camera.x = player.x - canvas.width / 2;
  camera.y = player.y - canvas.height / 2;
}

// --- Rendering ---------------------------------------------------------------

function drawGround() {
  ctx.fillStyle = "#2e5c2e";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawTree(tree, camera) {
  const { width: baseWidth, height: baseHeight, groundFraction } = ForestAssets.TREE_VIEWBOX;
  const width = baseWidth * tree.scale;
  const height = baseHeight * tree.scale;

  const screenX = tree.x - camera.x;
  const screenY = tree.y - camera.y;

  if (
    screenX < -width || screenX > canvas.width + width ||
    screenY < -height || screenY > canvas.height + height
  ) {
    return; // cull off-screen trees
  }

  // Shadow at the trunk base
  ctx.beginPath();
  ctx.ellipse(screenX, screenY, width * 0.22, height * 0.05, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
  ctx.fill();

  const img = ForestAssets.trees[tree.type];
  if (img.complete && img.naturalWidth > 0) {
    ctx.drawImage(img, screenX - width / 2, screenY - height * groundFraction, width, height);
  }
}

// --- Game loop -----------------------------------------------------------------

let lastTime = performance.now();

function loop(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.05); // clamp for tab-switch stalls
  lastTime = now;

  player.update(dt);
  updateCamera();

  drawGround();

  // Depth-sort trees and the player by ground position so the player can
  // walk in front of or behind a tree canopy convincingly.
  const drawables = [
    ...trees.map((tree) => ({ y: tree.y, draw: () => drawTree(tree, camera) })),
    { y: player.y, draw: () => player.draw(ctx, camera) },
  ];
  drawables.sort((a, b) => a.y - b.y);
  for (const item of drawables) item.draw();

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
