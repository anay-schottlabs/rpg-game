// Forest Kit assets — imported from the "MMO GAME" Claude Design project.
// Each SVG keeps its own <defs> so it works standalone as a data URI.

const ForestAssets = (() => {
  function svgToImage(svg) {
    const img = new Image();
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    return img;
  }

  const treeSvgs = {
    common: `
      <svg xmlns="http://www.w3.org/2000/svg" width="140" height="160" viewBox="0 0 140 160">
        <defs>
          <pattern id="hatch" width="4.5" height="4.5" patternUnits="userSpaceOnUse">
            <path d="M0,4.5 L4.5,0" stroke="#2a1f18" stroke-width="0.9"/>
            <path d="M0,0 L4.5,4.5" stroke="#2a1f18" stroke-width="0.9"/>
          </pattern>
          <clipPath id="canopyClip1"><circle cx="70" cy="60" r="38"/></clipPath>
        </defs>
        <path d="M64,150 L60,90 L80,90 L76,150 Z" fill="#5a4530" stroke="#2a1f18" stroke-width="3"/>
        <circle cx="70" cy="60" r="38" fill="#5c6b3f" stroke="#2a1f18" stroke-width="3.5"/>
        <circle cx="48" cy="75" r="24" fill="#5c6b3f" stroke="#2a1f18" stroke-width="3.5"/>
        <circle cx="92" cy="75" r="24" fill="#5c6b3f" stroke="#2a1f18" stroke-width="3.5"/>
        <circle cx="85" cy="55" r="30" fill="url(#hatch)" opacity="0.45" clip-path="url(#canopyClip1)"/>
      </svg>`,

    elder: `
      <svg xmlns="http://www.w3.org/2000/svg" width="140" height="160" viewBox="0 0 140 160">
        <defs>
          <pattern id="deepHatch" width="2.8" height="2.8" patternUnits="userSpaceOnUse">
            <path d="M0,2.8 L2.8,0" stroke="#2a1f18" stroke-width="1"/>
            <path d="M0,0 L2.8,2.8" stroke="#2a1f18" stroke-width="1"/>
          </pattern>
          <clipPath id="canopyClip2"><circle cx="70" cy="45" r="34"/></clipPath>
        </defs>
        <path d="M60,150 L54,80 L48,60 L92,60 L86,80 L80,150 Z" fill="#5a4530" stroke="#2a1f18" stroke-width="3"/>
        <ellipse cx="57" cy="102" rx="6" ry="9" fill="#3a2c1e" stroke="#2a1f18" stroke-width="1.4"/>
        <circle cx="70" cy="45" r="34" fill="#5c6b3f" stroke="#2a1f18" stroke-width="3.5"/>
        <circle cx="42" cy="55" r="22" fill="#5c6b3f" stroke="#2a1f18" stroke-width="3.5"/>
        <circle cx="98" cy="55" r="22" fill="#5c6b3f" stroke="#2a1f18" stroke-width="3.5"/>
        <circle cx="70" cy="22" r="19" fill="#5c6b3f" stroke="#2a1f18" stroke-width="3.5"/>
        <circle cx="85" cy="42" r="26" fill="url(#deepHatch)" opacity="0.4" clip-path="url(#canopyClip2)"/>
      </svg>`,

    dead: `
      <svg xmlns="http://www.w3.org/2000/svg" width="140" height="160" viewBox="0 0 140 160">
        <path d="M70,150 L66,112 L80,92 L62,66 L76,42 L68,18" stroke="#7a6f5c" stroke-width="8" fill="none" stroke-linecap="round"/>
        <path d="M70,150 L66,112 L80,92 L62,66 L76,42 L68,18" stroke="#2a1f18" stroke-width="1.4" fill="none" opacity="0.4" transform="translate(1.5,1)"/>
        <line x1="66" y1="112" x2="38" y2="96" stroke="#7a6f5c" stroke-width="5" stroke-linecap="round"/>
        <line x1="80" y1="92" x2="108" y2="76" stroke="#7a6f5c" stroke-width="5" stroke-linecap="round"/>
        <line x1="62" y1="66" x2="36" y2="54" stroke="#7a6f5c" stroke-width="4" stroke-linecap="round"/>
        <ellipse cx="42" cy="99" rx="5" ry="3" fill="#8a5a3a" stroke="#2a1f18" stroke-width="1"/>
        <ellipse cx="104" cy="80" rx="5" ry="3" fill="#8a5a3a" stroke="#2a1f18" stroke-width="1"/>
      </svg>`,
  };

  const trees = {};
  for (const [key, svg] of Object.entries(treeSvgs)) {
    trees[key] = svgToImage(svg);
  }

  // Trunk base sits at y=150 of the 160-tall viewBox for every tree variant,
  // so callers can anchor all types to the same ground point.
  const TREE_VIEWBOX = { width: 140, height: 160, groundFraction: 150 / 160 };

  // --- Foliage ---------------------------------------------------------

  const foliageSvgs = {
    bush: `
      <svg xmlns="http://www.w3.org/2000/svg" width="140" height="140" viewBox="0 0 140 140">
        <defs>
          <pattern id="hatch" width="4.5" height="4.5" patternUnits="userSpaceOnUse">
            <path d="M0,4.5 L4.5,0" stroke="#2a1f18" stroke-width="0.9"/>
            <path d="M0,0 L4.5,4.5" stroke="#2a1f18" stroke-width="0.9"/>
          </pattern>
          <clipPath id="bushClip"><circle cx="70" cy="72" r="34"/></clipPath>
        </defs>
        <circle cx="50" cy="78" r="26" fill="#5c6b3f" stroke="#2a1f18" stroke-width="3"/>
        <circle cx="90" cy="78" r="26" fill="#5c6b3f" stroke="#2a1f18" stroke-width="3"/>
        <circle cx="70" cy="60" r="28" fill="#5c6b3f" stroke="#2a1f18" stroke-width="3"/>
        <circle cx="82" cy="58" r="22" fill="url(#hatch)" opacity="0.4" clip-path="url(#bushClip)"/>
      </svg>`,

    fern: `
      <svg xmlns="http://www.w3.org/2000/svg" width="140" height="140" viewBox="0 0 140 140">
        <path d="M70,125 Q50,90 30,55" stroke="#4f6636" stroke-width="5" fill="none" stroke-linecap="round"/>
        <path d="M70,125 Q60,85 50,45" stroke="#4f6636" stroke-width="5" fill="none" stroke-linecap="round"/>
        <path d="M70,125 Q70,80 70,35" stroke="#4f6636" stroke-width="5" fill="none" stroke-linecap="round"/>
        <path d="M70,125 Q80,85 90,45" stroke="#4f6636" stroke-width="5" fill="none" stroke-linecap="round"/>
        <path d="M70,125 Q90,90 110,55" stroke="#4f6636" stroke-width="5" fill="none" stroke-linecap="round"/>
        <path d="M70,125 Q50,90 30,55" stroke="#2a1f18" stroke-width="1.4" fill="none" opacity="0.4"/>
        <path d="M70,125 Q90,90 110,55" stroke="#2a1f18" stroke-width="1.4" fill="none" opacity="0.4"/>
      </svg>`,

    tallGrass: `
      <svg xmlns="http://www.w3.org/2000/svg" width="140" height="140" viewBox="0 0 140 140">
        <path d="M40,125 Q35,95 45,60" stroke="#6b8049" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path d="M55,125 Q52,90 60,50" stroke="#6b8049" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path d="M70,125 Q70,88 70,45" stroke="#6b8049" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path d="M85,125 Q88,90 80,50" stroke="#6b8049" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path d="M100,125 Q105,95 95,60" stroke="#6b8049" stroke-width="4" fill="none" stroke-linecap="round"/>
      </svg>`,

    flowers: `
      <svg xmlns="http://www.w3.org/2000/svg" width="140" height="140" viewBox="0 0 140 140">
        <line x1="50" y1="125" x2="50" y2="80" stroke="#4f6636" stroke-width="3"/>
        <line x1="95" y1="125" x2="95" y2="88" stroke="#4f6636" stroke-width="3"/>
        <circle cx="50" cy="80" r="5" fill="#d4a53d" stroke="#2a1f18" stroke-width="1.5"/>
        <circle cx="40" cy="70" r="5" fill="#e0c060" stroke="#2a1f18" stroke-width="1.5"/>
        <circle cx="60" cy="70" r="5" fill="#e0c060" stroke="#2a1f18" stroke-width="1.5"/>
        <circle cx="43" cy="86" r="5" fill="#e0c060" stroke="#2a1f18" stroke-width="1.5"/>
        <circle cx="57" cy="86" r="5" fill="#e0c060" stroke="#2a1f18" stroke-width="1.5"/>
        <circle cx="95" cy="88" r="5" fill="#8a6bb0" stroke="#2a1f18" stroke-width="1.5"/>
        <circle cx="86" cy="80" r="5" fill="#9b7fc4" stroke="#2a1f18" stroke-width="1.5"/>
        <circle cx="104" cy="80" r="5" fill="#9b7fc4" stroke="#2a1f18" stroke-width="1.5"/>
        <circle cx="88" cy="96" r="5" fill="#9b7fc4" stroke="#2a1f18" stroke-width="1.5"/>
        <circle cx="102" cy="96" r="5" fill="#9b7fc4" stroke="#2a1f18" stroke-width="1.5"/>
      </svg>`,
  };

  // Per-variant ground anchor (fraction down the viewBox where the stems
  // actually touch the ground) since foliage silhouettes aren't uniform.
  const foliageMeta = {
    bush: { groundFraction: 104 / 140 },
    fern: { groundFraction: 125 / 140 },
    tallGrass: { groundFraction: 125 / 140 },
    flowers: { groundFraction: 125 / 140 },
  };

  const foliage = {};
  for (const [key, svg] of Object.entries(foliageSvgs)) {
    foliage[key] = { image: svgToImage(svg), width: 140, height: 140, groundFraction: foliageMeta[key].groundFraction };
  }

  // --- Mushrooms ---------------------------------------------------------

  function mushroomSvg(cap, spotted) {
    const spots = spotted
      ? `<circle cx="45" cy="65" r="5" fill="#f0e6d2" stroke="#2a1f18" stroke-width="1.2"/>
         <circle cx="70" cy="60" r="4" fill="#f0e6d2" stroke="#2a1f18" stroke-width="1.2"/>
         <circle cx="80" cy="75" r="4.5" fill="#f0e6d2" stroke="#2a1f18" stroke-width="1.2"/>`
      : "";
    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="120" height="140" viewBox="0 0 120 140">
        <defs>
          <pattern id="deepHatch" width="2.8" height="2.8" patternUnits="userSpaceOnUse">
            <path d="M0,2.8 L2.8,0" stroke="#2a1f18" stroke-width="1"/>
            <path d="M0,0 L2.8,2.8" stroke="#2a1f18" stroke-width="1"/>
          </pattern>
        </defs>
        <rect x="50" y="90" width="20" height="34" rx="6" fill="#e8dcc0" stroke="#2a1f18" stroke-width="3"/>
        <path d="M20,90 Q20,50 60,45 Q100,50 100,90 Q60,105 20,90 Z" fill="${cap}" stroke="#2a1f18" stroke-width="3.5"/>
        <path d="M20,90 Q20,50 60,45 Q100,50 100,90 Q60,105 20,90 Z" fill="url(#deepHatch)" opacity="0.3"/>
        ${spots}
      </svg>`;
  }

  const clusterSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="140" viewBox="0 0 120 140">
      <rect x="25" y="105" width="12" height="20" rx="4" fill="#e8dcc0" stroke="#2a1f18" stroke-width="2.5"/>
      <path d="M8,105 Q8,82 31,80 Q54,82 54,105 Q31,113 8,105 Z" fill="#7a5c3e" stroke="#2a1f18" stroke-width="3"/>
      <rect x="65" y="95" width="14" height="30" rx="4" fill="#e8dcc0" stroke="#2a1f18" stroke-width="2.5"/>
      <path d="M45,95 Q45,68 72,65 Q99,68 99,95 Q72,105 45,95 Z" fill="#8a6a48" stroke="#2a1f18" stroke-width="3"/>
    </svg>`;

  const mushrooms = {
    redCap: { image: svgToImage(mushroomSvg("#a63d3d", true)), width: 120, height: 140, groundFraction: 124 / 140 },
    tawnyCap: { image: svgToImage(mushroomSvg("#b98a4a", false)), width: 120, height: 140, groundFraction: 124 / 140 },
    blueCap: { image: svgToImage(mushroomSvg("#4a6a8a", false)), width: 120, height: 140, groundFraction: 124 / 140 },
    cluster: { image: svgToImage(clusterSvg), width: 120, height: 140, groundFraction: 125 / 140 },
  };

  // --- Rocks ---------------------------------------------------------------

  // Same jagged-polygon generator as the design kit's "Rocks" section: a
  // 10-point ring perturbed by a sine wave keyed on `seed`, so each seed
  // yields a distinct but consistently rock-shaped silhouette.
  function rockPoints(cx, cy, rx, ry, amp, seed) {
    const pts = [];
    const count = 10;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const r = 1 + amp * Math.sin(angle * 3 + seed);
      pts.push(`${(cx + rx * r * Math.cos(angle)).toFixed(1)},${(cy + ry * r * Math.sin(angle)).toFixed(1)}`);
    }
    return pts.join(" ");
  }

  function rockSvg(points, shade) {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="140" height="130" viewBox="0 0 140 130">
        <defs>
          <pattern id="deepHatch" width="2.8" height="2.8" patternUnits="userSpaceOnUse">
            <path d="M0,2.8 L2.8,0" stroke="#2a1f18" stroke-width="1"/>
            <path d="M0,0 L2.8,2.8" stroke="#2a1f18" stroke-width="1"/>
          </pattern>
        </defs>
        <polygon points="${points}" fill="#8a8478" stroke="#2a1f18" stroke-width="3.5" stroke-linejoin="round"/>
        <polygon points="${shade}" fill="url(#deepHatch)" opacity="0.5"/>
      </svg>`;
  }

  // A handful of pregenerated variants per size class (reused across many
  // instances, like the tree images) rather than one unique SVG per rock.
  const rockSizeParams = {
    small: { cx: 70, cy: 75, rx: 26, ry: 20, amp: 0.22, shadeCx: 78, shadeCy: 78, shadeRx: 16, shadeRy: 13, shadeAmp: 0.2 },
    medium: { cx: 70, cy: 75, rx: 40, ry: 30, amp: 0.2, shadeCx: 84, shadeCy: 80, shadeRx: 24, shadeRy: 18, shadeAmp: 0.18 },
    large: { cx: 70, cy: 70, rx: 52, ry: 38, amp: 0.16, shadeCx: 90, shadeCy: 76, shadeRx: 30, shadeRy: 22, shadeAmp: 0.16 },
  };
  const rockSeedsBySize = { small: [1, 11, 21], medium: [2, 12], large: [3, 13] };

  const rocks = [];
  for (const [size, params] of Object.entries(rockSizeParams)) {
    const groundFraction = (params.cy + params.ry * (1 + params.amp)) / 130;
    for (const seed of rockSeedsBySize[size]) {
      const points = rockPoints(params.cx, params.cy, params.rx, params.ry, params.amp, seed);
      const shade = rockPoints(params.shadeCx, params.shadeCy, params.shadeRx, params.shadeRy, params.shadeAmp, seed);
      rocks.push({ image: svgToImage(rockSvg(points, shade)), width: 140, height: 130, groundFraction, size });
    }
  }

  return { trees, TREE_VIEWBOX, foliage, mushrooms, rocks };
})();
