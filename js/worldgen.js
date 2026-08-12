// Placement helpers for scattering decoration across the world. Two
// complementary strategies, meant to be layered together:
//   - scatterPatchy: a smooth noise field gates placement, so density
//     drifts from barren to lush across space instead of being uniform.
//   - scatterClusters: most items land in a handful of loose clumps, with
//     a few solitary stragglers elsewhere.

const WorldGen = (() => {
  function createValueNoise2D() {
    const size = 256;
    const perm = new Uint8Array(size);
    for (let i = 0; i < size; i++) perm[i] = i;
    for (let i = size - 1; i > 0; i--) {
      const j = Math.floor(RNG.random() * (i + 1));
      [perm[i], perm[j]] = [perm[j], perm[i]];
    }

    function hash(x, y) {
      return perm[(perm[x & 255] + y) & 255] / 255;
    }

    function smoothstep(t) {
      return t * t * (3 - 2 * t);
    }

    return function noise2D(x, y) {
      const xi = Math.floor(x);
      const yi = Math.floor(y);
      const xf = x - xi;
      const yf = y - yi;

      const v00 = hash(xi, yi);
      const v10 = hash(xi + 1, yi);
      const v01 = hash(xi, yi + 1);
      const v11 = hash(xi + 1, yi + 1);

      const u = smoothstep(xf);
      const v = smoothstep(yf);

      const top = v00 + u * (v10 - v00);
      const bottom = v01 + u * (v11 - v01);
      return top + v * (bottom - top);
    };
  }

  function scatterPatchy({ worldWidth, worldHeight, attempts, noiseFn, noiseScale, threshold = 0.4 }) {
    const points = [];
    for (let i = 0; i < attempts; i++) {
      const x = RNG.random() * worldWidth;
      const y = RNG.random() * worldHeight;
      const density = noiseFn(x / noiseScale, y / noiseScale);
      if (density < threshold) continue; // barren patch, skip entirely

      // Soft falloff just above the threshold so patch edges thin out
      // gradually instead of cutting off in a hard ring.
      const chance = (density - threshold) / (1 - threshold);
      if (RNG.random() > chance + 0.2) continue;

      points.push({ x, y, density });
    }
    return points;
  }

  function scatterClusters({ worldWidth, worldHeight, clusterCount, itemsPerCluster, clusterRadius, soloCount = 0 }) {
    const points = [];
    for (let c = 0; c < clusterCount; c++) {
      const cx = RNG.random() * worldWidth;
      const cy = RNG.random() * worldHeight;
      const n = itemsPerCluster.min + Math.floor(RNG.random() * (itemsPerCluster.max - itemsPerCluster.min + 1));
      for (let i = 0; i < n; i++) {
        const angle = RNG.random() * Math.PI * 2;
        const dist = RNG.random() * RNG.random() * clusterRadius; // bias toward cluster center
        points.push({
          x: Math.min(worldWidth, Math.max(0, cx + Math.cos(angle) * dist)),
          y: Math.min(worldHeight, Math.max(0, cy + Math.sin(angle) * dist)),
        });
      }
    }
    for (let i = 0; i < soloCount; i++) {
      points.push({ x: RNG.random() * worldWidth, y: RNG.random() * worldHeight });
    }
    return points;
  }

  // Uniform-grid spatial hash used to reject placements that would stack
  // too heavily on top of something already placed. `allowance` < 1 lets
  // footprints overlap a bit (natural — a fern at the base of a tree, a
  // mushroom nudged against a rock) without permitting full stacking.
  function createSpatialIndex(cellSize) {
    const cells = new Map();

    function key(cx, cy) {
      return `${cx},${cy}`;
    }

    function cellOf(x, y) {
      return [Math.floor(x / cellSize), Math.floor(y / cellSize)];
    }

    function insert(x, y, radius) {
      const [cx, cy] = cellOf(x, y);
      const k = key(cx, cy);
      let bucket = cells.get(k);
      if (!bucket) {
        bucket = [];
        cells.set(k, bucket);
      }
      bucket.push({ x, y, radius });
    }

    function hasOverlap(x, y, radius, allowance) {
      const [cx, cy] = cellOf(x, y);
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const bucket = cells.get(key(cx + dx, cy + dy));
          if (!bucket) continue;
          for (const other of bucket) {
            const minDist = (radius + other.radius) * allowance;
            if (Math.hypot(x - other.x, y - other.y) < minDist) return true;
          }
        }
      }
      return false;
    }

    return { insert, hasOverlap };
  }

  return { createValueNoise2D, scatterPatchy, scatterClusters, createSpatialIndex };
})();
