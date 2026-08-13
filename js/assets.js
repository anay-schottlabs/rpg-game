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

  // Same tapered-capsule shape as legPointList, just from two absolute
  // endpoints instead of a start point + angle/length — the player rig
  // below is transcribed straight from the design doc's absolute path
  // coordinates, so this is the more convenient form there.
  function limbCapsule(x0, y0, x1, y1, width) {
    return legPointList(x0, y0, Math.atan2(y1 - y0, x1 - x0), Math.hypot(x1 - x0, y1 - y0), width);
  }

  // Flattens a quadratic bezier (design-doc SVG "Q" commands) into a point
  // list — the same curve-to-polyline simplification drawEnemyPathLine()
  // already applies to the golem's cracks, just kept as actual fill
  // geometry here instead of a stroked line.
  function sampleQuadratic(p0, c, p1, segments = 6) {
    const pts = [];
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const mt = 1 - t;
      pts.push({ x: mt * mt * p0.x + 2 * mt * t * c.x + t * t * p1.x, y: mt * mt * p0.y + 2 * mt * t * c.y + t * t * p1.y });
    }
    return pts;
  }

  // --- Player rig --------------------------------------------------------

  // Design kit's "Player Character" section: a wizard built from separate
  // head+hat/torso/arms/legs/weapon pieces over a 200x320 local space, so
  // the weapon can swing independently of the walk cycle (game.js animates
  // each group below by rotating it around its own pivot). Curved pieces
  // (the hat cone, cloak, weapon gem) are flattened from the doc's SVG "Q"
  // curves into fill polygons via sampleQuadratic(); the limbs are drawn as
  // tapered capsules via limbCapsule() rather than stroked lines, since
  // game.js's shared polygon renderer only fills closed shapes.
  const playerRig = {
    segments: {
      legL: { kind: "polygon", points: limbCapsule(78, 222, 73, 296, 8), fill: "#3a3a4a" },
      bootL: { kind: "ellipse", center: { x: 73, y: 300 }, rx: 13, ry: 9, fill: "#3a2c1e" },
      legR: { kind: "polygon", points: limbCapsule(122, 222, 127, 296, 8), fill: "#3a3a4a" },
      bootR: { kind: "ellipse", center: { x: 127, y: 300 }, rx: 13, ry: 9, fill: "#3a2c1e" },

      armLUpper: { kind: "polygon", points: limbCapsule(58, 140, 48, 163, 8), fill: "#4a5a7a" },
      armLLower: { kind: "polygon", points: limbCapsule(48, 163, 50, 188, 8), fill: "#4a5a7a" },
      handL: { kind: "ellipse", center: { x: 50, y: 191 }, rx: 9, ry: 9, fill: "#e8c9a0" },

      armRUpper: { kind: "polygon", points: limbCapsule(142, 140, 152, 163, 8), fill: "#4a5a7a" },
      armRLower: { kind: "polygon", points: limbCapsule(152, 163, 150, 188, 8), fill: "#4a5a7a" },
      handR: { kind: "ellipse", center: { x: 150, y: 191 }, rx: 9, ry: 9, fill: "#e8c9a0" },

      // Sized up from the design doc's own proportions (longer shaft,
      // wider/taller gem) so the weapon reads clearly at the player's small
      // on-screen scale — see PLAYER_RIG_SCALE's comment in game.js.
      weaponShaft: { kind: "polygon", points: limbCapsule(150, 191, 168, 88, 4.5), fill: "#5a4530" },
      weaponGem: {
        kind: "polygon",
        points: [
          ...sampleQuadratic({ x: 168, y: 88 }, { x: 140, y: 55 }, { x: 168, y: 28 }, 6),
          ...sampleQuadratic({ x: 168, y: 28 }, { x: 196, y: 55 }, { x: 168, y: 88 }, 6).slice(1),
        ],
        fill: "#bcdfe8",
      },

      torso: {
        kind: "polygon",
        points: [
          ...sampleQuadratic({ x: 55, y: 120 }, { x: 100, y: 105 }, { x: 145, y: 120 }, 6),
          { x: 152, y: 225 },
          ...sampleQuadratic({ x: 152, y: 225 }, { x: 100, y: 238 }, { x: 48, y: 225 }, 6),
        ],
        fill: "#4a5a7a",
      },
      torsoClasp: { kind: "ellipse", center: { x: 100, y: 118 }, rx: 7, ry: 7, fill: "#d4a53d" },

      head: { kind: "ellipse", center: { x: 100, y: 82 }, rx: 29, ry: 29, fill: "#e8c9a0" },
      hatBrim: { kind: "ellipse", center: { x: 100, y: 56 }, rx: 50, ry: 13, fill: "#4a5a7a" },
      hatCone: {
        kind: "polygon",
        points: [
          ...sampleQuadratic({ x: 66, y: 58 }, { x: 90, y: 6 }, { x: 106, y: 20 }, 5),
          ...sampleQuadratic({ x: 106, y: 20 }, { x: 114, y: 30 }, { x: 92, y: 40 }, 5).slice(1),
          ...sampleQuadratic({ x: 92, y: 40 }, { x: 120, y: 46 }, { x: 134, y: 58 }, 5).slice(1),
        ],
        fill: "#4a5a7a",
      },
      hatBand: { kind: "polygon", points: [{ x: 66, y: 50 }, { x: 134, y: 50 }, { x: 134, y: 59 }, { x: 66, y: 59 }], fill: "#d4a53d" },
      hatGem: { kind: "polygon", points: [{ x: 94, y: 47 }, { x: 106, y: 47 }, { x: 106, y: 60 }, { x: 94, y: 60 }], fill: "#e8dcc0" },
    },
    // Matches the design doc's own dashed pivot markers exactly: hips for
    // the walk cycle, shoulders for arm sway, and the weapon's own pivot at
    // the hand grip for its swing arc (see the doc's "Dashed circles mark
    // pivots" caption).
    groups: {
      legL: { segments: ["legL", "bootL"], pivot: { x: 78, y: 222 } },
      legR: { segments: ["legR", "bootR"], pivot: { x: 122, y: 222 } },
      armL: { segments: ["armLUpper", "armLLower", "handL"], pivot: { x: 58, y: 132 } },
      armR: { segments: ["armRUpper", "armRLower", "handR"], pivot: { x: 142, y: 132 } },
      weapon: { segments: ["weaponShaft", "weaponGem"], pivot: { x: 150, y: 191 } },
      torso: { segments: ["torso", "torsoClasp"], pivot: { x: 100, y: 115 } },
      head: { segments: ["head", "hatBrim", "hatCone", "hatBand", "hatGem"], pivot: { x: 100, y: 112 } },
    },
    weaponGlowCenter: { x: 168, y: 58 }, // drawn as a radial gradient in game.js, not a flat-fill segment
    groundAnchor: { x: 100, y: 308 },
  };

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

    // Hollow Deep expansion — design kit's "Set Pieces" (large, one-of-a-
    // kind landmarks — see pickFoliage()'s low weight for these four in
    // game.js), "Crystal Formations", "Fungus & Growth", and "Ambient &
    // Weird Details" sections. The "Overhangs & Cave Rock" section (wall/
    // ceiling framing pieces) and "Luminous Vein Crack (Wall)" aren't
    // included — this game has no wall/ceiling concept to hang them on,
    // just a flat scattered ground plane.
    motherFungus: `
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="240" viewBox="0 0 200 240">
        <defs>
          <radialGradient id="windGlow" cx="0.5" cy="0.55" r="0.5">
            <stop offset="0" stop-color="#bfe3e3" stop-opacity="0.5"/>
            <stop offset="1" stop-color="#bfe3e3" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <ellipse cx="100" cy="228" rx="70" ry="10" fill="#2a1f18" opacity="0.3"/>
        <circle cx="100" cy="150" r="80" fill="url(#windGlow)" opacity="0.3"/>
        <rect x="82" y="150" width="36" height="70" rx="8" fill="#3a2c4a" stroke="#2a1f18" stroke-width="3"/>
        <path d="M20,150 Q20,95 100,90 Q180,95 180,150 Q140,170 100,164 Q60,170 20,150 Z" fill="#7a5cc4" stroke="#c9a8f0" stroke-width="4"/>
        <path d="M20,150 Q60,140 100,144 Q140,140 180,150" fill="none" stroke="#4a3a6a" stroke-width="2" opacity="0.6"/>
        <path d="M40,146 Q70,150 100,150 Q130,150 160,146" fill="none" stroke="#4a3a6a" stroke-width="1.6" opacity="0.5"/>
        <circle cx="55" cy="118" r="4" fill="#e8d8ff"/>
        <circle cx="140" cy="110" r="3.5" fill="#d8fff2"/>
        <circle cx="100" cy="98" r="3" fill="#e8d8ff"/>
        <circle cx="80" cy="130" r="2.5" fill="#d8fff2" opacity="0.8"/>
        <circle cx="125" cy="135" r="2.5" fill="#e8d8ff" opacity="0.8"/>
      </svg>`,
    crackedGeodeChamber: `
      <svg xmlns="http://www.w3.org/2000/svg" width="220" height="200" viewBox="0 0 220 200">
        <defs>
          <radialGradient id="caveGlow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stop-color="#9b7fc4" stop-opacity="0.55"/>
            <stop offset="1" stop-color="#9b7fc4" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <ellipse cx="110" cy="190" rx="90" ry="10" fill="#2a1f18" opacity="0.3"/>
        <circle cx="110" cy="110" r="80" fill="url(#caveGlow)" opacity="0.5"/>
        <polygon points="30,180 20,100 45,40 110,20 175,42 198,102 190,180" fill="#6b6480" stroke="#2a1f18" stroke-width="4"/>
        <path d="M45,40 L95,95 L70,180" fill="none" stroke="#2a1f18" stroke-width="3.5"/>
        <path d="M175,42 L120,90 L145,180" fill="none" stroke="#2a1f18" stroke-width="3.5"/>
        <polygon points="95,95 110,60 130,88 120,90 145,110 100,120 78,105" fill="#7a5cc4" stroke="#e8d8ff" stroke-width="2.5"/>
        <polygon points="82,110 100,120 90,150 70,140" fill="#9b7fc4" stroke="#e8d8ff" stroke-width="2"/>
        <polygon points="120,90 145,110 138,145 118,130" fill="#5a4a8a" stroke="#c9a8f0" stroke-width="2"/>
        <circle cx="110" cy="100" r="8" fill="#8fe0ff"/>
      </svg>`,
    rootCurtain: `
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="260" viewBox="0 0 200 260">
        <rect x="0" y="0" width="200" height="26" fill="#4a4055" stroke="#2a1f18" stroke-width="3"/>
        <path d="M40,26 Q34,90 44,140 Q48,155 38,168" stroke="#5a4530" stroke-width="9" fill="none" stroke-linecap="round"/>
        <circle cx="38" cy="170" r="8" fill="#5cc4b0" stroke="#a8f0e0" stroke-width="2"/>
        <path d="M80,26 Q88,110 76,175 Q72,192 82,208" stroke="#5a4530" stroke-width="10" fill="none" stroke-linecap="round"/>
        <circle cx="83" cy="211" r="9" fill="#7a5cc4" stroke="#c9a8f0" stroke-width="2"/>
        <path d="M130,26 Q140,80 128,120 Q122,135 132,148" stroke="#5a4530" stroke-width="8" fill="none" stroke-linecap="round"/>
        <circle cx="132" cy="150" r="7" fill="#5cc4b0" stroke="#a8f0e0" stroke-width="2"/>
        <path d="M165,26 Q172,100 160,155 Q156,172 166,190" stroke="#5a4530" stroke-width="9" fill="none" stroke-linecap="round"/>
        <circle cx="166" cy="192" r="8" fill="#7a5cc4" stroke="#c9a8f0" stroke-width="2"/>
        <circle cx="38" cy="190" r="2.5" fill="#a8f0e0" opacity="0.7"/>
        <circle cx="83" cy="232" r="3" fill="#c9a8f0" opacity="0.7"/>
        <circle cx="166" cy="212" r="2.5" fill="#c9a8f0" opacity="0.6"/>
      </svg>`,
    crystalFalls: `
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="260" viewBox="0 0 200 260">
        <defs>
          <radialGradient id="crystalCoreGlow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stop-color="#8fe0ff" stop-opacity="0.9"/>
            <stop offset="1" stop-color="#8fe0ff" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <polygon points="10,0 60,0 30,200 0,220" fill="#6b6480" stroke="#2a1f18" stroke-width="3.5"/>
        <polygon points="190,0 145,0 175,190 200,215" fill="#6b6480" stroke="#2a1f18" stroke-width="3.5"/>
        <path d="M65,10 Q75,90 62,160 Q58,185 68,200" stroke="#bfe3e3" stroke-width="14" fill="none" opacity="0.35" stroke-linecap="round"/>
        <path d="M85,10 Q92,90 84,165 Q80,190 88,210" stroke="#d8f7ff" stroke-width="8" fill="none" opacity="0.55" stroke-linecap="round"/>
        <path d="M110,10 Q100,90 112,160 Q118,185 108,205" stroke="#bfe3e3" stroke-width="10" fill="none" opacity="0.4" stroke-linecap="round"/>
        <ellipse cx="90" cy="235" rx="70" ry="18" fill="url(#crystalCoreGlow)" opacity="0.6"/>
        <path d="M40,232 Q90,244 150,230" stroke="#8fe0ff" stroke-width="3" fill="none" opacity="0.7"/>
        <circle cx="80" cy="60" r="2.5" fill="#e8f9ff"/>
        <circle cx="100" cy="120" r="2" fill="#e8f9ff" opacity="0.8"/>
      </svg>`,
    stalactiteCeiling: `
      <svg xmlns="http://www.w3.org/2000/svg" width="100" height="130" viewBox="0 0 100 130">
        <defs>
          <pattern id="deepHatch" width="2.8" height="2.8" patternUnits="userSpaceOnUse">
            <path d="M0,2.8 L2.8,0" stroke="#2a1f18" stroke-width="1"/>
            <path d="M0,0 L2.8,2.8" stroke="#2a1f18" stroke-width="1"/>
          </pattern>
        </defs>
        <polygon points="35,0 65,0 62,50 50,80 38,50" fill="#6b6480" stroke="#2a1f18" stroke-width="3"/>
        <polygon points="40,0 60,0 55,50 50,80 45,50" fill="url(#deepHatch)" opacity="0.3"/>
        <circle cx="50" cy="88" r="3" fill="#9b7fc4" opacity="0.8"/>
      </svg>`,
    crystalSpire: `
      <svg xmlns="http://www.w3.org/2000/svg" width="120" height="180" viewBox="0 0 120 180">
        <defs>
          <radialGradient id="caveGlow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stop-color="#9b7fc4" stop-opacity="0.55"/>
            <stop offset="1" stop-color="#9b7fc4" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <circle cx="60" cy="120" r="60" fill="url(#caveGlow)" opacity="0.4"/>
        <polygon points="55,10 68,90 60,175 46,175 40,88" fill="#5a4a8a" stroke="#c9a8f0" stroke-width="3.5"/>
        <polygon points="60,10 65,90 60,175 55,175 52,88" fill="#8fe0ff" opacity="0.35"/>
        <polygon points="20,120 30,140 22,175" fill="#9b7fc4" stroke="#c9a8f0" stroke-width="2"/>
        <polygon points="100,110 92,140 102,172" fill="#7a5cc4" stroke="#c9a8f0" stroke-width="2"/>
      </svg>`,
    shatteredGeodeRubble: `
      <svg xmlns="http://www.w3.org/2000/svg" width="160" height="100" viewBox="0 0 160 100">
        <ellipse cx="80" cy="88" rx="72" ry="10" fill="#2a1f18" opacity="0.3"/>
        <polygon points="20,88 14,68 30,58 40,80" fill="#7a5cc4" stroke="#c9a8f0" stroke-width="2"/>
        <polygon points="48,88 42,62 60,48 68,78" fill="#9b7fc4" stroke="#e8d8ff" stroke-width="2"/>
        <polygon points="80,88 74,72 88,64 96,84" fill="#5a4a8a" stroke="#c9a8f0" stroke-width="2"/>
        <polygon points="112,88 106,66 124,54 132,80" fill="#7a5cc4" stroke="#c9a8f0" stroke-width="2"/>
        <polygon points="140,88 136,74 148,68 152,84" fill="#9b7fc4" stroke="#e8d8ff" stroke-width="1.6"/>
        <circle cx="55" cy="60" r="2" fill="#e8d8ff"/>
        <circle cx="118" cy="65" r="2" fill="#e8d8ff"/>
      </svg>`,
    crystalArch: `
      <svg xmlns="http://www.w3.org/2000/svg" width="240" height="150" viewBox="0 0 240 150">
        <defs>
          <radialGradient id="caveGlow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stop-color="#9b7fc4" stop-opacity="0.55"/>
            <stop offset="1" stop-color="#9b7fc4" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <ellipse cx="120" cy="140" rx="105" ry="9" fill="#2a1f18" opacity="0.3"/>
        <circle cx="120" cy="70" r="70" fill="url(#caveGlow)" opacity="0.35"/>
        <path d="M20,138 Q22,70 60,40 Q80,25 100,45" fill="none" stroke="#5a4a8a" stroke-width="22" stroke-linecap="round"/>
        <path d="M220,138 Q218,70 180,40 Q160,25 140,45" fill="none" stroke="#7a5cc4" stroke-width="22" stroke-linecap="round"/>
        <path d="M20,138 Q22,70 60,40 Q80,25 100,45" fill="none" stroke="#c9a8f0" stroke-width="3"/>
        <path d="M220,138 Q218,70 180,40 Q160,25 140,45" fill="none" stroke="#e8d8ff" stroke-width="3"/>
        <circle cx="100" cy="45" r="10" fill="#8fe0ff" opacity="0.9"/>
        <circle cx="140" cy="45" r="10" fill="#8fe0ff" opacity="0.9"/>
      </svg>`,
    fairyRing: `
      <svg xmlns="http://www.w3.org/2000/svg" width="170" height="110" viewBox="0 0 170 110">
        <ellipse cx="85" cy="100" rx="75" ry="8" fill="#2a1f18" opacity="0.25"/>
        <ellipse cx="85" cy="82" rx="72" ry="16" fill="none" stroke="#5cc4b0" stroke-width="2" opacity="0.4" stroke-dasharray="3 4"/>
        <circle cx="20" cy="86" r="7" fill="#5cc4b0" stroke="#a8f0e0" stroke-width="1.8"/>
        <circle cx="45" cy="94" r="6" fill="#7a5cc4" stroke="#c9a8f0" stroke-width="1.8"/>
        <circle cx="75" cy="98" r="8" fill="#5cc4b0" stroke="#a8f0e0" stroke-width="2"/>
        <circle cx="108" cy="96" r="6.5" fill="#7a5cc4" stroke="#c9a8f0" stroke-width="1.8"/>
        <circle cx="135" cy="90" r="7" fill="#5cc4b0" stroke="#a8f0e0" stroke-width="1.8"/>
        <circle cx="155" cy="80" r="5.5" fill="#7a5cc4" stroke="#c9a8f0" stroke-width="1.6"/>
      </svg>`,
    sporePodCluster: `
      <svg xmlns="http://www.w3.org/2000/svg" width="140" height="160" viewBox="0 0 140 160">
        <defs>
          <radialGradient id="healGlow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stop-color="#8fd9b0" stop-opacity="0.6"/>
            <stop offset="1" stop-color="#8fd9b0" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <circle cx="70" cy="90" r="46" fill="url(#healGlow)" opacity="0.2"/>
        <path d="M45,150 L45,110" stroke="#3a2c4a" stroke-width="6" stroke-linecap="round"/>
        <ellipse cx="45" cy="100" rx="18" ry="24" fill="#5cc4b0" stroke="#a8f0e0" stroke-width="2.5"/>
        <path d="M75,150 L75,105" stroke="#3a2c4a" stroke-width="7" stroke-linecap="round"/>
        <ellipse cx="75" cy="88" rx="22" ry="30" fill="#7a5cc4" stroke="#c9a8f0" stroke-width="2.5"/>
        <path d="M62,60 Q75,50 88,60 Q90,72 75,80 Q60,72 62,60 Z" fill="#c9a8f0" opacity="0.5"/>
        <circle cx="72" cy="55" r="3" fill="#e8d8ff" opacity="0.9"/>
        <circle cx="80" cy="48" r="2.2" fill="#e8d8ff" opacity="0.7"/>
        <circle cx="65" cy="45" r="2" fill="#e8d8ff" opacity="0.6"/>
        <path d="M105,150 L105,118" stroke="#3a2c4a" stroke-width="5" stroke-linecap="round"/>
        <ellipse cx="105" cy="110" rx="14" ry="18" fill="#5cc4b0" stroke="#a8f0e0" stroke-width="2"/>
      </svg>`,
    canopyCap: `
      <svg xmlns="http://www.w3.org/2000/svg" width="220" height="170" viewBox="0 0 220 170">
        <defs>
          <radialGradient id="windGlow" cx="0.5" cy="0.55" r="0.5">
            <stop offset="0" stop-color="#bfe3e3" stop-opacity="0.5"/>
            <stop offset="1" stop-color="#bfe3e3" stop-opacity="0"/>
          </radialGradient>
          <radialGradient id="healGlow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stop-color="#8fd9b0" stop-opacity="0.6"/>
            <stop offset="1" stop-color="#8fd9b0" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <circle cx="110" cy="90" r="90" fill="url(#windGlow)" opacity="0.2"/>
        <rect x="98" y="90" width="24" height="60" fill="#3a2c4a" stroke="#2a1f18" stroke-width="2.5"/>
        <path d="M10,90 Q10,20 110,15 Q210,20 210,90 Q160,102 110,98 Q60,102 10,90 Z" fill="#5cc4b0" stroke="#a8f0e0" stroke-width="3.5"/>
        <path d="M15,86 Q60,96 110,94 Q160,96 205,86" fill="none" stroke="#2a6a5a" stroke-width="1.5" opacity="0.6"/>
        <path d="M110,20 L110,94 M45,35 L100,92 M175,35 L120,92 M20,80 L95,94 M200,80 L125,94" stroke="#2a6a5a" stroke-width="1.2" opacity="0.5"/>
        <ellipse cx="110" cy="150" rx="60" ry="14" fill="url(#healGlow)" opacity="0.55"/>
      </svg>`,
    hangingTendril: `
      <svg xmlns="http://www.w3.org/2000/svg" width="60" height="160" viewBox="0 0 60 160">
        <path d="M30,0 Q10,60 28,110 Q34,128 24,145" stroke="#3a6a5a" stroke-width="6" fill="none" stroke-linecap="round"/>
        <path d="M28,40 Q40,44 42,54" stroke="#3a6a5a" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M20,80 Q10,84 8,92" stroke="#3a6a5a" stroke-width="3" fill="none" stroke-linecap="round"/>
        <circle cx="24" cy="148" r="9" fill="#5cc4b0" stroke="#a8f0e0" stroke-width="2.5"/>
      </svg>`,
    cavePearls: `
      <svg xmlns="http://www.w3.org/2000/svg" width="190" height="130" viewBox="0 0 190 130">
        <ellipse cx="95" cy="90" rx="85" ry="35" fill="#3a2c4a" stroke="#2a1f18" stroke-width="3"/>
        <ellipse cx="95" cy="86" rx="70" ry="26" fill="#4a3a5a" stroke="#2a1f18" stroke-width="2.5"/>
        <circle cx="65" cy="88" r="12" fill="#e8e0ff" stroke="#2a1f18" stroke-width="2"/>
        <circle cx="95" cy="96" r="9" fill="#d8c8ff" stroke="#2a1f18" stroke-width="2"/>
        <circle cx="125" cy="86" r="14" fill="#e8e0ff" stroke="#2a1f18" stroke-width="2"/>
        <circle cx="60" cy="83" r="4" fill="#fff" opacity="0.7"/>
        <circle cx="120" cy="80" r="5" fill="#fff" opacity="0.7"/>
      </svg>`,
    fungalCrystalHybrid: `
      <svg xmlns="http://www.w3.org/2000/svg" width="140" height="160" viewBox="0 0 140 160">
        <defs>
          <radialGradient id="caveGlow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stop-color="#9b7fc4" stop-opacity="0.55"/>
            <stop offset="1" stop-color="#9b7fc4" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <circle cx="70" cy="100" r="46" fill="url(#caveGlow)" opacity="0.3"/>
        <rect x="60" y="115" width="10" height="30" rx="4" fill="#3a2c4a" stroke="#2a1f18" stroke-width="2"/>
        <path d="M30,115 Q30,80 70,76 Q110,80 110,115 Q90,124 70,120 Q50,124 30,115 Z" fill="#5cc4b0" stroke="#a8f0e0" stroke-width="3"/>
        <polygon points="70,30 78,70 90,80 68,82 55,72 62,70" fill="#7a5cc4" stroke="#c9a8f0" stroke-width="2.5"/>
        <polygon points="88,40 96,66 108,74 90,74" fill="#9b7fc4" stroke="#e8d8ff" stroke-width="2"/>
        <circle cx="76" cy="45" r="2.5" fill="#e8d8ff"/>
      </svg>`,
    driftingSporeMotes: `
      <svg xmlns="http://www.w3.org/2000/svg" width="140" height="140" viewBox="0 0 140 140">
        <defs>
          <radialGradient id="caveGlow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stop-color="#9b7fc4" stop-opacity="0.55"/>
            <stop offset="1" stop-color="#9b7fc4" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <circle cx="70" cy="70" r="60" fill="url(#caveGlow)" opacity="0.25"/>
        <circle cx="45" cy="55" r="4" fill="#e8d8ff" opacity="0.9"/>
        <circle cx="80" cy="40" r="3" fill="#d8fff2" opacity="0.8"/>
        <circle cx="100" cy="75" r="4.5" fill="#e8d8ff" opacity="0.85"/>
        <circle cx="60" cy="95" r="3.5" fill="#d8fff2" opacity="0.75"/>
        <circle cx="95" cy="105" r="3" fill="#e8d8ff" opacity="0.7"/>
        <circle cx="35" cy="85" r="2.5" fill="#d8fff2" opacity="0.65"/>
        <path d="M45,55 Q55,48 80,40" stroke="#e8d8ff" stroke-width="1" fill="none" opacity="0.3" stroke-dasharray="2 3"/>
        <path d="M100,75 Q80,90 60,95" stroke="#d8fff2" stroke-width="1" fill="none" opacity="0.3" stroke-dasharray="2 3"/>
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
    // Hollow Deep expansion (see the matching SVGs above).
    motherFungus: { width: 130, height: 156, groundFraction: 228 / 240 },
    crackedGeodeChamber: { width: 141, height: 128, groundFraction: 190 / 200 },
    rootCurtain: { width: 110, height: 143, groundFraction: 0.85 },
    crystalFalls: { width: 100, height: 130, groundFraction: 0.97 },
    stalactiteCeiling: { width: 55, height: 72, groundFraction: 88 / 130 },
    crystalSpire: { width: 66, height: 99, groundFraction: 175 / 180 },
    shatteredGeodeRubble: { width: 85, height: 53, groundFraction: 88 / 100 },
    crystalArch: { width: 125, height: 78, groundFraction: 140 / 150 },
    fairyRing: { width: 95, height: 62, groundFraction: 100 / 110 },
    sporePodCluster: { width: 80, height: 91, groundFraction: 150 / 160 },
    canopyCap: { width: 141, height: 109, groundFraction: 150 / 170 },
    hangingTendril: { width: 38, height: 101, groundFraction: 148 / 160 },
    cavePearls: { width: 101, height: 69, groundFraction: 125 / 130 },
    fungalCrystalHybrid: { width: 78, height: 90, groundFraction: 145 / 160 },
    driftingSporeMotes: { width: 70, height: 70, groundFraction: 0.5 },
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

  // Trainees (Village Arena, "Training Battles" — Blue Sash / Red Sash) —
  // same segmented golem-family shape as the player/Chief rigs (head/torso/
  // armL/armR/legL/legR groups, so drawGolemEnemy()/computeGolemAngles()
  // work unchanged), built from the doc's own Q-curve paths via
  // sampleQuadratic()/limbCapsule(). The two share identical geometry,
  // just recolored per the doc's two sash variants.
  function traineeRig(colors) {
    return {
      segments: {
        head: { kind: "ellipse", center: { x: 80, y: 68 }, rx: 20, ry: 20, fill: "#e8c9a0" },
        hair: {
          kind: "polygon",
          points: [
            ...sampleQuadratic({ x: 60, y: 60 }, { x: 80, y: 46 }, { x: 100, y: 60 }, 5),
            ...sampleQuadratic({ x: 100, y: 60 }, { x: 98, y: 50 }, { x: 80, y: 48 }, 5).slice(1),
            ...sampleQuadratic({ x: 80, y: 48 }, { x: 62, y: 50 }, { x: 60, y: 60 }, 5).slice(1),
          ],
          fill: colors.hair,
        },
        torso: {
          kind: "polygon",
          points: [
            ...sampleQuadratic({ x: 55, y: 95 }, { x: 80, y: 86 }, { x: 105, y: 95 }, 6),
            { x: 100, y: 152 },
            ...sampleQuadratic({ x: 100, y: 152 }, { x: 80, y: 160 }, { x: 60, y: 152 }, 6),
          ],
          fill: colors.robe,
        },
        belt: { kind: "polygon", points: [{ x: 64, y: 140 }, { x: 96, y: 140 }, { x: 96, y: 148 }, { x: 64, y: 148 }], fill: "#2a1f18" },
        badge: {
          kind: "polygon",
          points: [
            { x: 132, y: 72 }, { x: 135, y: 80 }, { x: 143, y: 80 }, { x: 136, y: 85 }, { x: 139, y: 93 },
            { x: 132, y: 88 }, { x: 125, y: 93 }, { x: 128, y: 85 }, { x: 121, y: 80 }, { x: 129, y: 80 },
          ],
          fill: "#e8e08a",
        },

        armLUpper: { kind: "polygon", points: limbCapsule(58, 100, 46, 113.5, 7), fill: colors.sleeve },
        armLLower: { kind: "polygon", points: limbCapsule(46, 113.5, 46, 130, 7), fill: colors.sleeve },
        handL: { kind: "ellipse", center: { x: 46, y: 130 }, rx: 9, ry: 9, fill: "#e8c9a0" },
        armRUpper: { kind: "polygon", points: limbCapsule(102, 100, 116, 101, 7), fill: colors.sleeve },
        armRLower: { kind: "polygon", points: limbCapsule(116, 101, 122, 88, 7), fill: colors.sleeve },
        handR: { kind: "ellipse", center: { x: 122, y: 88 }, rx: 9, ry: 9, fill: "#e8c9a0" },

        legL: {
          kind: "polygon",
          points: [
            ...sampleQuadratic({ x: 56, y: 148 }, { x: 68, y: 148 }, { x: 72, y: 150 }, 4),
            { x: 66, y: 205 },
            ...sampleQuadratic({ x: 66, y: 205 }, { x: 56, y: 208 }, { x: 48, y: 203 }, 4),
          ],
          fill: colors.pants,
        },
        legR: {
          kind: "polygon",
          points: [
            ...sampleQuadratic({ x: 88, y: 150 }, { x: 92, y: 148 }, { x: 104, y: 148 }, 4),
            { x: 112, y: 203 },
            ...sampleQuadratic({ x: 112, y: 203 }, { x: 104, y: 208 }, { x: 94, y: 205 }, 4),
          ],
          fill: colors.pants,
        },
      },
      groups: {
        head: { segments: ["head", "hair"], pivot: { x: 80, y: 86 } },
        torso: { segments: ["torso", "belt", "badge"], pivot: { x: 80, y: 95 } },
        armL: { segments: ["armLUpper", "armLLower", "handL"], pivot: { x: 58, y: 100 } },
        armR: { segments: ["armRUpper", "armRLower", "handR"], pivot: { x: 102, y: 100 } },
        legL: { segments: ["legL"], pivot: { x: 64, y: 148 } },
        legR: { segments: ["legR"], pivot: { x: 96, y: 148 } },
      },
      eyes: [{ x: 74, y: 66, r: 2.5 }, { x: 86, y: 66, r: 2.5 }],
      groundAnchor: { x: 80, y: 208 },
      viewHeight: 220,
    };
  }

  const traineeBlueRig = traineeRig({ robe: "#4a6a8a", sleeve: "#4a6a8a", pants: "#2a3a4a", hair: "#5a4530" });
  const traineeRedRig = traineeRig({ robe: "#a63d3d", sleeve: "#a63d3d", pants: "#3a2418", hair: "#3a2c1e" });

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

  // Crystal Golem (Boss Arenas) — same fused-part rig shape as the regular
  // golem (reuses drawGolemEnemy's renderer in game.js unmodified), scaled
  // up with a bigger local coordinate space, a purple crystal palette, and
  // extra fixed decorations (shoulder/head shard clusters, a glowing chest
  // core) the plain golemRig doesn't have.
  const crystalGolemRig = {
    segments: {
      head: { points: rockPointList(150, 55, 32, 27, 0.16, 301), fill: "#5a4a8a" },
      torsoMain: { points: rockPointList(150, 175, 72, 66, 0.14, 302), fill: "#5a4a8a" },
      torsoSecondary: { points: rockPointList(103, 205, 34, 32, 0.18, 303), fill: "#5a4a8a" },
      armLUpper: { points: rockPointList(52, 172, 27, 32, 0.2, 304), fill: "#5a4a8a" },
      armLLower: { points: rockPointList(38, 240, 21, 27, 0.22, 305), fill: "#5a4a8a" },
      armRUpper: { points: rockPointList(248, 172, 27, 32, 0.2, 306), fill: "#5a4a8a" },
      armRLower: { points: rockPointList(262, 240, 21, 27, 0.22, 307), fill: "#5a4a8a" },
      legL: { points: rockPointList(118, 302, 32, 36, 0.16, 308), fill: "#4a3a6a" },
      legR: { points: rockPointList(182, 302, 32, 36, 0.16, 309), fill: "#4a3a6a" },
      footL: { points: rockPointList(114, 348, 28, 17, 0.18, 310), fill: "#3a2c5a" },
      footR: { points: rockPointList(186, 348, 28, 17, 0.18, 311), fill: "#3a2c5a" },
    },
    // Pivots follow the same hand-tuned pattern as the regular golem: arm
    // pivots sit right at the upper-arm segment's own center (shoulder
    // attaches there), while head/leg pivots sit partway from their
    // segment's center toward the torso's center (roughly a quarter of the
    // way for the head, a fifth for the legs).
    groups: {
      head: { segments: ["head"], pivot: { x: 150, y: 84 } },
      torso: { segments: ["torsoMain", "torsoSecondary"], pivot: { x: 150, y: 175 } },
      armL: { segments: ["armLUpper", "armLLower"], pivot: { x: 52, y: 172 } },
      armR: { segments: ["armRUpper", "armRLower"], pivot: { x: 248, y: 172 } },
      legL: { segments: ["legL", "footL"], pivot: { x: 118, y: 277 } },
      legR: { segments: ["legR", "footR"], pivot: { x: 182, y: 277 } },
    },
    // Fixed (non-animated) decorations, drawn with the torso.
    crystalShards: [
      { points: [{ x: 60, y: 120 }, { x: 40, y: 80 }, { x: 68, y: 100 }] },
      { points: [{ x: 240, y: 120 }, { x: 260, y: 80 }, { x: 232, y: 100 }] },
      { points: [{ x: 115, y: 95 }, { x: 108, y: 55 }, { x: 128, y: 88 }] },
      { points: [{ x: 185, y: 95 }, { x: 192, y: 55 }, { x: 172, y: 88 }] },
    ],
    // Exposed weak-point core, drawn over the torso.
    core: { x: 150, y: 180, r: 26, diamond: [{ x: 140, y: 158 }, { x: 160, y: 158 }, { x: 168, y: 180 }, { x: 150, y: 202 }, { x: 132, y: 180 }] },
    headGem: [{ x: 150, y: 28 }, { x: 158, y: 42 }, { x: 150, y: 56 }, { x: 142, y: 42 }],
    eyes: [{ x: 138, y: 52, r: 5 }, { x: 162, y: 52, r: 5 }],
    groundAnchor: { x: 150, y: 368 },
    viewHeight: 380,
  };

  // The Chief, Arena Lord (Village Arena boss) — design kit's new "Boss —
  // The Chief" section: a wrapped guard arm, a torch-wielding weapon arm,
  // a torn cape, over a 300x400 local space. Segmented like the golems (see
  // that comment) but built from sampled Q-curves + limbCapsule() rather
  // than rockPointList blobs — cloth/flesh, not stone — so it's drawn by
  // its own drawChiefEnemy() in game.js instead of the shared
  // drawGolemEnemy() (the cape needs to render behind the legs, which
  // doesn't fit that function's fixed draw order).
  const chiefRig = {
    segments: {
      head: { kind: "ellipse", center: { x: 150, y: 95 }, rx: 34, ry: 34, fill: "#e8c9a0" },
      hair: {
        kind: "polygon",
        points: [
          ...sampleQuadratic({ x: 112, y: 108 }, { x: 150, y: 132 }, { x: 188, y: 108 }, 5),
          ...sampleQuadratic({ x: 188, y: 108 }, { x: 185, y: 96 }, { x: 150, y: 93 }, 5).slice(1),
          ...sampleQuadratic({ x: 150, y: 93 }, { x: 115, y: 96 }, { x: 112, y: 108 }, 5).slice(1),
        ],
        fill: "#8a8478",
      },

      torsoOuter: {
        kind: "polygon",
        points: [
          ...sampleQuadratic({ x: 75, y: 150 }, { x: 150, y: 125 }, { x: 225, y: 150 }, 6),
          { x: 235, y: 335 },
          ...sampleQuadratic({ x: 235, y: 335 }, { x: 150, y: 362 }, { x: 65, y: 335 }, 6),
        ],
        fill: "#3a1f1f",
      },
      torsoInner: {
        kind: "polygon",
        points: [
          ...sampleQuadratic({ x: 90, y: 148 }, { x: 150, y: 128 }, { x: 210, y: 148 }, 6),
          { x: 218, y: 330 },
          ...sampleQuadratic({ x: 218, y: 330 }, { x: 150, y: 352 }, { x: 82, y: 330 }, 6),
        ],
        fill: "#a63d3d",
      },
      belt: { kind: "polygon", points: [{ x: 108, y: 233 }, { x: 192, y: 233 }, { x: 192, y: 249 }, { x: 108, y: 249 }], fill: "#d4a53d" },
      beltBuckle: { kind: "ellipse", center: { x: 150, y: 241 }, rx: 8, ry: 8, fill: "#b98a4a" },

      capeL: {
        kind: "polygon",
        points: [
          ...sampleQuadratic({ x: 90, y: 140 }, { x: 55, y: 230 }, { x: 38, y: 325 }, 5),
          { x: 68, y: 372 },
          ...sampleQuadratic({ x: 68, y: 372 }, { x: 98, y: 300 }, { x: 108, y: 195 }, 5),
        ],
        fill: "#3a1f1f",
      },
      capeR: {
        kind: "polygon",
        points: [
          ...sampleQuadratic({ x: 210, y: 140 }, { x: 245, y: 230 }, { x: 262, y: 325 }, 5),
          { x: 232, y: 372 },
          ...sampleQuadratic({ x: 232, y: 372 }, { x: 202, y: 300 }, { x: 192, y: 195 }, 5),
        ],
        fill: "#3a1f1f",
      },

      armLUpper: { kind: "polygon", points: limbCapsule(92, 178, 75, 200, 8), fill: "#a63d3d" },
      armLLower: { kind: "polygon", points: limbCapsule(75, 200, 73, 225, 8), fill: "#a63d3d" },
      handL: { kind: "ellipse", center: { x: 73, y: 225 }, rx: 13, ry: 13, fill: "#e8c9a0" },

      armRUpper: { kind: "polygon", points: limbCapsule(208, 178, 226, 201, 8.5), fill: "#a63d3d" },
      armRLower: { kind: "polygon", points: limbCapsule(226, 201, 230, 228, 8.5), fill: "#a63d3d" },
      torchHandle: { kind: "polygon", points: limbCapsule(230, 228, 248, 88, 4.5), fill: "#5a4530" },
      torchHead: { kind: "polygon", points: [{ x: 228.4, y: 42.8 }, { x: 282.2, y: 64.5 }, { x: 269.5, y: 96 }, { x: 215.7, y: 74.3 }], fill: "#7a756a" },
      ember1: { kind: "ellipse", center: { x: 235, y: 55 }, rx: 3, ry: 3, fill: "#e8873d" },
      ember2: { kind: "ellipse", center: { x: 262, y: 60 }, rx: 2.5, ry: 2.5, fill: "#d4a53d" },
      ember3: { kind: "ellipse", center: { x: 250, y: 40 }, rx: 2, ry: 2, fill: "#e8873d" },

      legL: { kind: "polygon", points: [{ x: 110, y: 325 }, { x: 102, y: 368 }, { x: 128, y: 368 }, { x: 124, y: 330 }], fill: "#3a1f1f" },
      legR: { kind: "polygon", points: [{ x: 190, y: 325 }, { x: 198, y: 368 }, { x: 172, y: 368 }, { x: 176, y: 330 }], fill: "#3a1f1f" },
      footL: { kind: "ellipse", center: { x: 112, y: 370 }, rx: 16, ry: 8, fill: "#2a1f18" },
      footR: { kind: "ellipse", center: { x: 188, y: 370 }, rx: 16, ry: 8, fill: "#2a1f18" },
    },
    groups: {
      cape: { segments: ["capeL", "capeR"], pivot: { x: 150, y: 150 } },
      legL: { segments: ["legL", "footL"], pivot: { x: 117, y: 325 } },
      legR: { segments: ["legR", "footR"], pivot: { x: 183, y: 325 } },
      armL: { segments: ["armLUpper", "armLLower", "handL"], pivot: { x: 92, y: 178 } },
      torso: { segments: ["torsoOuter", "torsoInner", "belt", "beltBuckle"], pivot: { x: 150, y: 150 } },
      armR: { segments: ["armRUpper", "armRLower", "torchHandle", "torchHead", "ember1", "ember2", "ember3"], pivot: { x: 208, y: 178 } },
      head: { segments: ["head", "hair"], pivot: { x: 150, y: 108 } },
    },
    eyeGlow: { x: 150, y: 74, r: 6 },
    torchGlowCenter: { x: 248, y: 72 },
    groundAnchor: { x: 150, y: 388 },
    viewHeight: 400,
  };

  const enemyRigs = { golem: golemRig, mireLeech: mireLeechRig, cragRam: cragRamRig, frostWisp: frostWispRig, bramblingBoar: bramblingBoarRig, crystalCrawler: crystalCrawlerRig, crystalGolem: crystalGolemRig, traineeBlue: traineeBlueRig, traineeRed: traineeRedRig, chief: chiefRig };

  // --- Spawn Hub: NPCs -----------------------------------------------------

  // Villagers/NPCs are static ground sprites (like trees/foliage) rather
  // than rigged skeletons — they idle in place or (for the two duel
  // combatants) lunge as a single scaled/translated sprite rather than
  // animating individual limbs. Every humanoid shares the same rough
  // proportions (140x200 viewBox, ground at y=192) so callers can treat
  // them uniformly.
  const npcSvgs = {
    trainer: `
      <svg xmlns="http://www.w3.org/2000/svg" width="140" height="200" viewBox="0 0 140 200">
        <ellipse cx="70" cy="192" rx="32" ry="8" fill="#2a1f18" opacity="0.2"/>
        <path d="M48,98 Q70,88 92,98 L104,182 Q70,194 36,182 Z" fill="#6b5a8a" stroke="#2a1f18" stroke-width="3.5"/>
        <path d="M48,98 Q70,88 92,98 L104,182 Q70,194 36,182 Z" fill="url(#deepHatch)" opacity="0.25"/>
        <circle cx="70" cy="68" r="22" fill="#e8c9a0" stroke="#2a1f18" stroke-width="3"/>
        <path d="M48,60 Q70,36 92,60 Q92,48 70,42 Q48,48 48,60 Z" fill="#5a4a72" stroke="#2a1f18" stroke-width="2.5"/>
        <line x1="100" y1="132" x2="118" y2="66" stroke="#5a4530" stroke-width="4" stroke-linecap="round"/>
        <circle cx="118" cy="58" r="9" fill="url(#glow)"/>
        <g transform="translate(70,18)">
          <circle r="12" fill="#e8dcc0" stroke="#2a1f18" stroke-width="2"/>
          <rect x="-7" y="-6" width="14" height="10" fill="none" stroke="#2a1f18" stroke-width="1.3"/>
          <line x1="0" y1="-6" x2="0" y2="4" stroke="#2a1f18" stroke-width="1"/>
        </g>
      </svg>`,

    rangeMaster: `
      <svg xmlns="http://www.w3.org/2000/svg" width="140" height="200" viewBox="0 0 140 200">
        <ellipse cx="70" cy="192" rx="32" ry="8" fill="#2a1f18" opacity="0.2"/>
        <path d="M48,98 Q70,88 92,98 L104,182 Q70,194 36,182 Z" fill="#5c6b3f" stroke="#2a1f18" stroke-width="3.5"/>
        <path d="M48,98 Q70,88 92,98 L104,182 Q70,194 36,182 Z" fill="url(#deepHatch)" opacity="0.25"/>
        <circle cx="70" cy="68" r="22" fill="#e8c9a0" stroke="#2a1f18" stroke-width="3"/>
        <path d="M50,58 Q70,44 90,58 Q88,48 70,46 Q52,48 50,58 Z" fill="#6b5238" stroke="#2a1f18" stroke-width="2"/>
        <path d="M100,110 Q114,132 100,154" stroke="#5a4530" stroke-width="3" fill="none"/>
        <line x1="100" y1="110" x2="100" y2="154" stroke="#e8dcc0" stroke-width="1"/>
        <g transform="translate(70,18)">
          <circle r="12" fill="#e8dcc0" stroke="#2a1f18" stroke-width="2"/>
          <circle r="7" fill="none" stroke="#a63d3d" stroke-width="1.6"/>
          <circle r="2.5" fill="#a63d3d"/>
        </g>
      </svg>`,

    bondsKeeper: `
      <svg xmlns="http://www.w3.org/2000/svg" width="140" height="200" viewBox="0 0 140 200">
        <ellipse cx="70" cy="192" rx="32" ry="8" fill="#2a1f18" opacity="0.2"/>
        <path d="M48,98 Q70,88 92,98 L104,182 Q70,194 36,182 Z" fill="#c9a24a" stroke="#2a1f18" stroke-width="3.5"/>
        <path d="M48,98 Q70,88 92,98 L104,182 Q70,194 36,182 Z" fill="url(#deepHatch)" opacity="0.25"/>
        <circle cx="70" cy="68" r="22" fill="#e8c9a0" stroke="#2a1f18" stroke-width="3"/>
        <path d="M50,58 Q70,42 90,58 Q88,46 70,44 Q52,46 50,58 Z" fill="#8a6a48" stroke="#2a1f18" stroke-width="2"/>
        <rect x="96" y="118" width="10" height="34" rx="3" fill="#e8dcc0" stroke="#2a1f18" stroke-width="2"/>
        <line x1="98" y1="124" x2="104" y2="124" stroke="#2a1f18" stroke-width="1"/>
        <line x1="98" y1="132" x2="104" y2="132" stroke="#2a1f18" stroke-width="1"/>
        <g transform="translate(70,18)">
          <circle r="12" fill="#e8dcc0" stroke="#2a1f18" stroke-width="2"/>
          <circle cx="-4" cy="0" r="6" fill="none" stroke="#4a6a8a" stroke-width="1.6"/>
          <circle cx="4" cy="0" r="6" fill="none" stroke="#4a6a8a" stroke-width="1.6"/>
        </g>
      </svg>`,

    merchant: `
      <svg xmlns="http://www.w3.org/2000/svg" width="160" height="200" viewBox="0 0 160 200">
        <ellipse cx="75" cy="192" rx="34" ry="8" fill="#2a1f18" opacity="0.2"/>
        <rect x="30" y="150" width="90" height="8" fill="#5a4530" stroke="#2a1f18" stroke-width="2.5"/>
        <rect x="35" y="158" width="6" height="20" fill="#5a4530" stroke="#2a1f18" stroke-width="1.5"/>
        <rect x="105" y="158" width="6" height="20" fill="#5a4530" stroke="#2a1f18" stroke-width="1.5"/>
        <circle cx="55" cy="146" r="6" fill="#8a6a48" stroke="#2a1f18" stroke-width="1.5"/>
        <circle cx="75" cy="144" r="7" fill="#c9622f" stroke="#2a1f18" stroke-width="1.5"/>
        <rect x="90" y="138" width="14" height="12" fill="#e8dcc0" stroke="#2a1f18" stroke-width="1.5"/>
        <path d="M50,90 Q70,80 90,90 L98,170 Q70,180 42,170 Z" fill="#a9642f" stroke="#2a1f18" stroke-width="3.5"/>
        <path d="M48,110 Q38,120 42,132" stroke="#a9642f" stroke-width="7" fill="none" stroke-linecap="round"/>
        <path d="M92,100 Q108,90 106,72" stroke="#a9642f" stroke-width="7" fill="none" stroke-linecap="round"/>
        <circle cx="106" cy="70" r="6" fill="#e8c9a0" stroke="#2a1f18" stroke-width="2"/>
        <circle cx="70" cy="62" r="20" fill="#e8c9a0" stroke="#2a1f18" stroke-width="2.5"/>
        <path d="M50,54 Q70,38 90,54 Q88,44 70,42 Q52,44 50,54 Z" fill="#6b5238" stroke="#2a1f18" stroke-width="2"/>
      </svg>`,

    guard: `
      <svg xmlns="http://www.w3.org/2000/svg" width="140" height="200" viewBox="0 0 140 200">
        <ellipse cx="70" cy="192" rx="30" ry="8" fill="#2a1f18" opacity="0.2"/>
        <path d="M50,95 Q70,86 90,95 L96,175 Q70,186 44,175 Z" fill="#6b7a8a" stroke="#2a1f18" stroke-width="3.5"/>
        <rect x="58" y="130" width="24" height="10" fill="#4a5a68" stroke="#2a1f18" stroke-width="1.5"/>
        <circle cx="70" cy="62" r="20" fill="#e8c9a0" stroke="#2a1f18" stroke-width="2.5"/>
        <path d="M52,56 Q70,42 88,56 Q86,46 70,44 Q54,46 52,56 Z" fill="#3a2c1e" stroke="#2a1f18" stroke-width="2"/>
        <line x1="102" y1="180" x2="112" y2="30" stroke="#5a4530" stroke-width="4" stroke-linecap="round"/>
        <polygon points="112,30 106,44 118,44" fill="#8a8478" stroke="#2a1f18" stroke-width="2"/>
      </svg>`,

    fisher: `
      <svg xmlns="http://www.w3.org/2000/svg" width="180" height="160" viewBox="0 0 180 160">
        <ellipse cx="55" cy="146" rx="26" ry="7" fill="#2a1f18" opacity="0.18"/>
        <polygon points="40,140 30,110 55,95 75,105 72,135 55,145" fill="#8a8478" stroke="#2a1f18" stroke-width="3" stroke-linejoin="round"/>
        <path d="M40,110 Q60,100 78,110 L74,70 Q60,62 46,70 Z" fill="#5c6b3f" stroke="#2a1f18" stroke-width="3"/>
        <circle cx="60" cy="60" r="16" fill="#e8c9a0" stroke="#2a1f18" stroke-width="2.2"/>
        <ellipse cx="60" cy="50" rx="20" ry="6" fill="#5a4530" stroke="#2a1f18" stroke-width="2"/>
        <ellipse cx="60" cy="46" rx="10" ry="8" fill="#5a4530" stroke="#2a1f18" stroke-width="2"/>
        <line x1="76" y1="90" x2="130" y2="60" stroke="#5a4530" stroke-width="3" stroke-linecap="round"/>
        <line x1="130" y1="60" x2="150" y2="120" stroke="#2a1f18" stroke-width="1"/>
        <ellipse cx="150" cy="135" rx="28" ry="10" fill="#4a7a7a" stroke="#2a1f18" stroke-width="2.5"/>
        <path d="M138,132 Q150,126 162,132" stroke="#7fa8a8" stroke-width="1.6" fill="none" opacity="0.6"/>
      </svg>`,

    reader: `
      <svg xmlns="http://www.w3.org/2000/svg" width="140" height="150" viewBox="0 0 140 150">
        <ellipse cx="70" cy="140" rx="38" ry="7" fill="#2a1f18" opacity="0.18"/>
        <path d="M35,120 Q70,105 105,120 Q100,135 70,138 Q40,135 35,120 Z" fill="#8a6bb0" stroke="#2a1f18" stroke-width="3"/>
        <path d="M48,95 Q70,86 92,95 L88,120 Q70,126 52,120 Z" fill="#8a6bb0" stroke="#2a1f18" stroke-width="3"/>
        <circle cx="70" cy="75" r="18" fill="#e8c9a0" stroke="#2a1f18" stroke-width="2.4"/>
        <path d="M52,68 Q70,54 88,68 Q86,58 70,56 Q54,58 52,68 Z" fill="#5a4530" stroke="#2a1f18" stroke-width="2"/>
        <path d="M50,108 L70,100 L90,108 L90,118 L70,110 L50,118 Z" fill="#e8dcc0" stroke="#2a1f18" stroke-width="2"/>
        <line x1="58" y1="108" x2="66" y2="105" stroke="#2a1f18" stroke-width="1"/>
        <line x1="74" y1="105" x2="82" y2="108" stroke="#2a1f18" stroke-width="1"/>
      </svg>`,

    seatedVillager: `
      <svg xmlns="http://www.w3.org/2000/svg" width="140" height="160" viewBox="0 0 140 160">
        <ellipse cx="70" cy="152" rx="34" ry="7" fill="#2a1f18" opacity="0.18"/>
        <rect x="45" y="95" width="50" height="35" fill="#5a4530" stroke="#2a1f18" stroke-width="3"/>
        <ellipse cx="70" cy="95" rx="25" ry="12" fill="#8a6a48" stroke="#2a1f18" stroke-width="3"/>
        <path d="M50,95 Q70,86 90,95 L84,50 Q70,42 56,50 Z" fill="#7a8bb0" stroke="#2a1f18" stroke-width="3"/>
        <path d="M50,70 Q40,80 46,92" stroke="#7a8bb0" stroke-width="6" fill="none" stroke-linecap="round"/>
        <path d="M90,70 Q100,80 94,92" stroke="#7a8bb0" stroke-width="6" fill="none" stroke-linecap="round"/>
        <circle cx="70" cy="38" r="18" fill="#e8c9a0" stroke="#2a1f18" stroke-width="2.5"/>
        <path d="M54,32 Q70,18 86,32 Q84,24 70,22 Q56,24 54,32 Z" fill="#5a4530" stroke="#2a1f18" stroke-width="2"/>
      </svg>`,

    villagersChatting: `
      <svg xmlns="http://www.w3.org/2000/svg" width="260" height="170" viewBox="0 0 260 170">
        <ellipse cx="70" cy="162" rx="34" ry="7" fill="#2a1f18" opacity="0.18"/>
        <ellipse cx="190" cy="162" rx="34" ry="7" fill="#2a1f18" opacity="0.18"/>
        <rect x="45" y="105" width="50" height="35" fill="#5a4530" stroke="#2a1f18" stroke-width="3"/>
        <ellipse cx="70" cy="105" rx="25" ry="12" fill="#8a6a48" stroke="#2a1f18" stroke-width="3"/>
        <path d="M50,105 Q70,96 90,105 L84,60 Q70,52 56,60 Z" fill="#c9a24a" stroke="#2a1f18" stroke-width="3"/>
        <path d="M90,80 Q102,88 98,98" stroke="#c9a24a" stroke-width="6" fill="none" stroke-linecap="round"/>
        <circle cx="70" cy="48" r="18" fill="#e8c9a0" stroke="#2a1f18" stroke-width="2.5"/>
        <path d="M54,42 Q70,30 86,42 Q84,34 70,32 Q56,34 54,42 Z" fill="#6b5238" stroke="#2a1f18" stroke-width="2"/>
        <rect x="165" y="105" width="50" height="35" fill="#5a4530" stroke="#2a1f18" stroke-width="3"/>
        <ellipse cx="190" cy="105" rx="25" ry="12" fill="#8a6a48" stroke="#2a1f18" stroke-width="3"/>
        <path d="M170,105 Q190,96 210,105 L204,60 Q190,52 176,60 Z" fill="#6b5a8a" stroke="#2a1f18" stroke-width="3"/>
        <path d="M170,80 Q158,88 162,98" stroke="#6b5a8a" stroke-width="6" fill="none" stroke-linecap="round"/>
        <circle cx="190" cy="48" r="18" fill="#e8c9a0" stroke="#2a1f18" stroke-width="2.5"/>
        <path d="M174,42 Q190,26 206,42 Q204,32 190,30 Q176,32 174,42 Z" fill="#3a2c1e" stroke="#2a1f18" stroke-width="2"/>
        <path d="M96,25 Q96,10 111,10 L149,10 Q164,10 164,25 L164,42 Q164,57 149,57 L124,57 L112,70 L115,57 L111,57 Q96,57 96,42 Z" fill="#e8dcc0" stroke="#2a1f18" stroke-width="3"/>
        <circle cx="118" cy="33" r="4" fill="#2a1f18"/>
        <circle cx="130" cy="33" r="4" fill="#2a1f18"/>
        <circle cx="142" cy="33" r="4" fill="#2a1f18"/>
      </svg>`,

    chiefGreeting: `
      <svg xmlns="http://www.w3.org/2000/svg" width="160" height="220" viewBox="0 0 160 220">
        <ellipse cx="80" cy="208" rx="34" ry="8" fill="#2a1f18" opacity="0.2"/>
        <path d="M40,100 Q80,90 120,100 L128,190 Q80,204 32,190 Z" fill="#3a1f1f" stroke="#2a1f18" stroke-width="3.5" opacity="0.9"/>
        <path d="M48,98 Q80,88 112,98 L118,188 Q80,200 42,188 Z" fill="#a63d3d" stroke="#2a1f18" stroke-width="3.5"/>
        <path d="M48,98 Q80,88 112,98" stroke="#d4a53d" stroke-width="3" fill="none"/>
        <rect x="60" y="140" width="40" height="10" fill="#d4a53d" stroke="#2a1f18" stroke-width="2"/>
        <path d="M48,110 Q38,122 44,136" stroke="#a63d3d" stroke-width="8" fill="none" stroke-linecap="round"/>
        <path d="M112,110 Q128,98 126,80" stroke="#a63d3d" stroke-width="8" fill="none" stroke-linecap="round"/>
        <circle cx="126" cy="78" r="7" fill="#e8c9a0" stroke="#2a1f18" stroke-width="2"/>
        <circle cx="80" cy="68" r="22" fill="#e8c9a0" stroke="#2a1f18" stroke-width="2.5"/>
        <path d="M60,78 Q80,96 100,78 Q98,68 80,66 Q62,68 60,78 Z" fill="#8a8478" stroke="#2a1f18" stroke-width="2"/>
        <path d="M58,58 Q80,48 102,58" stroke="#d4a53d" stroke-width="4" fill="none"/>
        <circle cx="80" cy="52" r="4" fill="#8fe0ff" stroke="#2a1f18" stroke-width="1.2"/>
      </svg>`,

    chiefBattle: `
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="220" viewBox="0 0 200 220">
        <ellipse cx="100" cy="208" rx="70" ry="9" fill="#2a1f18" opacity="0.2"/>
        <path d="M30,110 Q100,90 170,110 L178,195 Q100,210 22,195 Z" fill="#3a1f1f" stroke="#2a1f18" stroke-width="3.5" opacity="0.9"/>
        <path d="M55,105 Q100,92 145,105 L150,195 Q100,205 50,195 Z" fill="#a63d3d" stroke="#2a1f18" stroke-width="3.5"/>
        <path d="M55,105 Q100,92 145,105" stroke="#d4a53d" stroke-width="3" fill="none"/>
        <path d="M55,120 Q40,132 48,148" stroke="#a63d3d" stroke-width="9" fill="none" stroke-linecap="round"/>
        <path d="M145,120 Q150,140 150,180" stroke="#a63d3d" stroke-width="9" fill="none" stroke-linecap="round"/>
        <circle cx="170" cy="58" r="20" fill="url(#fireGlow)" opacity="0.5"/>
        <line x1="150" y1="180" x2="165" y2="70" stroke="#5a4530" stroke-width="6" stroke-linecap="round"/>
        <rect x="150" y="45" width="40" height="26" rx="4" fill="#7a756a" stroke="#2a1f18" stroke-width="3" transform="rotate(20 170 58)"/>
        <circle cx="100" cy="70" r="22" fill="#e8c9a0" stroke="#2a1f18" stroke-width="2.5"/>
        <path d="M80,80 Q100,98 120,80 Q118,70 100,68 Q82,70 80,80 Z" fill="#8a8478" stroke="#2a1f18" stroke-width="2"/>
        <path d="M78,60 Q100,50 122,60" stroke="#d4a53d" stroke-width="4" fill="none"/>
        <circle cx="100" cy="54" r="4" fill="#8fe0ff" stroke="#2a1f18" stroke-width="1.2"/>
      </svg>`,

    // Sparring Pair — the second duel combatant, a color variant of the
    // "blue" fighter from the design doc's Training Battles illustration
    // (the Chief himself, in chiefBattle above, stands in for the "red"
    // fighter in-engine).
    sparringPartner: `
      <svg xmlns="http://www.w3.org/2000/svg" width="140" height="200" viewBox="42,50 116,150">
        <ellipse cx="80" cy="180" rx="34" ry="7" fill="#2a1f18" opacity="0.15"/>
        <path d="M58,95 Q80,86 100,95 L94,175 Q80,184 64,175 Z" fill="#4a6a8a" stroke="#2a1f18" stroke-width="3.5"/>
        <path d="M48,110 Q40,122 46,134" stroke="#4a6a8a" stroke-width="7" fill="none" stroke-linecap="round"/>
        <path d="M96,100 Q112,90 118,70" stroke="#4a6a8a" stroke-width="7" fill="none" stroke-linecap="round"/>
        <circle cx="80" cy="68" r="20" fill="#e8c9a0" stroke="#2a1f18" stroke-width="2.5"/>
        <path d="M60,60 Q80,46 100,60 Q98,50 80,48 Q62,50 60,60 Z" fill="#5a4530" stroke="#2a1f18" stroke-width="2"/>
      </svg>`,
  };

  const npcMeta = {
    trainer: { width: 92, height: 131, groundFraction: 192 / 200 },
    rangeMaster: { width: 92, height: 131, groundFraction: 192 / 200 },
    bondsKeeper: { width: 92, height: 131, groundFraction: 192 / 200 },
    merchant: { width: 100, height: 125, groundFraction: 192 / 200 },
    guard: { width: 88, height: 126, groundFraction: 192 / 200 },
    fisher: { width: 110, height: 98, groundFraction: 146 / 160 },
    reader: { width: 92, height: 99, groundFraction: 140 / 150 },
    seatedVillager: { width: 88, height: 100, groundFraction: 152 / 160 },
    villagersChatting: { width: 190, height: 124, groundFraction: 162 / 170 },
    chiefGreeting: { width: 100, height: 138, groundFraction: 208 / 220 },
    chiefBattle: { width: 122, height: 134, groundFraction: 208 / 220 },
    sparringPartner: { width: 92, height: 131, groundFraction: 180 / 200 },
  };

  const npcs = {};
  for (const [key, svg] of Object.entries(npcSvgs)) {
    npcs[key] = { image: svgToImage(svg), width: npcMeta[key].width, height: npcMeta[key].height, groundFraction: npcMeta[key].groundFraction };
  }

  // --- Spawn Hub: practice range, hub features, buildings, arena -----------

  const hubFeatureSvgs = {
    targetDummy: `
      <svg xmlns="http://www.w3.org/2000/svg" width="140" height="170" viewBox="0 0 140 170">
        <ellipse cx="70" cy="163" rx="30" ry="7" fill="#2a1f18" opacity="0.2"/>
        <rect x="60" y="118" width="20" height="48" fill="#5a4530" stroke="#2a1f18" stroke-width="3"/>
        <circle cx="70" cy="86" r="34" fill="#d4b56a" stroke="#2a1f18" stroke-width="3.5"/>
        <path d="M42,72 L98,100 M44,100 L96,72 M40,86 L100,86" stroke="#a9873f" stroke-width="1.4" opacity="0.6"/>
        <line x1="36" y1="94" x2="104" y2="94" stroke="#5a4530" stroke-width="5" stroke-linecap="round"/>
        <circle cx="70" cy="86" r="20" fill="none" stroke="#a63d3d" stroke-width="4"/>
        <circle cx="70" cy="86" r="12" fill="none" stroke="#e8dcc0" stroke-width="3"/>
        <circle cx="70" cy="86" r="5" fill="#a63d3d"/>
      </svg>`,
    targetDummyBroken: `
      <svg xmlns="http://www.w3.org/2000/svg" width="140" height="170" viewBox="0 0 140 170">
        <ellipse cx="70" cy="163" rx="30" ry="7" fill="#2a1f18" opacity="0.2"/>
        <rect x="60" y="118" width="20" height="48" fill="#5a4530" stroke="#2a1f18" stroke-width="3"/>
        <path d="M62,130 L70,138 L64,150" stroke="#2a1f18" stroke-width="1.4" fill="none" opacity="0.4"/>
        <path d="M40,82 Q60,66 82,80 Q96,90 88,102 Q66,112 46,100 Q34,92 40,82 Z" fill="#d4b56a" stroke="#2a1f18" stroke-width="3.5"/>
        <path d="M42,86 L60,74 M50,96 L70,84 M60,100 L84,90" stroke="#a9873f" stroke-width="1.4" opacity="0.6"/>
        <line x1="36" y1="90" x2="70" y2="70" stroke="#5a4530" stroke-width="5" stroke-linecap="round"/>
        <line x1="104" y1="98" x2="88" y2="80" stroke="#5a4530" stroke-width="5" stroke-linecap="round"/>
        <path d="M52,78 Q64,86 60,98" fill="none" stroke="#2a1f18" stroke-width="2.5"/>
        <circle cx="58" cy="86" r="7" fill="none" stroke="#a63d3d" stroke-width="3" opacity="0.5"/>
        <ellipse cx="105" cy="70" rx="6" ry="3" fill="#d4b56a" stroke="#2a1f18" stroke-width="1.5" transform="rotate(30 105 70)"/>
        <ellipse cx="112" cy="60" rx="5" ry="2.5" fill="#d4b56a" stroke="#2a1f18" stroke-width="1.5" transform="rotate(20 112 60)"/>
      </svg>`,
    scorchMark: `
      <svg xmlns="http://www.w3.org/2000/svg" width="160" height="100" viewBox="0 0 160 100">
        <ellipse cx="80" cy="60" rx="55" ry="18" fill="#2a1f18" opacity="0.45"/>
        <path d="M80,60 L40,30" stroke="#2a1f18" stroke-width="2" opacity="0.3"/>
        <path d="M80,60 L120,28" stroke="#2a1f18" stroke-width="2" opacity="0.3"/>
        <path d="M80,60 L30,68" stroke="#2a1f18" stroke-width="1.6" opacity="0.25"/>
        <path d="M80,60 L128,72" stroke="#2a1f18" stroke-width="1.6" opacity="0.25"/>
        <circle cx="70" cy="54" r="3" fill="#e8a24a" opacity="0.6"/>
        <circle cx="92" cy="58" r="2.4" fill="#e8a24a" opacity="0.5"/>
      </svg>`,
    practiceRing: `
      <svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r="55" fill="none" stroke="#8a7a68" stroke-width="3" stroke-dasharray="6 6" opacity="0.7"/>
        <circle cx="80" cy="80" r="35" fill="none" stroke="#8a7a68" stroke-width="2.5" stroke-dasharray="5 5" opacity="0.5"/>
        <line x1="80" y1="65" x2="80" y2="95" stroke="#2a1f18" stroke-width="1.4" opacity="0.5"/>
        <line x1="65" y1="80" x2="95" y2="80" stroke="#2a1f18" stroke-width="1.4" opacity="0.5"/>
      </svg>`,
    noticeBoard: `
      <svg xmlns="http://www.w3.org/2000/svg" width="160" height="130" viewBox="0 0 160 130">
        <rect x="20" y="40" width="10" height="80" fill="#5a4530" stroke="#2a1f18" stroke-width="2.5"/>
        <rect x="130" y="40" width="10" height="80" fill="#5a4530" stroke="#2a1f18" stroke-width="2.5"/>
        <rect x="15" y="20" width="130" height="70" fill="#6b5238" stroke="#2a1f18" stroke-width="3"/>
        <rect x="15" y="20" width="130" height="70" fill="url(#hatch)" opacity="0.3"/>
        <rect x="28" y="30" width="36" height="26" fill="#e8dcc0" stroke="#2a1f18" stroke-width="2" transform="rotate(-4 46 43)"/>
        <rect x="70" y="34" width="34" height="24" fill="#f0e6d2" stroke="#2a1f18" stroke-width="2" transform="rotate(3 87 46)"/>
        <rect x="106" y="28" width="30" height="22" fill="#e8dcc0" stroke="#2a1f18" stroke-width="2" transform="rotate(-2 121 39)"/>
        <line x1="36" y1="40" x2="56" y2="40" stroke="#2a1f18" stroke-width="1.4" opacity="0.6" transform="rotate(-4 46 43)"/>
        <line x1="36" y1="48" x2="52" y2="48" stroke="#2a1f18" stroke-width="1.4" opacity="0.6" transform="rotate(-4 46 43)"/>
      </svg>`,
    friendBeacon: `
      <svg xmlns="http://www.w3.org/2000/svg" width="140" height="170" viewBox="0 0 140 170">
        <ellipse cx="70" cy="160" rx="30" ry="7" fill="#2a1f18" opacity="0.2"/>
        <polygon points="56,158 50,90 62,50 78,50 90,90 84,158" fill="#8a8478" stroke="#2a1f18" stroke-width="3.5" stroke-linejoin="round"/>
        <polygon points="56,158 50,90 62,50 70,50 70,158" fill="url(#deepHatch)" opacity="0.35"/>
        <circle cx="70" cy="46" r="22" fill="url(#glow)"/>
        <circle cx="64" cy="42" r="10" fill="none" stroke="#e8dcc0" stroke-width="2"/>
        <circle cx="76" cy="42" r="10" fill="none" stroke="#e8dcc0" stroke-width="2"/>
      </svg>`,
    hut: `
      <svg xmlns="http://www.w3.org/2000/svg" width="160" height="170" viewBox="0 0 160 170">
        <ellipse cx="80" cy="160" rx="60" ry="9" fill="#2a1f18" opacity="0.18"/>
        <rect x="35" y="90" width="90" height="65" fill="#c9a877" stroke="#2a1f18" stroke-width="3.5"/>
        <rect x="35" y="90" width="90" height="65" fill="url(#hatch)" opacity="0.25"/>
        <polygon points="20,90 80,35 140,90" fill="#8a6a48" stroke="#2a1f18" stroke-width="3.5" stroke-linejoin="round"/>
        <path d="M30,80 L50,80 M35,68 L60,68 M45,56 L65,56 M55,46 L70,46" stroke="#2a1f18" stroke-width="1.6" opacity="0.4"/>
        <path d="M130,80 L110,80 M125,68 L100,68 M115,56 L95,56 M105,46 L90,46" stroke="#2a1f18" stroke-width="1.6" opacity="0.4"/>
        <rect x="70" y="120" width="24" height="35" fill="#5a4530" stroke="#2a1f18" stroke-width="2.5"/>
        <circle cx="88" cy="137" r="1.8" fill="#2a1f18"/>
        <rect x="45" y="105" width="18" height="18" fill="#bcdfe8" stroke="#2a1f18" stroke-width="2"/>
        <line x1="54" y1="105" x2="54" y2="123" stroke="#2a1f18" stroke-width="1.4"/>
        <line x1="45" y1="114" x2="63" y2="114" stroke="#2a1f18" stroke-width="1.4"/>
        <rect x="100" y="20" width="14" height="24" fill="#7a756a" stroke="#2a1f18" stroke-width="2.5"/>
        <path d="M107,18 Q100,8 108,0" stroke="#c9c4b8" stroke-width="2.5" fill="none" opacity="0.5"/>
      </svg>`,
    lodge: `
      <svg xmlns="http://www.w3.org/2000/svg" width="220" height="180" viewBox="0 0 220 180">
        <ellipse cx="110" cy="170" rx="85" ry="9" fill="#2a1f18" opacity="0.18"/>
        <rect x="40" y="100" width="140" height="70" fill="#b98a5a" stroke="#2a1f18" stroke-width="3.5"/>
        <rect x="40" y="100" width="140" height="70" fill="url(#hatch)" opacity="0.22"/>
        <polygon points="20,100 110,40 200,100" fill="#6b5238" stroke="#2a1f18" stroke-width="3.5" stroke-linejoin="round"/>
        <line x1="110" y1="40" x2="110" y2="18" stroke="#5a4530" stroke-width="3"/>
        <polygon points="110,18 132,26 110,34" fill="#a63d3d" stroke="#2a1f18" stroke-width="2"/>
        <rect x="94" y="132" width="32" height="38" fill="#5a4530" stroke="#2a1f18" stroke-width="2.5"/>
        <rect x="55" y="118" width="22" height="20" fill="#bcdfe8" stroke="#2a1f18" stroke-width="2"/>
        <rect x="143" y="118" width="22" height="20" fill="#bcdfe8" stroke="#2a1f18" stroke-width="2"/>
        <line x1="66" y1="118" x2="66" y2="138" stroke="#2a1f18" stroke-width="1.4"/>
        <line x1="55" y1="128" x2="77" y2="128" stroke="#2a1f18" stroke-width="1.4"/>
        <line x1="154" y1="118" x2="154" y2="138" stroke="#2a1f18" stroke-width="1.4"/>
        <line x1="143" y1="128" x2="165" y2="128" stroke="#2a1f18" stroke-width="1.4"/>
      </svg>`,
    arenaRing: `
      <svg xmlns="http://www.w3.org/2000/svg" width="360" height="260" viewBox="0 0 360 260">
        <ellipse cx="180" cy="140" rx="160" ry="92" fill="none" stroke="#5a4530" stroke-width="7" opacity="0.9"/>
        <ellipse cx="180" cy="140" rx="150" ry="85" fill="#c9a877" stroke="#2a1f18" stroke-width="4"/>
        <ellipse cx="180" cy="140" rx="150" ry="85" fill="url(#hatch)" opacity="0.15"/>
        <rect x="336" y="128" width="8" height="26" fill="#5a4530" stroke="#2a1f18" stroke-width="2"/>
        <rect x="293" y="62" width="8" height="26" fill="#5a4530" stroke="#2a1f18" stroke-width="2"/>
        <rect x="176" y="42" width="8" height="26" fill="#5a4530" stroke="#2a1f18" stroke-width="2"/>
        <rect x="56" y="62" width="8" height="26" fill="#5a4530" stroke="#2a1f18" stroke-width="2"/>
        <rect x="16" y="128" width="8" height="26" fill="#5a4530" stroke="#2a1f18" stroke-width="2"/>
        <rect x="56" y="188" width="8" height="26" fill="#5a4530" stroke="#2a1f18" stroke-width="2"/>
        <rect x="176" y="212" width="8" height="26" fill="#5a4530" stroke="#2a1f18" stroke-width="2"/>
        <rect x="293" y="188" width="8" height="26" fill="#5a4530" stroke="#2a1f18" stroke-width="2"/>
        <line x1="170" y1="42" x2="170" y2="12" stroke="#5a4530" stroke-width="3"/>
        <polygon points="170,12 190,20 170,28" fill="#d4a53d" stroke="#2a1f18" stroke-width="2"/>
        <line x1="192" y1="42" x2="192" y2="16" stroke="#5a4530" stroke-width="3"/>
        <polygon points="192,16 208,23 192,30" fill="#a63d3d" stroke="#2a1f18" stroke-width="2"/>
        <rect x="30" y="150" width="50" height="20" rx="9" fill="#8a6a48" stroke="#2a1f18" stroke-width="2.5"/>
        <rect x="280" y="145" width="50" height="20" rx="9" fill="#8a6a48" stroke="#2a1f18" stroke-width="2.5"/>
      </svg>`,
  };

  const hubFeatureMeta = {
    targetDummy: { width: 110, height: 134, groundFraction: 163 / 170 },
    targetDummyBroken: { width: 110, height: 134, groundFraction: 163 / 170 },
    scorchMark: { width: 140, height: 88, groundFraction: 78 / 100 },
    practiceRing: { width: 190, height: 190, groundFraction: 0.85 },
    noticeBoard: { width: 150, height: 122, groundFraction: 120 / 130 },
    friendBeacon: { width: 110, height: 134, groundFraction: 160 / 170 },
    hut: { width: 175, height: 186, groundFraction: 160 / 170 },
    lodge: { width: 235, height: 192, groundFraction: 170 / 180 },
    arenaRing: { width: 360, height: 260, groundFraction: 225 / 260 },
  };

  const hubFeatures = {};
  for (const [key, svg] of Object.entries(hubFeatureSvgs)) {
    hubFeatures[key] = { image: svgToImage(svg), width: hubFeatureMeta[key].width, height: hubFeatureMeta[key].height, groundFraction: hubFeatureMeta[key].groundFraction };
  }

  // --- Boss Arenas -----------------------------------------------------

  const bossArenaSvgs = {
    arenaClearing: `
      <svg xmlns="http://www.w3.org/2000/svg" width="400" height="260" viewBox="0 0 400 260">
        <defs>
          <pattern id="deepHatch" width="2.8" height="2.8" patternUnits="userSpaceOnUse">
            <path d="M0,2.8 L2.8,0" stroke="#2a1f18" stroke-width="1"/>
            <path d="M0,0 L2.8,2.8" stroke="#2a1f18" stroke-width="1"/>
          </pattern>
        </defs>
        <ellipse cx="200" cy="130" rx="190" ry="118" fill="#8a8478" stroke="#2a1f18" stroke-width="4"/>
        <ellipse cx="200" cy="130" rx="190" ry="118" fill="url(#deepHatch)" opacity="0.2"/>
        <ellipse cx="200" cy="130" rx="150" ry="92" fill="none" stroke="#5f5a4f" stroke-width="2.5" opacity="0.6"/>
        <ellipse cx="200" cy="130" rx="105" ry="64" fill="none" stroke="#5f5a4f" stroke-width="2" opacity="0.5"/>
        <ellipse cx="200" cy="130" rx="60" ry="38" fill="#7a756a" stroke="#5f5a4f" stroke-width="2" opacity="0.7"/>
        <line x1="200" y1="12" x2="200" y2="248" stroke="#5f5a4f" stroke-width="2" opacity="0.4"/>
        <line x1="10" y1="130" x2="390" y2="130" stroke="#5f5a4f" stroke-width="2" opacity="0.4"/>
      </svg>`,
    runeDormant: `
      <svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r="60" fill="none" stroke="#5f5a4f" stroke-width="3"/>
        <circle cx="80" cy="80" r="42" fill="none" stroke="#5f5a4f" stroke-width="2"/>
        <polygon points="80,30 118,102 42,102" fill="none" stroke="#5f5a4f" stroke-width="2.5"/>
        <circle cx="80" cy="80" r="10" fill="#5f5a4f"/>
      </svg>`,
    runeChanneling: `
      <svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
        <defs>
          <radialGradient id="runeWindGlow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stop-color="#bfe3e3" stop-opacity="0.5"/>
            <stop offset="1" stop-color="#bfe3e3" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <circle cx="80" cy="80" r="70" fill="url(#runeWindGlow)" opacity="0.5"/>
        <circle cx="80" cy="80" r="60" fill="none" stroke="#9b7fc4" stroke-width="3"/>
        <circle cx="80" cy="80" r="42" fill="none" stroke="#c9a8f0" stroke-width="2.5"/>
        <polygon points="80,30 118,102 42,102" fill="none" stroke="#e8d8ff" stroke-width="3"/>
        <circle cx="80" cy="80" r="12" fill="#8fe0ff"/>
        <circle cx="60" cy="40" r="2.5" fill="#c9a8f0"/>
        <circle cx="110" cy="50" r="2" fill="#c9a8f0"/>
        <circle cx="100" cy="120" r="2.5" fill="#c9a8f0"/>
      </svg>`,
  };

  const bossArenaMeta = {
    arenaClearing: { width: 400, height: 260, groundFraction: 0.5 }, // flat ground decal, anchored at its own center
    runeDormant: { width: 120, height: 120, groundFraction: 0.6 },
    runeChanneling: { width: 130, height: 130, groundFraction: 0.6 },
  };

  const bossArena = {};
  for (const [key, svg] of Object.entries(bossArenaSvgs)) {
    bossArena[key] = { image: svgToImage(svg), width: bossArenaMeta[key].width, height: bossArenaMeta[key].height, groundFraction: bossArenaMeta[key].groundFraction };
  }

  // Crystal barrier segment — a standalone ground sprite (unlike the wall
  // spells above, these are boss-arena furniture, not a spell effect) drawn
  // in a ring of 8 by game.js using barrierRingPoints() below.
  const crystalBarrierSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="220" viewBox="0 0 120 220">
      <defs>
        <pattern id="deepHatch" width="2.8" height="2.8" patternUnits="userSpaceOnUse">
          <path d="M0,2.8 L2.8,0" stroke="#2a1f18" stroke-width="1"/>
          <path d="M0,0 L2.8,2.8" stroke="#2a1f18" stroke-width="1"/>
        </pattern>
        <radialGradient id="crystalCoreGlowLocal" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stop-color="#8fe0ff" stop-opacity="0.9"/>
          <stop offset="1" stop-color="#8fe0ff" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <ellipse cx="60" cy="210" rx="40" ry="8" fill="#2a1f18" opacity="0.3"/>
      <polygon points="35,205 20,120 40,40 60,5 80,40 100,120 85,205" fill="#5a4a8a" stroke="#c9a8f0" stroke-width="3.5" stroke-linejoin="round" opacity="0.85"/>
      <polygon points="60,5 80,40 100,120 85,205 65,205 65,50" fill="url(#deepHatch)" opacity="0.3"/>
      <polygon points="50,60 60,5 45,110 38,100" fill="#e8d8ff" opacity="0.4"/>
      <circle cx="60" cy="180" r="16" fill="url(#crystalCoreGlowLocal)"/>
    </svg>`;
  const crystalBarrier = { image: svgToImage(crystalBarrierSvg), width: 90, height: 165, groundFraction: 205 / 220 };

  // 8 evenly-spaced points around an ellipse, matching the design doc's
  // barrierRing generator — game.js places one crystalBarrier sprite at
  // each point to ring the arena.
  function barrierRingPoints(cx, cy, rx, ry, count = 8) {
    const pts = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      pts.push({ x: cx + rx * Math.cos(angle), y: cy + ry * Math.sin(angle) });
    }
    return pts;
  }

  // --- Boss particles & impact ------------------------------------------

  // Same radial-scatter formula as the design doc's crystalShardBurst/
  // crushDebris loops, baked into a static SVG at load time (matching how
  // every other multi-particle burst in this file — fireImpact,
  // earthImpact — is a single pre-rendered image, not literal per-frame
  // particles) rather than left as an empty group to fill at runtime.
  function radialShardPolygons({ count, seedBase, rxBase, ryBase, angleJitter, distBase, distStep }) {
    let svg = "";
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (i % 3) * angleJitter;
      const dist = distBase + (i % 3) * distStep;
      const cx = 100 + Math.cos(angle) * dist;
      const cy = 100 + Math.sin(angle) * dist;
      const rx = rxBase + (i % 3) * 2;
      const ry = ryBase + (i % 3) * (ryBase > 6 ? 3 : 1.5);
      svg += `<polygon points="${rockPoints(cx, cy, rx, ry, 0.28, seedBase + i)}" fill="#7a5cc4" stroke="#e8d8ff" stroke-width="2"></polygon>`;
    }
    return svg;
  }
  function radialDebrisPolygons(count, seedBase) {
    let svg = "";
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (i % 3) * 0.15;
      const dist = 26 + (i % 3) * 16;
      const cx = 100 + Math.cos(angle) * dist;
      const cy = 100 + Math.sin(angle) * dist;
      svg += `<polygon points="${rockPoints(cx, cy, 6 + (i % 3) * 2, 5 + (i % 3) * 1.5, 0.3, seedBase + i)}" fill="#8a7458" stroke="#2a1f18" stroke-width="2"></polygon>`;
    }
    return svg;
  }

  const bossEffectSvgs = {
    slamShardBurst: `
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <defs>
          <radialGradient id="slamWindGlow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stop-color="#bfe3e3" stop-opacity="0.5"/>
            <stop offset="1" stop-color="#bfe3e3" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <circle cx="100" cy="100" r="90" fill="url(#slamWindGlow)" opacity="0.3"/>
        <circle cx="100" cy="100" r="55" fill="none" stroke="#c9a8f0" stroke-width="3" opacity="0.6"/>
        <circle cx="100" cy="100" r="78" fill="none" stroke="#9b7fc4" stroke-width="2" opacity="0.35"/>
        <path d="M100,100 L70,150 M100,100 L135,145 M100,100 L60,90 M100,100 L145,75" stroke="#5a4a8a" stroke-width="2" opacity="0.4"/>
        ${radialShardPolygons({ count: 10, seedBase: 400, rxBase: 5, ryBase: 8, angleJitter: 0.12, distBase: 24, distStep: 18 })}
        <circle cx="100" cy="100" r="14" fill="#8fe0ff"/>
      </svg>`,
    coreShatter: `
      <svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
        <defs>
          <radialGradient id="coreShatterGlow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stop-color="#8fe0ff" stop-opacity="0.9"/>
            <stop offset="1" stop-color="#8fe0ff" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <circle cx="80" cy="80" r="72" fill="url(#coreShatterGlow)" opacity="0.8"/>
        <polygon points="80,25 90,55 122,50 96,70 110,100 80,82 50,100 64,70 38,50 70,55" fill="#8fe0ff" stroke="#e8d8ff" stroke-width="2.5"/>
        <circle cx="80" cy="80" r="14" fill="#e8d8ff"/>
        <polygon points="42,42 34,30 48,34" fill="#9b7fc4" opacity="0.85"/>
        <polygon points="120,40 132,30 126,46" fill="#9b7fc4" opacity="0.85"/>
        <polygon points="120,120 132,130 118,134" fill="#9b7fc4" opacity="0.85"/>
      </svg>`,
  };
  const bossEffectMeta = {
    slamShardBurst: { width: 130, height: 130, groundFraction: 0.5 },
    coreShatter: { width: 110, height: 110, groundFraction: 0.5 },
  };
  const bossEffects = {};
  for (const [key, svg] of Object.entries(bossEffectSvgs)) {
    bossEffects[key] = { image: svgToImage(svg), width: bossEffectMeta[key].width, height: bossEffectMeta[key].height, groundFraction: bossEffectMeta[key].groundFraction };
  }

  // --- Earth Crush (Wall Breaker) ---------------------------------------

  // "A smashing spell that shatters an Earth Wall — or any rock obstacle —
  // into flying debris." First spell taught in the Spawn Hub; used both on
  // the village's boundary gate and (like the existing Earth Breaker spell)
  // on ordinary rocks.
  const earthCrushSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      <defs>
        <radialGradient id="earthCrushGlow" cx="0.5" cy="0.55" r="0.5">
          <stop offset="0" stop-color="#a68b5c" stop-opacity="0.55"/>
          <stop offset="1" stop-color="#a68b5c" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="85" fill="url(#earthCrushGlow)" opacity="0.5"/>
      <ellipse cx="100" cy="150" rx="50" ry="10" fill="#2a1f18" opacity="0.2"/>
      <polygon points="72,150 62,120 78,100 66,80 84,60 100,150" fill="#8a8478" stroke="#2a1f18" stroke-width="2.5" opacity="0.5"/>
      <polygon points="128,150 138,118 122,98 132,78 116,58 100,150" fill="#7a756a" stroke="#2a1f18" stroke-width="2.5" opacity="0.5"/>
      ${radialDebrisPolygons(10, 200)}
      <circle cx="100" cy="100" r="16" fill="#6b5a44" stroke="#e8dcc0" stroke-width="2.5"/>
    </svg>`;
  spellEffects.earthCrush = {
    image: svgToImage(earthCrushSvg),
    width: 130,
    height: 130,
    groundFraction: 0.5,
  };

  return { trees, TREE_VIEWBOX, foliage, mushrooms, rocks, campfire, ambient, spellEffects, golemRig, playerRig, biomeTrees, biomeFoliage, enemyRigs, npcs, hubFeatures, bossArena, crystalBarrier, barrierRingPoints, bossEffects };
})();
