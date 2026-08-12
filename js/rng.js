// Shared random source for everything that must match across all clients in
// a multiplayer session (world generation). Solo play just uses real
// randomness (RNG.random defaults to Math.random); hosting/joining reseeds
// it deterministically before world generation runs, via RNG.seed(seed).

const RNG = (() => {
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  return {
    random: Math.random,
    seed(seedValue) {
      this.random = mulberry32(seedValue);
    },
  };
})();
