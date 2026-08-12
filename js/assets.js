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

    birch: `
      <svg xmlns="http://www.w3.org/2000/svg" width="140" height="160" viewBox="0 0 140 160">
        <defs>
          <pattern id="hatch" width="4.5" height="4.5" patternUnits="userSpaceOnUse">
            <path d="M0,4.5 L4.5,0" stroke="#2a1f18" stroke-width="0.9"/>
            <path d="M0,0 L4.5,4.5" stroke="#2a1f18" stroke-width="0.9"/>
          </pattern>
          <clipPath id="canopyClip1"><circle cx="70" cy="60" r="38"/></clipPath>
        </defs>
        <path d="M66,150 L66,70 L74,70 L74,150 Z" fill="#d8cdb0" stroke="#2a1f18" stroke-width="3"/>
        <line x1="67" y1="82" x2="72" y2="84" stroke="#2a1f18" stroke-width="2"/>
        <line x1="68" y1="102" x2="73" y2="100" stroke="#2a1f18" stroke-width="2"/>
        <line x1="67" y1="124" x2="72" y2="126" stroke="#2a1f18" stroke-width="2"/>
        <circle cx="70" cy="55" r="30" fill="#7a9457" stroke="#2a1f18" stroke-width="3.5"/>
        <circle cx="46" cy="68" r="20" fill="#7a9457" stroke="#2a1f18" stroke-width="3.5"/>
        <circle cx="94" cy="68" r="20" fill="#7a9457" stroke="#2a1f18" stroke-width="3.5"/>
        <circle cx="82" cy="50" r="24" fill="url(#hatch)" opacity="0.4" clip-path="url(#canopyClip1)"/>
      </svg>`,

    pine: `
      <svg xmlns="http://www.w3.org/2000/svg" width="140" height="160" viewBox="0 0 140 160">
        <defs>
          <pattern id="deepHatch" width="2.8" height="2.8" patternUnits="userSpaceOnUse">
            <path d="M0,2.8 L2.8,0" stroke="#2a1f18" stroke-width="1"/>
            <path d="M0,0 L2.8,2.8" stroke="#2a1f18" stroke-width="1"/>
          </pattern>
        </defs>
        <rect x="64" y="130" width="12" height="20" fill="#5a4530" stroke="#2a1f18" stroke-width="3"/>
        <polygon points="70,60 112,140 28,140" fill="#3f5233" stroke="#2a1f18" stroke-width="3.5" stroke-linejoin="round"/>
        <polygon points="91,100 112,140 70,140" fill="url(#deepHatch)" opacity="0.4"/>
        <polygon points="70,35 100,105 40,105" fill="#4d6b3f" stroke="#2a1f18" stroke-width="3.5" stroke-linejoin="round"/>
        <polygon points="86,72 100,105 70,105" fill="url(#deepHatch)" opacity="0.4"/>
        <polygon points="70,14 90,70 50,70" fill="#5c7a4a" stroke="#2a1f18" stroke-width="3" stroke-linejoin="round"/>
      </svg>`,

    willow: `
      <svg xmlns="http://www.w3.org/2000/svg" width="140" height="160" viewBox="0 0 140 160">
        <defs>
          <pattern id="hatch" width="4.5" height="4.5" patternUnits="userSpaceOnUse">
            <path d="M0,4.5 L4.5,0" stroke="#2a1f18" stroke-width="0.9"/>
            <path d="M0,0 L4.5,4.5" stroke="#2a1f18" stroke-width="0.9"/>
          </pattern>
          <clipPath id="canopyClip1"><circle cx="70" cy="60" r="38"/></clipPath>
        </defs>
        <path d="M66,150 L64,95 L76,95 L74,150 Z" fill="#5a4530" stroke="#2a1f18" stroke-width="3"/>
        <circle cx="70" cy="75" r="32" fill="#6b8049" stroke="#2a1f18" stroke-width="3.5"/>
        <circle cx="82" cy="68" r="22" fill="url(#hatch)" opacity="0.4" clip-path="url(#canopyClip1)"/>
        <path d="M55,95 Q50,120 46,142" stroke="#4f6636" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M65,100 Q62,124 58,146" stroke="#4f6636" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M78,100 Q80,124 84,146" stroke="#4f6636" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M90,95 Q94,120 98,142" stroke="#4f6636" stroke-width="3" fill="none" stroke-linecap="round"/>
        <ellipse cx="46" cy="143" rx="5" ry="3" fill="#5c6b3f" stroke="#2a1f18" stroke-width="1"/>
        <ellipse cx="98" cy="143" rx="5" ry="3" fill="#5c6b3f" stroke="#2a1f18" stroke-width="1"/>
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
  // Display width/height are NOT the raw 140x140 viewBox — bush and fern
  // fill most of their viewBox (so at tree-sized dimensions they read as
  // tree-sized), while flowers are mostly empty space around a small
  // cluster of dots, so the same box size reads much smaller. Sizes below
  // are picked per-asset so the visible ink ends up a sensible in-world
  // size relative to the ~150px-wide trees and the ~28px player.
  const foliageMeta = {
    bush: { width: 62, height: 62, groundFraction: 104 / 140 },
    fern: { width: 46, height: 46, groundFraction: 125 / 140 },
    tallGrass: { width: 43, height: 43, groundFraction: 125 / 140 },
    flowers: { width: 100, height: 100, groundFraction: 125 / 140 },
  };

  const foliage = {};
  for (const [key, svg] of Object.entries(foliageSvgs)) {
    foliage[key] = { image: svgToImage(svg), width: foliageMeta[key].width, height: foliageMeta[key].height, groundFraction: foliageMeta[key].groundFraction };
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

  // Real mushrooms are tiny — the cap fills most of its 120x140 viewBox
  // (unlike flowers' mostly-empty one), so it needs a much smaller display
  // size than the raw viewBox to read as ankle-height rather than tree-height.
  const mushrooms = {
    redCap: { image: svgToImage(mushroomSvg("#a63d3d", true)), width: 26, height: 30, groundFraction: 124 / 140 },
    tawnyCap: { image: svgToImage(mushroomSvg("#b98a4a", false)), width: 26, height: 30, groundFraction: 124 / 140 },
    blueCap: { image: svgToImage(mushroomSvg("#4a6a8a", false)), width: 26, height: 30, groundFraction: 124 / 140 },
    cluster: { image: svgToImage(clusterSvg), width: 34, height: 40, groundFraction: 125 / 140 },
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

  // --- Campfire ------------------------------------------------------------

  // No campfire exists in the source Forest Kit — the project's only
  // campfire-related files are reference photos too large for this tool to
  // fetch in full. Hand-drawn here to match the kit's established style
  // (dark ink outlines, deepHatch cross-texture, a warm radial glow reused
  // from the same idea as the kit's firefly/spore glow).
  const campfireSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="160" height="170" viewBox="0 0 160 170">
      <defs>
        <pattern id="deepHatch" width="2.8" height="2.8" patternUnits="userSpaceOnUse">
          <path d="M0,2.8 L2.8,0" stroke="#2a1f18" stroke-width="1"/>
          <path d="M0,0 L2.8,2.8" stroke="#2a1f18" stroke-width="1"/>
        </pattern>
        <radialGradient id="fireGlow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stop-color="#f4c94a" stop-opacity="0.85"/>
          <stop offset="1" stop-color="#f4c94a" stop-opacity="0"/>
        </radialGradient>
      </defs>

      <circle cx="80" cy="110" r="70" fill="url(#fireGlow)"/>
      <ellipse cx="80" cy="152" rx="54" ry="14" fill="#241c14" opacity="0.55"/>

      <polygon points="18,150 10,138 20,126 34,130 36,146 26,154" fill="#8a8478" stroke="#2a1f18" stroke-width="3" stroke-linejoin="round"/>
      <polygon points="18,150 10,138 20,126 34,130 36,146 26,154" fill="url(#deepHatch)" opacity="0.4"/>
      <polygon points="142,150 150,138 140,126 126,130 124,146 134,154" fill="#8a8478" stroke="#2a1f18" stroke-width="3" stroke-linejoin="round"/>
      <polygon points="142,150 150,138 140,126 126,130 124,146 134,154" fill="url(#deepHatch)" opacity="0.4"/>
      <polygon points="46,158 36,150 42,138 58,138 64,150 56,160" fill="#8a8478" stroke="#2a1f18" stroke-width="3" stroke-linejoin="round"/>
      <polygon points="46,158 36,150 42,138 58,138 64,150 56,160" fill="url(#deepHatch)" opacity="0.4"/>
      <polygon points="114,158 104,150 110,138 126,138 132,150 124,160" fill="#8a8478" stroke="#2a1f18" stroke-width="3" stroke-linejoin="round"/>
      <polygon points="114,158 104,150 110,138 126,138 132,150 124,160" fill="url(#deepHatch)" opacity="0.4"/>

      <rect x="35" y="128" width="90" height="12" rx="6" fill="#5a4530" stroke="#2a1f18" stroke-width="3" transform="rotate(-18 80 134)"/>
      <rect x="35" y="128" width="90" height="12" rx="6" fill="#5a4530" stroke="#2a1f18" stroke-width="3" transform="rotate(18 80 134)"/>
      <rect x="35" y="128" width="90" height="12" rx="6" fill="url(#deepHatch)" opacity="0.3" transform="rotate(-18 80 134)"/>
      <rect x="35" y="128" width="90" height="12" rx="6" fill="url(#deepHatch)" opacity="0.3" transform="rotate(18 80 134)"/>

      <path d="M80,55 Q104,85 92,118 Q86,135 80,138 Q74,135 68,118 Q56,85 80,55 Z" fill="#c1442b" stroke="#2a1f18" stroke-width="3"/>
      <path d="M80,72 Q94,92 87,114 Q83,126 80,128 Q77,126 73,114 Q66,92 80,72 Z" fill="#e8863c" stroke="#2a1f18" stroke-width="2"/>
      <path d="M80,88 Q88,100 84,116 Q82,123 80,124 Q78,123 76,116 Q72,100 80,88 Z" fill="#f4d35e" stroke="none"/>

      <circle cx="100" cy="60" r="3" fill="#f4d35e"/>
      <circle cx="62" cy="50" r="2.4" fill="#f4d35e"/>
      <circle cx="90" cy="38" r="2" fill="#f4c94a"/>
    </svg>`;

  const campfire = { image: svgToImage(campfireSvg), width: 170, height: 181, groundFraction: 160 / 170 };

  // --- Ambient details -------------------------------------------------

  const ambientSvgs = {
    fallenLog: `
      <svg xmlns="http://www.w3.org/2000/svg" width="140" height="100" viewBox="0 0 140 100">
        <defs>
          <pattern id="deepHatch" width="2.8" height="2.8" patternUnits="userSpaceOnUse">
            <path d="M0,2.8 L2.8,0" stroke="#2a1f18" stroke-width="1"/>
            <path d="M0,0 L2.8,2.8" stroke="#2a1f18" stroke-width="1"/>
          </pattern>
          <clipPath id="logClip"><rect x="20" y="38" width="95" height="26" rx="13"/></clipPath>
        </defs>
        <rect x="20" y="38" width="95" height="26" rx="13" fill="#5a4530" stroke="#2a1f18" stroke-width="3"/>
        <rect x="20" y="49" width="95" height="15" fill="url(#deepHatch)" opacity="0.35" clip-path="url(#logClip)"/>
        <path d="M42,39 L40,63 M60,38 L58,64 M78,38 L76,64 M94,39 L92,63" stroke="#2a1f18" stroke-width="1" opacity="0.3" clip-path="url(#logClip)"/>
        <ellipse cx="108" cy="51" rx="10" ry="13" fill="#8a6a48" stroke="#2a1f18" stroke-width="3"/>
        <ellipse cx="108" cy="51" rx="6" ry="8" fill="none" stroke="#2a1f18" stroke-width="1.3" opacity="0.6"/>
        <ellipse cx="108" cy="51" rx="2.5" ry="3.5" fill="none" stroke="#2a1f18" stroke-width="1.1" opacity="0.6"/>
      </svg>`,

    stump: `
      <svg xmlns="http://www.w3.org/2000/svg" width="140" height="100" viewBox="0 0 140 100">
        <rect x="45" y="45" width="50" height="35" fill="#5a4530" stroke="#2a1f18" stroke-width="3"/>
        <ellipse cx="70" cy="45" rx="25" ry="12" fill="#8a6a48" stroke="#2a1f18" stroke-width="3"/>
        <ellipse cx="70" cy="45" rx="14" ry="6.5" fill="none" stroke="#2a1f18" stroke-width="1.2" opacity="0.6"/>
      </svg>`,

    twigPile: `
      <svg xmlns="http://www.w3.org/2000/svg" width="140" height="100" viewBox="0 0 140 100">
        <line x1="30" y1="70" x2="80" y2="55" stroke="#5a4530" stroke-width="4" stroke-linecap="round"/>
        <line x1="40" y1="75" x2="100" y2="60" stroke="#5a4530" stroke-width="4" stroke-linecap="round"/>
        <line x1="55" y1="80" x2="75" y2="50" stroke="#5a4530" stroke-width="3" stroke-linecap="round"/>
        <ellipse cx="90" cy="70" rx="8" ry="5" fill="#a9642f" stroke="#2a1f18" stroke-width="1.5"/>
        <ellipse cx="105" cy="75" rx="7" ry="4.5" fill="#7a5c3e" stroke="#2a1f18" stroke-width="1.5"/>
      </svg>`,
  };

  // All three share the 140x100 viewBox; ground anchor is the lowest point
  // of the drawn shape (the pieces lie flat rather than standing upright).
  const ambientMeta = {
    fallenLog: { width: 95, height: 68, groundFraction: 64 / 100 },
    stump: { width: 60, height: 43, groundFraction: 80 / 100 },
    twigPile: { width: 55, height: 39, groundFraction: 80 / 100 },
  };

  const ambient = {};
  for (const [key, svg] of Object.entries(ambientSvgs)) {
    ambient[key] = { image: svgToImage(svg), width: ambientMeta[key].width, height: ambientMeta[key].height, groundFraction: ambientMeta[key].groundFraction };
  }

  return { trees, TREE_VIEWBOX, foliage, mushrooms, rocks, campfire, ambient };
})();
