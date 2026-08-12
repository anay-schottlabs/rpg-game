// Procedural sound effects — everything here is synthesized with the Web
// Audio API at call time rather than played from an audio file, so the game
// stays a handful of script files with no binary assets to fetch or license.
// Matches the hand-drawn, generated-on-the-fly feel of the SVG art in
// js/assets.js: nothing is pre-rendered, it's all built from a formula.

const Sound = (() => {
  let ctx = null;

  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    // Browsers start an AudioContext "suspended" until a real user gesture;
    // resume() only actually takes effect when called during/soon after
    // one. unlock() below (registered on the first keydown/pointerdown)
    // covers that — this call is just a harmless no-op once already running.
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  // A single tone with a short exponential decay, optionally sweeping from
  // `freq` to `freqEnd` — the building block for most cues below (casts,
  // hits, UI beeps). `type` is any OscillatorNode waveform.
  function tone({ freq, duration, type = "sine", gain = 0.15, freqEnd, attack = 0.005 }) {
    const ac = getCtx();
    const osc = ac.createOscillator();
    const gainNode = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ac.currentTime);
    if (freqEnd) osc.frequency.exponentialRampToValueAtTime(Math.max(1, freqEnd), ac.currentTime + duration);
    gainNode.gain.setValueAtTime(0, ac.currentTime);
    gainNode.gain.linearRampToValueAtTime(gain, ac.currentTime + attack);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
    osc.connect(gainNode).connect(ac.destination);
    osc.start();
    osc.stop(ac.currentTime + duration + 0.02);
  }

  // A short burst of filtered white noise — footsteps, impacts, anything
  // percussive rather than tonal.
  function noiseBurst({ duration, gain = 0.15, filterFreq = 1200, filterType = "lowpass" }) {
    const ac = getCtx();
    const bufferSize = Math.max(1, Math.floor(ac.sampleRate * duration));
    const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    const src = ac.createBufferSource();
    src.buffer = buffer;
    const filter = ac.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.value = filterFreq;
    const gainNode = ac.createGain();
    gainNode.gain.value = gain;
    src.connect(filter).connect(gainNode).connect(ac.destination);
    src.start();
  }

  const CAST_FREQ_BY_ELEMENT = { fire: 520, water: 380, earth: 220, wind: 660 };

  const api = {
    footstep() {
      noiseBurst({ duration: 0.055, gain: 0.045, filterFreq: 450 });
    },
    cast(element) {
      const base = CAST_FREQ_BY_ELEMENT[element] || 440;
      tone({ freq: base, freqEnd: base * 1.6, duration: 0.28, type: "triangle", gain: 0.12 });
    },
    dash() {
      tone({ freq: 700, freqEnd: 1100, duration: 0.15, type: "sine", gain: 0.1 });
    },
    enemyAttackWindup() {
      tone({ freq: 180, freqEnd: 260, duration: 0.2, type: "sawtooth", gain: 0.07 });
    },
    enemyHitPlayer() {
      noiseBurst({ duration: 0.12, gain: 0.16, filterFreq: 900 });
      tone({ freq: 140, duration: 0.15, type: "square", gain: 0.09 });
    },
    enemyTakeDamage() {
      tone({ freq: 900, freqEnd: 300, duration: 0.12, type: "square", gain: 0.09 });
    },
    enemyDeath() {
      tone({ freq: 300, freqEnd: 60, duration: 0.5, type: "sawtooth", gain: 0.14 });
    },
    heal() {
      tone({ freq: 500, freqEnd: 900, duration: 0.4, type: "sine", gain: 0.1 });
    },
    menuOpen() {
      tone({ freq: 440, freqEnd: 660, duration: 0.12, type: "triangle", gain: 0.08 });
    },
    menuClose() {
      tone({ freq: 660, freqEnd: 440, duration: 0.12, type: "triangle", gain: 0.08 });
    },
    // Earth Breaker: a low crunch per shattered rock/tree, pitched slightly
    // up each step down the chain so a domino run reads as an ascending run
    // of crunches rather than the same hit repeated.
    earthShatter(chainIndex = 0) {
      const pitch = 1 + Math.min(chainIndex, 8) * 0.06;
      noiseBurst({ duration: 0.16, gain: 0.16, filterFreq: 700 * pitch, filterType: "lowpass" });
      tone({ freq: 110 * pitch, freqEnd: 50 * pitch, duration: 0.22, type: "sawtooth", gain: 0.11 });
    },
  };

  // First real user gesture unlocks the AudioContext for the rest of the
  // session (see getCtx()'s comment on why this can't just happen lazily).
  function unlock() {
    getCtx();
    window.removeEventListener("keydown", unlock);
    window.removeEventListener("pointerdown", unlock);
  }
  window.addEventListener("keydown", unlock, { once: true });
  window.addEventListener("pointerdown", unlock, { once: true });

  return api;
})();
window.Sound = Sound;
