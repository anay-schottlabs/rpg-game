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

  return { trees, TREE_VIEWBOX };
})();
