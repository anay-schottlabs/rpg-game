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

  // --- Spell effects ---------------------------------------------------

  const spellSvgs = {
    fireBolt: `
      <svg xmlns="http://www.w3.org/2000/svg" width="140" height="80" viewBox="0 0 140 80">
        <path d="M10,50 Q45,52 72,42" stroke="#e8a24a" stroke-width="10" fill="none" opacity="0.25" stroke-linecap="round"/>
        <path d="M25,50 Q55,50 78,42" stroke="#e8a24a" stroke-width="6" fill="none" opacity="0.4" stroke-linecap="round"/>
        <path d="M78,28 Q90,38 84,46 Q94,44 92,54 Q88,62 80,60 Q68,56 68,46 Q68,38 78,28 Z" fill="#c9622f" stroke="#f0e6d2" stroke-width="2.5"/>
      </svg>`,

    // From the design doc's "Impact Effects" section — the earth counterpart
    // to fireImpact just below, reused by Earth Breaker for every rock it
    // shatters (js/game.js castEarthBreaker()).
    earthImpact: `
      <svg xmlns="http://www.w3.org/2000/svg" width="110" height="110" viewBox="0 0 110 110">
        <defs>
          <radialGradient id="impactEarthGlow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stop-color="#a68b5c" stop-opacity="0.55"/>
            <stop offset="1" stop-color="#a68b5c" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <circle cx="55" cy="55" r="42" fill="url(#impactEarthGlow)"/>
        <polygon points="55,14 62,40 88,34 66,52 78,76 55,62 32,76 44,52 22,34 48,40" fill="#6b5a44" stroke="#e8dcc0" stroke-width="2.5"/>
        <circle cx="55" cy="55" r="10" fill="#8a7458" stroke="#e8dcc0" stroke-width="2"/>
      </svg>`,

    fireImpact: `
      <svg xmlns="http://www.w3.org/2000/svg" width="110" height="110" viewBox="0 0 110 110">
        <defs>
          <radialGradient id="impactFireGlow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stop-color="#e8a24a" stop-opacity="0.6"/>
            <stop offset="1" stop-color="#e8a24a" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <circle cx="55" cy="55" r="42" fill="url(#impactFireGlow)"/>
        <polygon points="55,10 64,42 92,30 68,54 84,84 55,64 26,84 42,54 18,30 46,42" fill="#c9622f" stroke="#f0e6d2" stroke-width="2.5"/>
        <circle cx="55" cy="55" r="12" fill="#e8b13f" stroke="#f0e6d2" stroke-width="2"/>
      </svg>`,

    earthWallPillar: `
      <svg xmlns="http://www.w3.org/2000/svg" width="120" height="160" viewBox="0 0 120 160">
        <defs>
          <pattern id="deepHatch" width="2.8" height="2.8" patternUnits="userSpaceOnUse">
            <path d="M0,2.8 L2.8,0" stroke="#2a1f18" stroke-width="1"/>
            <path d="M0,0 L2.8,2.8" stroke="#2a1f18" stroke-width="1"/>
          </pattern>
        </defs>
        <ellipse cx="60" cy="153" rx="34" ry="8" fill="#2a1f18" opacity="0.22"/>
        <polygon points="40,150 26,100 36,58 60,20 84,52 94,102 82,150" fill="#8a8478" stroke="#2a1f18" stroke-width="3.5" stroke-linejoin="round"/>
        <polygon points="60,20 84,52 94,102 82,150 66,150 66,64" fill="url(#deepHatch)" opacity="0.4"/>
        <ellipse cx="46" cy="60" rx="11" ry="7" fill="#5c6b3f" stroke="#2a1f18" stroke-width="1.5"/>
        <ellipse cx="76" cy="110" rx="9" ry="6" fill="#5c6b3f" stroke="#2a1f18" stroke-width="1.5"/>
      </svg>`,

    earthWallBarricade: `
      <svg xmlns="http://www.w3.org/2000/svg" width="220" height="110" viewBox="0 0 220 110">
        <defs>
          <pattern id="deepHatch" width="2.8" height="2.8" patternUnits="userSpaceOnUse">
            <path d="M0,2.8 L2.8,0" stroke="#2a1f18" stroke-width="1"/>
            <path d="M0,0 L2.8,2.8" stroke="#2a1f18" stroke-width="1"/>
          </pattern>
        </defs>
        <polygon points="15,90 45,60 90,68 130,50 170,64 205,48 205,92 15,100" fill="#7a756a" stroke="#2a1f18" stroke-width="3.5" stroke-linejoin="round"/>
        <polygon points="15,90 205,92 205,100 15,100" fill="url(#deepHatch)" opacity="0.35"/>
        <ellipse cx="100" cy="62" rx="10" ry="6" fill="#5c6b3f" stroke="#2a1f18" stroke-width="1.5"/>
        <ellipse cx="182" cy="58" rx="8" ry="5" fill="#5c6b3f" stroke="#2a1f18" stroke-width="1.5"/>
      </svg>`,

    iceBridgeSegment: `
      <svg xmlns="http://www.w3.org/2000/svg" width="220" height="100" viewBox="0 0 220 100">
        <defs>
          <pattern id="deepHatch" width="2.8" height="2.8" patternUnits="userSpaceOnUse">
            <path d="M0,2.8 L2.8,0" stroke="#2a1f18" stroke-width="1"/>
            <path d="M0,0 L2.8,2.8" stroke="#2a1f18" stroke-width="1"/>
          </pattern>
        </defs>
        <polygon points="20,70 205,66 205,82 20,86" fill="#5f95a8" stroke="#2a1f18" stroke-width="3"/>
        <polygon points="20,70 205,66 205,82 20,86" fill="url(#deepHatch)" opacity="0.3"/>
        <polygon points="10,40 30,30 190,28 210,42 205,66 20,70" fill="#bcdfe8" stroke="#2a1f18" stroke-width="3.5" stroke-linejoin="round"/>
        <path d="M50,36 Q90,30 130,33 Q150,35 140,44 Q100,47 60,45 Q40,43 50,36 Z" fill="#eef8fa" opacity="0.5"/>
      </svg>`,

    // "Gust Step — Dash" from the design doc's Movement Abilities section,
    // cropped to just the motion-blur streaks + wind glyph (the mockup's own
    // creature icon is dropped — our player already draws its own body).
    gustStepStreak: `
      <svg xmlns="http://www.w3.org/2000/svg" width="125" height="45" viewBox="0 0 125 45">
        <path d="M7,17 L57,7" stroke="#d8f0f0" stroke-width="5" opacity="0.25" stroke-linecap="round"/>
        <path d="M27,27 L77,15" stroke="#d8f0f0" stroke-width="6" opacity="0.4" stroke-linecap="round"/>
        <path d="M52,35 L99,19" stroke="#d8f0f0" stroke-width="7" opacity="0.6" stroke-linecap="round"/>
        <polygon points="87,7 75,23 95,29 115,17 105,9" fill="none" stroke="#bfe3e3" stroke-width="2" opacity="0.5"/>
      </svg>`,
  };

  const spellMeta = {
    fireBolt: { width: 66, height: 38, groundFraction: 0.5 }, // anchored at its own center — it's airborne, not ground-planted
    fireImpact: { width: 80, height: 80, groundFraction: 0.5 },
    earthImpact: { width: 90, height: 90, groundFraction: 0.5 },
    earthWallPillar: { width: 95, height: 127, groundFraction: 150 / 160 },
    earthWallBarricade: { width: 190, height: 95, groundFraction: 92 / 110 },
    iceBridgeSegment: { width: 150, height: 68, groundFraction: 76 / 100 },
    gustStepStreak: { width: 125, height: 45, groundFraction: 0.5 }, // airborne — drawn manually via translate/rotate, not the ground-anchored path
  };

  const spellEffects = {};
  for (const [key, svg] of Object.entries(spellSvgs)) {
    spellEffects[key] = { image: svgToImage(svg), width: spellMeta[key].width, height: spellMeta[key].height, groundFraction: spellMeta[key].groundFraction };
  }

  // --- Golem rig -------------------------------------------------------

  // Same rockPoints() generator as trees/rocks, applied to a full segmented
  // body (design kit's "Enemy — Rock Golem"). Points are kept as plain
  // {x,y} arrays rather than rasterized images because game.js needs to
  // rotate individual segments around their joints for animation.
  function rockPointList(cx, cy, rx, ry, amp, seed, count = 10) {
    const pts = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const r = 1 + amp * Math.sin(angle * 3 + seed);
      pts.push({ x: cx + rx * r * Math.cos(angle), y: cy + ry * r * Math.sin(angle) });
    }
    return pts;
  }

  const golemRig = {
    // Local coordinate space matches the design's 260x340 viewBox exactly.
    segments: {
      head: { points: rockPointList(130, 60, 26, 22, 0.22, 21), fill: "#8a8478" },
      torsoMain: { points: rockPointList(130, 150, 58, 55, 0.16, 22), fill: "#8a8478" },
      torsoSecondary: { points: rockPointList(95, 178, 28, 26, 0.2, 23), fill: "#8a8478" },
      armLUpper: { points: rockPointList(45, 150, 22, 26, 0.24, 24), fill: "#8a8478" },
      armLLower: { points: rockPointList(35, 205, 18, 22, 0.26, 25), fill: "#8a8478" },
      armRUpper: { points: rockPointList(215, 150, 22, 26, 0.24, 26), fill: "#8a8478" },
      armRLower: { points: rockPointList(225, 205, 18, 22, 0.26, 27), fill: "#8a8478" },
      legL: { points: rockPointList(105, 262, 26, 30, 0.2, 28), fill: "#7a756a" },
      legR: { points: rockPointList(155, 262, 26, 30, 0.2, 29), fill: "#7a756a" },
      footL: { points: rockPointList(102, 302, 22, 14, 0.22, 30), fill: "#5f5a4f" },
      footR: { points: rockPointList(158, 302, 22, 14, 0.22, 31), fill: "#5f5a4f" },
    },
    // Rigid groups that rotate together around one joint each, matching the
    // single pivot the design marks per limb (shoulder for the whole arm,
    // hip for the whole leg) rather than a separate elbow/knee joint.
    groups: {
      head: { segments: ["head"], pivot: { x: 130, y: 82 } },
      armL: { segments: ["armLUpper", "armLLower"], pivot: { x: 45, y: 150 } },
      armR: { segments: ["armRUpper", "armRLower"], pivot: { x: 215, y: 150 } },
      legL: { segments: ["legL", "footL"], pivot: { x: 105, y: 240 } },
      legR: { segments: ["legR", "footR"], pivot: { x: 155, y: 240 } },
      torso: { segments: ["torsoMain", "torsoSecondary"], pivot: { x: 130, y: 150 } },
    },
    // Fixed (non-animated) joint sockets and moss patches, drawn once
    // beneath/around the moving segments.
    sockets: [
      { x: 66, y: 150, rx: 16, ry: 14 },
      { x: 194, y: 150, rx: 16, ry: 14 },
      { x: 40, y: 180, rx: 13, ry: 12 },
      { x: 220, y: 180, rx: 13, ry: 12 },
      { x: 97, y: 228, rx: 18, ry: 14 },
      { x: 163, y: 228, rx: 18, ry: 14 },
      { x: 104, y: 292, rx: 13, ry: 10 },
      { x: 156, y: 292, rx: 13, ry: 10 },
    ],
    moss: [
      { x: 90, y: 160, rx: 13, ry: 9 },
      { x: 165, y: 130, rx: 10, ry: 7 },
      { x: 120, y: 195, rx: 9, ry: 6 },
      { x: 42, y: 195, rx: 8, ry: 6 },
      { x: 112, y: 255, rx: 9, ry: 6 },
      { x: 168, y: 270, rx: 8, ry: 6 },
      { x: 132, y: 50, rx: 6, ry: 4 },
      { x: 112, y: 72, rx: 7, ry: 5 },
    ],
    cracks: [
      "M110,110 L124,150 L108,180 L128,210",
      "M150,105 L145,140 L165,165",
      "M118,50 L124,62 L116,72",
    ],
    eyes: [
      { x: 120, y: 58, r: 5 },
      { x: 142, y: 58, r: 5 },
    ],
    // Local point every segment/pivot is relative to, and the local space's
    // total height — used to map into world coordinates and to pick a
    // display scale.
    groundAnchor: { x: 130, y: 316 },
    viewHeight: 340,
  };

  // --- Shared point-list helpers for the other rigged creatures ----------

  function blobPointList(cx, cy, rx, ry, seed, count = 16) {
    const pts = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const r = 1 + 0.14 * Math.sin(angle * 3 + seed) + 0.08 * Math.sin(angle * 7 + seed * 1.7);
      pts.push({ x: cx + rx * r * Math.cos(angle), y: cy + ry * r * Math.sin(angle) });
    }
    return pts;
  }

  function pointsToStr(pts) {
    return pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  }

  function legPointList(cx, cy, angle, len, width) {
    const dx = Math.cos(angle), dy = Math.sin(angle);
    const px = -dy, py = dx;
    return [
      { x: cx + px * width, y: cy + py * width },
      { x: cx + dx * len + px * width * 0.4, y: cy + dy * len + py * width * 0.4 },
      { x: cx + dx * len - px * width * 0.4, y: cy + dy * len - py * width * 0.4 },
      { x: cx - px * width, y: cy - py * width },
    ];
  }

  // --- Biome trees -----------------------------------------------------

  // Unlike the Woodland Grove trees (uniform 140x160 viewBox, drawn via the
  // shared drawTree()/TREE_VIEWBOX path in game.js), each biome tree keeps
  // its own viewBox and is drawn as an ordinary ground sprite (same
  // drawGroundSprite() path as foliage/rocks/ambient) — simpler than forcing
  // every biome's silhouette into one shared aspect ratio.
  const biomeTreeSvgs = {
    cypress: `
      <svg xmlns="http://www.w3.org/2000/svg" width="140" height="170" viewBox="0 0 140 170">
        <defs>
          <pattern id="deepHatch" width="2.8" height="2.8" patternUnits="userSpaceOnUse">
            <path d="M0,2.8 L2.8,0" stroke="#2a1f18" stroke-width="1"/>
            <path d="M0,0 L2.8,2.8" stroke="#2a1f18" stroke-width="1"/>
          </pattern>
          <clipPath id="cypressClip"><circle cx="82" cy="60" r="24"/></clipPath>
        </defs>
        <path d="M64,160 L60,90 L80,90 L76,160 Z" fill="#4a3a2a" stroke="#2a1f18" stroke-width="3"/>
        <path d="M55,160 Q50,150 58,145 Q52,158 60,160 Z" fill="#4a3a2a" stroke="#2a1f18" stroke-width="2"/>
        <path d="M85,160 Q92,152 84,146 Q90,158 80,160 Z" fill="#4a3a2a" stroke="#2a1f18" stroke-width="2"/>
        <circle cx="70" cy="65" r="34" fill="#4a5a3a" stroke="#2a1f18" stroke-width="3.5"/>
        <circle cx="48" cy="80" r="20" fill="#4a5a3a" stroke="#2a1f18" stroke-width="3.5"/>
        <circle cx="92" cy="80" r="20" fill="#4a5a3a" stroke="#2a1f18" stroke-width="3.5"/>
        <path d="M50,95 Q46,115 40,135" stroke="#5a6a4a" stroke-width="2" fill="none" opacity="0.6"/>
        <path d="M92,98 Q96,118 100,138" stroke="#5a6a4a" stroke-width="2" fill="none" opacity="0.6"/>
        <circle cx="82" cy="60" r="24" fill="url(#deepHatch)" opacity="0.4" clip-path="url(#cypressClip)"/>
      </svg>`,

    windBentPine: `
      <svg xmlns="http://www.w3.org/2000/svg" width="140" height="170" viewBox="0 0 140 170">
        <rect x="64" y="130" width="12" height="24" fill="#5a4530" stroke="#2a1f18" stroke-width="3" transform="rotate(-8 70 142)"/>
        <polygon points="72,60 112,138 32,142" fill="#5c6b5f" stroke="#2a1f18" stroke-width="3.5" stroke-linejoin="round" transform="rotate(-6 70 100)"/>
        <polygon points="72,35 100,102 44,105" fill="#6b7a68" stroke="#2a1f18" stroke-width="3.5" stroke-linejoin="round" transform="rotate(-6 70 70)"/>
        <polygon points="72,14 90,68 54,70" fill="#7a8874" stroke="#2a1f18" stroke-width="3" stroke-linejoin="round" transform="rotate(-6 70 42)"/>
      </svg>`,

    snowPine: `
      <svg xmlns="http://www.w3.org/2000/svg" width="140" height="170" viewBox="0 0 140 170">
        <rect x="64" y="130" width="12" height="24" fill="#5a4530" stroke="#2a1f18" stroke-width="3"/>
        <polygon points="70,60 110,138 30,142" fill="#3f5233" stroke="#2a1f18" stroke-width="3.5" stroke-linejoin="round"/>
        <polygon points="70,35 98,102 42,105" fill="#4d6b3f" stroke="#2a1f18" stroke-width="3.5" stroke-linejoin="round"/>
        <polygon points="70,14 88,68 52,70" fill="#5c7a4a" stroke="#2a1f18" stroke-width="3" stroke-linejoin="round"/>
        <path d="M40,132 Q70,120 100,132 L96,140 Q70,130 44,140 Z" fill="#eef4f6" stroke="#2a1f18" stroke-width="2"/>
        <path d="M48,98 Q70,90 92,98 L88,105 Q70,99 52,105 Z" fill="#eef4f6" stroke="#2a1f18" stroke-width="2"/>
        <path d="M56,65 Q70,58 84,65 L80,71 Q70,66 60,71 Z" fill="#eef4f6" stroke="#2a1f18" stroke-width="1.6"/>
      </svg>`,
  };

  const biomeTreeMeta = {
    cypress: { width: 128, height: 155, groundFraction: 160 / 170 },
    windBentPine: { width: 128, height: 155, groundFraction: 0.9 },
    snowPine: { width: 128, height: 155, groundFraction: 0.906 },
  };

  const biomeTrees = {};
  for (const [key, svg] of Object.entries(biomeTreeSvgs)) {
    biomeTrees[key] = { image: svgToImage(svg), width: biomeTreeMeta[key].width, height: biomeTreeMeta[key].height, groundFraction: biomeTreeMeta[key].groundFraction };
  }

  // --- Biome foliage & ground details --------------------------------------

  const screePoints = {
    a: rockPoints(45, 90, 26, 20, 0.22, 111),
    b: rockPoints(80, 95, 22, 17, 0.2, 112),
    c: rockPoints(105, 85, 18, 15, 0.24, 113),
  };
  const mudBankPts = pointsToStr(blobPointList(100, 90, 55, 38, 17));
  const mudPoolPts = pointsToStr(blobPointList(100, 90, 44, 29, 17));

  const biomeFoliageSvgs = {
    // Marsh Bog
    reedCluster: `
      <svg xmlns="http://www.w3.org/2000/svg" width="140" height="140" viewBox="0 0 140 140">
        <path d="M40,130 Q35,90 42,55" stroke="#6b7a4a" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path d="M60,130 Q58,85 65,42" stroke="#6b7a4a" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path d="M80,130 Q84,88 78,50" stroke="#6b7a4a" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path d="M100,130 Q104,92 96,58" stroke="#6b7a4a" stroke-width="4" fill="none" stroke-linecap="round"/>
        <ellipse cx="65" cy="38" rx="6" ry="16" fill="#5a4530" stroke="#2a1f18" stroke-width="2"/>
        <ellipse cx="78" cy="46" rx="5" ry="14" fill="#6b5238" stroke="#2a1f18" stroke-width="2"/>
      </svg>`,
    mudPool: `
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="160" viewBox="0 0 200 160">
        <polygon points="${mudBankPts}" fill="#6b6248" stroke="#2a1f18" stroke-width="3.5"/>
        <polygon points="${mudPoolPts}" fill="#4a4530" stroke="#2a1f18" stroke-width="3"/>
        <circle cx="90" cy="80" r="4" fill="#3a3520" opacity="0.7"/>
        <circle cx="110" cy="95" r="3" fill="#3a3520" opacity="0.7"/>
        <circle cx="75" cy="95" r="2.5" fill="#3a3520" opacity="0.6"/>
      </svg>`,

    // Mountain Foothills
    scree: `
      <svg xmlns="http://www.w3.org/2000/svg" width="140" height="130" viewBox="0 0 140 130">
        <polygon points="${screePoints.a}" fill="#9aa0a0" stroke="#2a1f18" stroke-width="3" stroke-linejoin="round"/>
        <polygon points="${screePoints.b}" fill="#848a8a" stroke="#2a1f18" stroke-width="3" stroke-linejoin="round"/>
        <polygon points="${screePoints.c}" fill="#9aa0a0" stroke="#2a1f18" stroke-width="3" stroke-linejoin="round"/>
      </svg>`,
    alpineTuft: `
      <svg xmlns="http://www.w3.org/2000/svg" width="120" height="100" viewBox="0 0 120 100">
        <path d="M30,90 Q28,70 35,50" stroke="#6b8049" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M45,90 Q46,65 50,45" stroke="#6b8049" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M60,90 Q60,68 60,42" stroke="#6b8049" stroke-width="3" fill="none" stroke-linecap="round"/>
        <circle cx="50" cy="42" r="5" fill="#8a6bb0" stroke="#2a1f18" stroke-width="1.4"/>
        <circle cx="60" cy="38" r="5" fill="#9b7fc4" stroke="#2a1f18" stroke-width="1.4"/>
        <circle cx="38" cy="48" r="4.5" fill="#8a6bb0" stroke="#2a1f18" stroke-width="1.4"/>
      </svg>`,

    // Frostfall Tundra
    frozenShrub: `
      <svg xmlns="http://www.w3.org/2000/svg" width="140" height="130" viewBox="0 0 140 130">
        <circle cx="50" cy="82" r="24" fill="#4f6636" stroke="#2a1f18" stroke-width="3"/>
        <circle cx="85" cy="82" r="22" fill="#4f6636" stroke="#2a1f18" stroke-width="3"/>
        <circle cx="68" cy="65" r="26" fill="#5a7440" stroke="#2a1f18" stroke-width="3"/>
        <path d="M45,100 L40,120" stroke="#bcdfe8" stroke-width="3" stroke-linecap="round"/>
        <path d="M65,105 L62,124" stroke="#bcdfe8" stroke-width="3" stroke-linecap="round"/>
        <path d="M85,100 L90,120" stroke="#bcdfe8" stroke-width="3" stroke-linecap="round"/>
        <path d="M100,92 L106,108" stroke="#bcdfe8" stroke-width="2.5" stroke-linecap="round"/>
      </svg>`,
    snowdrift: `
      <svg xmlns="http://www.w3.org/2000/svg" width="160" height="100" viewBox="0 0 160 100">
        <path d="M10,90 Q40,55 80,65 Q120,50 150,80 L150,95 L10,95 Z" fill="#eef4f6" stroke="#2a1f18" stroke-width="3"/>
        <path d="M30,80 Q50,72 65,76" stroke="#bcdfe8" stroke-width="2" fill="none" opacity="0.7"/>
        <path d="M90,72 Q108,66 122,72" stroke="#bcdfe8" stroke-width="2" fill="none" opacity="0.7"/>
      </svg>`,

    // Sunmeadow Clearing
    wildflowerPatch: `
      <svg xmlns="http://www.w3.org/2000/svg" width="140" height="120" viewBox="0 0 140 120">
        <line x1="35" y1="115" x2="35" y2="80" stroke="#4f6636" stroke-width="3"/>
        <line x1="70" y1="115" x2="70" y2="75" stroke="#4f6636" stroke-width="3"/>
        <line x1="105" y1="115" x2="105" y2="82" stroke="#4f6636" stroke-width="3"/>
        <circle cx="35" cy="80" r="5" fill="#d4a53d" stroke="#2a1f18" stroke-width="1.5"/>
        <circle cx="26" cy="72" r="5" fill="#c9622f" stroke="#2a1f18" stroke-width="1.5"/>
        <circle cx="44" cy="72" r="5" fill="#e0c060" stroke="#2a1f18" stroke-width="1.5"/>
        <circle cx="70" cy="75" r="5" fill="#a63d3d" stroke="#2a1f18" stroke-width="1.5"/>
        <circle cx="61" cy="68" r="5" fill="#e0c060" stroke="#2a1f18" stroke-width="1.5"/>
        <circle cx="79" cy="68" r="5" fill="#9b7fc4" stroke="#2a1f18" stroke-width="1.5"/>
        <circle cx="105" cy="82" r="5" fill="#8a6bb0" stroke="#2a1f18" stroke-width="1.5"/>
        <circle cx="96" cy="75" r="5" fill="#4a6a8a" stroke="#2a1f18" stroke-width="1.5"/>
        <circle cx="114" cy="75" r="5" fill="#d4a53d" stroke="#2a1f18" stroke-width="1.5"/>
      </svg>`,
    wheatGrass: `
      <svg xmlns="http://www.w3.org/2000/svg" width="140" height="130" viewBox="0 0 140 130">
        <path d="M40,125 Q35,95 45,60" stroke="#c9a24a" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path d="M55,125 Q52,90 60,50" stroke="#d4ae55" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path d="M70,125 Q70,88 70,45" stroke="#c9a24a" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path d="M85,125 Q88,90 80,50" stroke="#d4ae55" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path d="M100,125 Q105,95 95,60" stroke="#c9a24a" stroke-width="4" fill="none" stroke-linecap="round"/>
        <ellipse cx="45" cy="58" rx="4" ry="9" fill="#e8c56a" stroke="#2a1f18" stroke-width="1"/>
        <ellipse cx="60" cy="48" rx="4" ry="9" fill="#e8c56a" stroke="#2a1f18" stroke-width="1"/>
        <ellipse cx="80" cy="48" rx="4" ry="9" fill="#e8c56a" stroke="#2a1f18" stroke-width="1"/>
        <ellipse cx="95" cy="58" rx="4" ry="9" fill="#e8c56a" stroke="#2a1f18" stroke-width="1"/>
      </svg>`,
    sunflowerCluster: `
      <svg xmlns="http://www.w3.org/2000/svg" width="140" height="160" viewBox="0 0 140 160">
        <line x1="55" y1="150" x2="58" y2="90" stroke="#4f6636" stroke-width="4"/>
        <line x1="95" y1="150" x2="90" y2="100" stroke="#4f6636" stroke-width="4"/>
        <circle cx="58" cy="80" r="18" fill="#5a4530" stroke="#2a1f18" stroke-width="2.5"/>
        <circle cx="90" cy="90" r="14" fill="#5a4530" stroke="#2a1f18" stroke-width="2.5"/>
        <ellipse cx="58" cy="55" rx="7" ry="14" fill="#e0c060" stroke="#2a1f18" stroke-width="1.4"/>
        <ellipse cx="58" cy="105" rx="7" ry="14" fill="#e0c060" stroke="#2a1f18" stroke-width="1.4"/>
        <ellipse cx="33" cy="80" rx="14" ry="7" fill="#e0c060" stroke="#2a1f18" stroke-width="1.4"/>
        <ellipse cx="83" cy="80" rx="14" ry="7" fill="#e0c060" stroke="#2a1f18" stroke-width="1.4"/>
      </svg>`,

    // Hollow Deep
    glowingFungus: `
      <svg xmlns="http://www.w3.org/2000/svg" width="140" height="130" viewBox="0 0 140 130">
        <defs>
          <radialGradient id="fungusGlow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stop-color="#8fd9b0" stop-opacity="0.6"/>
            <stop offset="1" stop-color="#8fd9b0" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <circle cx="70" cy="70" r="40" fill="url(#fungusGlow)" opacity="0.3"/>
        <rect x="45" y="90" width="10" height="26" rx="4" fill="#3a2c4a" stroke="#2a1f18" stroke-width="2"/>
        <path d="M28,90 Q28,68 50,66 Q72,68 72,90 Q50,98 28,90 Z" fill="#7a5cc4" stroke="#c9a8f0" stroke-width="2.5"/>
        <rect x="80" y="98" width="8" height="20" rx="3" fill="#3a2c4a" stroke="#2a1f18" stroke-width="2"/>
        <path d="M65,98 Q65,80 84,78 Q103,80 103,98 Q84,105 65,98 Z" fill="#5cc4b0" stroke="#a8f0e0" stroke-width="2.5"/>
        <circle cx="50" cy="75" r="2.5" fill="#e8d8ff"/>
        <circle cx="84" cy="85" r="2" fill="#d8fff2"/>
      </svg>`,
    crystalCluster: `
      <svg xmlns="http://www.w3.org/2000/svg" width="140" height="140" viewBox="0 0 140 140">
        <defs>
          <radialGradient id="crystalGlow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stop-color="#bfe3e3" stop-opacity="0.5"/>
            <stop offset="1" stop-color="#bfe3e3" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <circle cx="70" cy="80" r="46" fill="url(#crystalGlow)" opacity="0.25"/>
        <polygon points="50,120 42,80 58,55 70,80 62,120" fill="#9b7fc4" stroke="#e8d8ff" stroke-width="2.5"/>
        <polygon points="85,120 78,70 95,45 108,72 100,120" fill="#7a5cc4" stroke="#d8c8f0" stroke-width="2.5"/>
        <polygon points="105,120 100,90 112,72 122,92 118,120" fill="#9b7fc4" stroke="#e8d8ff" stroke-width="2"/>
      </svg>`,
    stalagmite: `
      <svg xmlns="http://www.w3.org/2000/svg" width="100" height="140" viewBox="0 0 100 140">
        <defs>
          <pattern id="deepHatch" width="2.8" height="2.8" patternUnits="userSpaceOnUse">
            <path d="M0,2.8 L2.8,0" stroke="#2a1f18" stroke-width="1"/>
            <path d="M0,0 L2.8,2.8" stroke="#2a1f18" stroke-width="1"/>
          </pattern>
        </defs>
        <polygon points="50,10 65,90 62,130 38,130 35,90" fill="#6b6480" stroke="#2a1f18" stroke-width="3"/>
        <polygon points="50,10 60,80 50,130 45,130 40,80" fill="url(#deepHatch)" opacity="0.3"/>
      </svg>`,
  };

  const biomeFoliageMeta = {
    reedCluster: { width: 60, height: 60, groundFraction: 130 / 140 },
    mudPool: { width: 172, height: 138, groundFraction: 132 / 160 },
    scree: { width: 118, height: 110, groundFraction: 112 / 130 },
    alpineTuft: { width: 66, height: 55, groundFraction: 90 / 100 },
    frozenShrub: { width: 72, height: 67, groundFraction: 120 / 130 },
    snowdrift: { width: 150, height: 94, groundFraction: 95 / 100 },
    wildflowerPatch: { width: 100, height: 86, groundFraction: 115 / 120 },
    wheatGrass: { width: 66, height: 61, groundFraction: 125 / 130 },
    sunflowerCluster: { width: 78, height: 89, groundFraction: 150 / 160 },
    glowingFungus: { width: 66, height: 61, groundFraction: 118 / 130 },
    crystalCluster: { width: 70, height: 70, groundFraction: 120 / 140 },
    stalagmite: { width: 55, height: 77, groundFraction: 130 / 140 },
  };

  const biomeFoliage = {};
  for (const [key, svg] of Object.entries(biomeFoliageSvgs)) {
    biomeFoliage[key] = { image: svgToImage(svg), width: biomeFoliageMeta[key].width, height: biomeFoliageMeta[key].height, groundFraction: biomeFoliageMeta[key].groundFraction };
  }

  // --- Biome enemy rigs --------------------------------------------------

  // Mire Leech (Marsh Bog) — three body segments in a chain, each animated
  // with an independent phase-lagged bob for an inchworm-style crawl.
  const mireLeechRig = {
    segments: {
      tail: { points: blobPointList(55, 150, 42, 30, 51), fill: "#4a5a3a" },
      mid: { points: blobPointList(100, 135, 38, 28, 52), fill: "#556a44" },
      head: { points: blobPointList(145, 120, 30, 24, 53), fill: "#5f7550" },
    },
    chainOrder: ["tail", "mid", "head"],
    mouth: { x: 150, y: 112, r: 9 },
    fangs: ["M138,100 L130,88", "M152,98 L152,84"],
    eyes: [{ x: 130, y: 86, r: 4 }, { x: 152, y: 82, r: 4 }],
    drips: [{ x: 75, y: 145, rx: 8, ry: 5 }, { x: 45, y: 160, rx: 7, ry: 4 }],
    groundAnchor: { x: 100, y: 170 },
    viewHeight: 200,
  };

  // Crag Ram (Mountain Foothills) — quadruped, same rotate-group rig shape
  // as the golem's limbs, sized for a walk cycle + headbutt telegraph.
  const cragRamRig = {
    segments: {
      torso: { points: blobPointList(95, 125, 46, 34, 61), fill: "#9a9488" },
      head: { points: rockPointList(152, 92, 20, 18, 0.2, 62), fill: "#9a9488" },
      patch1: { points: rockPointList(80, 108, 14, 10, 0.25, 63), fill: "#6b6a5c" },
      patch2: { points: rockPointList(112, 128, 12, 9, 0.25, 64), fill: "#6b6a5c" },
      legFL: { points: legPointList(70, 140, Math.PI / 2, 30, 5), fill: "#7a756a" },
      legFR: { points: legPointList(125, 140, Math.PI / 2, 30, 5), fill: "#7a756a" },
      legBL: { points: legPointList(85, 145, Math.PI / 2, 28, 5), fill: "#8a8478" },
      legBR: { points: legPointList(110, 145, Math.PI / 2, 28, 5), fill: "#8a8478" },
    },
    groups: {
      head: { segments: ["head"], pivot: { x: 140, y: 96 } },
      torso: { segments: ["torso", "patch1", "patch2"], pivot: { x: 95, y: 125 } },
      legFL: { segments: ["legFL"], pivot: { x: 70, y: 140 } },
      legFR: { segments: ["legFR"], pivot: { x: 125, y: 140 } },
      legBL: { segments: ["legBL"], pivot: { x: 85, y: 145 } },
      legBR: { segments: ["legBR"], pivot: { x: 110, y: 145 } },
    },
    headDecor: ["M148,78 Q168,72 172,50 Q158,66 150,72", "M158,80 Q180,78 188,58 Q168,72 158,76"],
    eyes: [{ x: 155, y: 90, r: 3 }],
    fill: "#9a9488",
    groundAnchor: { x: 100, y: 180 },
    viewHeight: 200,
  };

  // Frost Wisp (Frostfall Tundra) — no legs, drifts on a slow bob with a
  // sweeping tail and two loose shard fragments off its back.
  const frostWispRig = {
    segments: {
      body: { points: blobPointList(95, 105, 50, 32, 71), fill: "#dff4f4" },
      head: { points: blobPointList(150, 82, 26, 22, 72), fill: "#eefcfc" },
    },
    tailPath: "M55,110 Q30,120 15,105 Q35,115 50,100",
    tailPivot: { x: 55, y: 110 },
    shards: [
      { points: [{ x: 90, y: 72 }, { x: 96, y: 50 }, { x: 100, y: 74 }] },
      { points: [{ x: 105, y: 70 }, { x: 110, y: 48 }, { x: 114, y: 72 }] },
    ],
    eyes: [{ x: 142, y: 76, r: 5 }, { x: 162, y: 80, r: 5 }],
    groundAnchor: { x: 100, y: 120 },
    viewHeight: 170,
  };

  // Bramble Boar (Sunmeadow Clearing) — same quadruped rig shape as Crag
  // Ram, faster gait, with a thorn-ridge spine and a single tusk instead of
  // rock patches and horns.
  const bramblingBoarRig = {
    segments: {
      body: { points: blobPointList(105, 110, 55, 36, 81), fill: "#8a6a48" },
      head: { points: blobPointList(175, 92, 28, 22, 82), fill: "#8a6a48" },
      legFL: { points: legPointList(75, 128, Math.PI / 2, 26, 5), fill: "#5a4530" },
      legFR: { points: legPointList(155, 128, Math.PI / 2, 26, 5), fill: "#5a4530" },
      legBL: { points: legPointList(100, 132, Math.PI / 2, 24, 5), fill: "#6b5238" },
      legBR: { points: legPointList(135, 132, Math.PI / 2, 24, 5), fill: "#6b5238" },
    },
    groups: {
      head: { segments: ["head"], pivot: { x: 150, y: 92 } },
      torso: { segments: ["body"], pivot: { x: 105, y: 110 } },
      legFL: { segments: ["legFL"], pivot: { x: 75, y: 128 } },
      legFR: { segments: ["legFR"], pivot: { x: 155, y: 128 } },
      legBL: { segments: ["legBL"], pivot: { x: 100, y: 132 } },
      legBR: { segments: ["legBR"], pivot: { x: 135, y: 132 } },
    },
    bristlePath: "M60,100 Q75,85 92,95 Q108,80 125,92 Q142,80 158,90",
    tuskPoints: [{ x: 192, y: 98 }, { x: 202, y: 102 }, { x: 192, y: 110 }],
    eyes: [{ x: 188, y: 88, r: 3 }],
    fill: "#8a6a48",
    groundAnchor: { x: 110, y: 155 },
    viewHeight: 170,
  };

  // Crystal Crawler (Hollow Deep) — 8 legs generated around one shared body
  // pivot, animated as a rippling alternating gait rather than a
  // facing-based walk, since it can move in any direction.
  const crystalCrawlerRig = {
    bodyPoints: rockPointList(100, 100, 32, 26, 0.22, 91),
    legAngles: [0, 1, 2, 3, 4, 5, 6, 7].map((i) => (i / 8) * Math.PI * 2),
    legPivot: { x: 100, y: 100 },
    legLength: 55,
    legWidth: 4,
    eyes: [{ x: 90, y: 95, r: 4 }, { x: 110, y: 95, r: 4 }],
    mouth: { x: 100, y: 112, r: 3 },
    groundAnchor: { x: 100, y: 100 },
    viewHeight: 200,
  };

  const enemyRigs = { golem: golemRig, mireLeech: mireLeechRig, cragRam: cragRamRig, frostWisp: frostWispRig, bramblingBoar: bramblingBoarRig, crystalCrawler: crystalCrawlerRig };

  return { trees, TREE_VIEWBOX, foliage, mushrooms, rocks, campfire, ambient, spellEffects, golemRig, biomeTrees, biomeFoliage, enemyRigs };
})();
