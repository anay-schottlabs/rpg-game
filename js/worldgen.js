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
      const j = Math.floor(Math.random() * (i + 1));
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
      const x = Math.random() * worldWidth;
      const y = Math.random() * worldHeight;
      const density = noiseFn(x / noiseScale, y / noiseScale);
      if (density < threshold) continue; // barren patch, skip entirely

      // Soft falloff just above the threshold so patch edges thin out
      // gradually instead of cutting off in a hard ring.
      const chance = (density - threshold) / (1 - threshold);
      if (Math.random() > chance + 0.2) continue;

      points.push({ x, y, density });
    }
    return points;
  }

  function scatterClusters({ worldWidth, worldHeight, clusterCount, itemsPerCluster, clusterRadius, soloCount = 0 }) {
    const points = [];
    for (let c = 0; c < clusterCount; c++) {
      const cx = Math.random() * worldWidth;
      const cy = Math.random() * worldHeight;
      const n = itemsPerCluster.min + Math.floor(Math.random() * (itemsPerCluster.max - itemsPerCluster.min + 1));
      for (let i = 0; i < n; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * Math.random() * clusterRadius; // bias toward cluster center
        points.push({
          x: Math.min(worldWidth, Math.max(0, cx + Math.cos(angle) * dist)),
          y: Math.min(worldHeight, Math.max(0, cy + Math.sin(angle) * dist)),
        });
      }
    }
    for (let i = 0; i < soloCount; i++) {
      points.push({ x: Math.random() * worldWidth, y: Math.random() * worldHeight });
    }
    return points;
  }

  return { createValueNoise2D, scatterPatchy, scatterClusters };
})();
