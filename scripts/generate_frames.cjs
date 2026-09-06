const fs = require('fs');
const path = require('path');

const framesDir = path.join(__dirname, '..', 'public', 'frames');
if (!fs.existsSync(framesDir)) {
  fs.mkdirSync(framesDir, { recursive: true });
}

// Color palettes for all 9 ornamental gothic frames
const FRAMES_CONFIG = [
  {
    fileName: 'moldura_10_negro_dourado.png',
    svgName: 'moldura_10_negro_dourado.svg',
    primaryColor: '#d4af37',      // Gold filigree
    secondaryColor: '#1c1917',    // Dark iron
    accentColor: '#991b1b',       // Deep Ruby red
    gemLight: '#ef4444',          // Ruby highlight
    gemBorder: '#f59e0b',         // Gold bezel
    trimColor: '#eab308',
    glowColor: 'rgba(212, 175, 55, 0.5)',
    name: 'Negro & Dourado',
  },
  {
    fileName: 'moldura_01_rubi.png',
    svgName: 'moldura_01_rubi.svg',
    primaryColor: '#ef4444',
    secondaryColor: '#450a0a',
    accentColor: '#b91c1c',
    gemLight: '#f87171',
    gemBorder: '#fca5a5',
    trimColor: '#dc2626',
    glowColor: 'rgba(239, 68, 68, 0.5)',
    name: 'Rubi',
  },
  {
    fileName: 'moldura_02_azul_petroleo.png',
    svgName: 'moldura_02_azul_petroleo.svg',
    primaryColor: '#06b6d4',
    secondaryColor: '#083344',
    accentColor: '#0e7490',
    gemLight: '#38bdf8',
    gemBorder: '#fbbf24',
    trimColor: '#f59e0b',
    glowColor: 'rgba(6, 182, 212, 0.5)',
    name: 'Azul Petróleo',
  },
  {
    fileName: 'moldura_03_verde_musgo.png',
    svgName: 'moldura_03_verde_musgo.svg',
    primaryColor: '#22c55e',
    secondaryColor: '#052e16',
    accentColor: '#15803d',
    gemLight: '#4ade80',
    gemBorder: '#eab308',
    trimColor: '#ca8a04',
    glowColor: 'rgba(34, 197, 94, 0.5)',
    name: 'Verde Musgo',
  },
  {
    fileName: 'moldura_04_roxo_ametista.png',
    svgName: 'moldura_04_roxo_ametista.svg',
    primaryColor: '#a855f7',
    secondaryColor: '#2e1065',
    accentColor: '#7e22ce',
    gemLight: '#c084fc',
    gemBorder: '#f59e0b',
    trimColor: '#eab308',
    glowColor: 'rgba(168, 85, 247, 0.5)',
    name: 'Roxo Ametista',
  },
  {
    fileName: 'moldura_05_prata_frio.png',
    svgName: 'moldura_05_prata_frio.svg',
    primaryColor: '#cbd5e1',
    secondaryColor: '#0f172a',
    accentColor: '#64748b',
    gemLight: '#f8fafc',
    gemBorder: '#94a3b8',
    trimColor: '#e2e8f0',
    glowColor: 'rgba(203, 213, 225, 0.5)',
    name: 'Prata Frio',
  },
  {
    fileName: 'moldura_07_azul_noite.png',
    svgName: 'moldura_07_azul_noite.svg',
    primaryColor: '#3b82f6',
    secondaryColor: '#172554',
    accentColor: '#1d4ed8',
    gemLight: '#60a5fa',
    gemBorder: '#facc15',
    trimColor: '#eab308',
    glowColor: 'rgba(59, 130, 246, 0.5)',
    name: 'Azul Noite',
  },
  {
    fileName: 'moldura_08_ambar.png',
    svgName: 'moldura_08_ambar.svg',
    primaryColor: '#f97316',
    secondaryColor: '#431407',
    accentColor: '#c2410c',
    gemLight: '#fb923c',
    gemBorder: '#fde047',
    trimColor: '#eab308',
    glowColor: 'rgba(249, 115, 22, 0.5)',
    name: 'Âmbar',
  },
  {
    fileName: 'moldura_09_turquesa.png',
    svgName: 'moldura_09_turquesa.svg',
    primaryColor: '#14b8a6',
    secondaryColor: '#042f2e',
    accentColor: '#0f766e',
    gemLight: '#2dd4bf',
    gemBorder: '#d97706',
    trimColor: '#b45309',
    glowColor: 'rgba(20, 184, 166, 0.5)',
    name: 'Turquesa',
  },
];

function generateGothicFrameSvg(cfg) {
  // Width 1200 x Height 1700 (aspect ~ 1:1.41)
  const W = 1200;
  const H = 1700;
  const T = 36; // outer border thickness
  const C = 190; // corner size

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="100%" height="100%" fill="none">
  <defs>
    <!-- Filter for drop shadow / 3D embossed look -->
    <filter id="shadow-${cfg.name.replace(/\s+/g, '')}" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.8"/>
    </filter>
    <filter id="glow-${cfg.name.replace(/\s+/g, '')}" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="${cfg.primaryColor}" flood-opacity="0.6"/>
    </filter>
    
    <!-- Linear Gradients -->
    <linearGradient id="goldGrad-${cfg.name.replace(/\s+/g, '')}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${cfg.trimColor}"/>
      <stop offset="35%" stop-color="${cfg.primaryColor}"/>
      <stop offset="70%" stop-color="${cfg.secondaryColor}"/>
      <stop offset="100%" stop-color="${cfg.trimColor}"/>
    </linearGradient>

    <linearGradient id="ironGrad-${cfg.name.replace(/\s+/g, '')}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${cfg.secondaryColor}"/>
      <stop offset="50%" stop-color="#09090b"/>
      <stop offset="100%" stop-color="${cfg.secondaryColor}"/>
    </linearGradient>

    <radialGradient id="gemGrad-${cfg.name.replace(/\s+/g, '')}" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="${cfg.gemLight}"/>
      <stop offset="45%" stop-color="${cfg.accentColor}"/>
      <stop offset="85%" stop-color="${cfg.secondaryColor}"/>
      <stop offset="100%" stop-color="#000000"/>
    </radialGradient>
  </defs>

  <!-- ================= OUTER FRAME BORDER ================= -->
  <!-- Outer Rim with Inset Profile -->
  <rect x="12" y="12" width="${W - 24}" height="${H - 24}" rx="32" ry="32" 
        stroke="url(#goldGrad-${cfg.name.replace(/\s+/g, '')})" stroke-width="6" fill="none" />
  
  <!-- Outer Dark Iron Base Track -->
  <path d="
    M 50,18
    L ${W - 50},18
    A 32,32 0 0,1 ${W - 18},50
    L ${W - 18},${H - 50}
    A 32,32 0 0,1 ${W - 50},${H - 18}
    L 50,${H - 18}
    A 32,32 0 0,1 18,${H - 50}
    L 18,50
    A 32,32 0 0,1 50,18
    Z
    M 64,36
    A 16,16 0 0,0 36,64
    L 36,${H - 64}
    A 16,16 0 0,0 64,${H - 36}
    L ${W - 64},${H - 36}
    A 16,16 0 0,0 ${W - 36},${H - 64}
    L ${W - 36},64
    A 16,16 0 0,0 ${W - 64},36
    Z"
    fill="url(#ironGrad-${cfg.name.replace(/\s+/g, '')})" fill-rule="evenodd" stroke="${cfg.primaryColor}" stroke-width="2" />

  <!-- Inner Gold Bevel Line -->
  <rect x="36" y="36" width="${W - 72}" height="${H - 72}" rx="16" ry="16"
        stroke="${cfg.primaryColor}" stroke-width="3" fill="none" opacity="0.9" />
  
  <!-- Inner Delicate Filigree Inset Line -->
  <rect x="44" y="44" width="${W - 88}" height="${H - 88}" rx="12" ry="12"
        stroke="${cfg.secondaryColor}" stroke-width="1.5" fill="none" stroke-dasharray="8,4" opacity="0.8" />

  <!-- ================= 4 CORNER GOTHIC CUSPS & ARABESQUES ================= -->
  
  <!-- TOP-LEFT CORNER -->
  <g transform="translate(14, 14)">
    <!-- Base Corner Shield / Arch -->
    <path d="M 0,0 L 0,${C} C 40,${C - 20} ${C - 60},120 ${C - 20},40 C ${C - 10},20 ${C},0 ${C},0 L 0,0 Z" 
          fill="url(#ironGrad-${cfg.name.replace(/\s+/g, '')})" stroke="${cfg.primaryColor}" stroke-width="3.5" />
    
    <!-- Gothic Trefoil / Cusps Arc -->
    <path d="M 12,${C - 15} C 45,${C - 35} 70,${C - 70} 70,${C - 100} C 70,${C - 130} 40,${C - 150} 12,${C - 165}" 
          stroke="${cfg.trimColor}" stroke-width="3" fill="none"/>
    <path d="M ${C - 15},12 C ${C - 35},45 ${C - 70},70 ${C - 100},70 C ${C - 130},70 ${C - 150},40 ${C - 165},12" 
          stroke="${cfg.trimColor}" stroke-width="3" fill="none"/>
    
    <!-- Inner Leaf Filigree Scroll -->
    <path d="M 28,28 Q 75,35 90,80 Q 95,115 55,105 Q 35,98 38,70 Q 40,45 28,28 Z" 
          fill="${cfg.accentColor}" stroke="${cfg.primaryColor}" stroke-width="2" opacity="0.95" />
    <path d="M 45,45 Q 95,75 105,55 Q 115,35 80,90" 
          stroke="${cfg.gemLight}" stroke-width="2" fill="none" opacity="0.8"/>

    <!-- Corner Jewel Gemstone -->
    <circle cx="58" cy="58" r="18" fill="url(#gemGrad-${cfg.name.replace(/\s+/g, '')})" stroke="${cfg.gemBorder}" stroke-width="3.5" filter="url(#glow-${cfg.name.replace(/\s+/g, '')})"/>
    <circle cx="54" cy="54" r="5" fill="#ffffff" opacity="0.6"/>
    <!-- Gem Star Accent -->
    <path d="M 58,34 L 58,82 M 34,58 L 82,58 M 41,41 L 75,75 M 41,75 L 75,41" stroke="${cfg.gemBorder}" stroke-width="1.5" opacity="0.7"/>
  </g>

  <!-- TOP-RIGHT CORNER -->
  <g transform="translate(${W - 14}, 14) scale(-1, 1)">
    <path d="M 0,0 L 0,${C} C 40,${C - 20} ${C - 60},120 ${C - 20},40 C ${C - 10},20 ${C},0 ${C},0 L 0,0 Z" 
          fill="url(#ironGrad-${cfg.name.replace(/\s+/g, '')})" stroke="${cfg.primaryColor}" stroke-width="3.5" />
    <path d="M 12,${C - 15} C 45,${C - 35} 70,${C - 70} 70,${C - 100} C 70,${C - 130} 40,${C - 150} 12,${C - 165}" 
          stroke="${cfg.trimColor}" stroke-width="3" fill="none"/>
    <path d="M ${C - 15},12 C ${C - 35},45 ${C - 70},70 ${C - 100},70 C ${C - 130},70 ${C - 150},40 ${C - 165},12" 
          stroke="${cfg.trimColor}" stroke-width="3" fill="none"/>
    <path d="M 28,28 Q 75,35 90,80 Q 95,115 55,105 Q 35,98 38,70 Q 40,45 28,28 Z" 
          fill="${cfg.accentColor}" stroke="${cfg.primaryColor}" stroke-width="2" opacity="0.95" />
    <path d="M 45,45 Q 95,75 105,55 Q 115,35 80,90" 
          stroke="${cfg.gemLight}" stroke-width="2" fill="none" opacity="0.8"/>
    <circle cx="58" cy="58" r="18" fill="url(#gemGrad-${cfg.name.replace(/\s+/g, '')})" stroke="${cfg.gemBorder}" stroke-width="3.5" filter="url(#glow-${cfg.name.replace(/\s+/g, '')})"/>
    <circle cx="54" cy="54" r="5" fill="#ffffff" opacity="0.6"/>
    <path d="M 58,34 L 58,82 M 34,58 L 82,58 M 41,41 L 75,75 M 41,75 L 75,41" stroke="${cfg.gemBorder}" stroke-width="1.5" opacity="0.7"/>
  </g>

  <!-- BOTTOM-LEFT CORNER -->
  <g transform="translate(14, ${H - 14}) scale(1, -1)">
    <path d="M 0,0 L 0,${C} C 40,${C - 20} ${C - 60},120 ${C - 20},40 C ${C - 10},20 ${C},0 ${C},0 L 0,0 Z" 
          fill="url(#ironGrad-${cfg.name.replace(/\s+/g, '')})" stroke="${cfg.primaryColor}" stroke-width="3.5" />
    <path d="M 12,${C - 15} C 45,${C - 35} 70,${C - 70} 70,${C - 100} C 70,${C - 130} 40,${C - 150} 12,${C - 165}" 
          stroke="${cfg.trimColor}" stroke-width="3" fill="none"/>
    <path d="M ${C - 15},12 C ${C - 35},45 ${C - 70},70 ${C - 100},70 C ${C - 130},70 ${C - 150},40 ${C - 165},12" 
          stroke="${cfg.trimColor}" stroke-width="3" fill="none"/>
    <path d="M 28,28 Q 75,35 90,80 Q 95,115 55,105 Q 35,98 38,70 Q 40,45 28,28 Z" 
          fill="${cfg.accentColor}" stroke="${cfg.primaryColor}" stroke-width="2" opacity="0.95" />
    <path d="M 45,45 Q 95,75 105,55 Q 115,35 80,90" 
          stroke="${cfg.gemLight}" stroke-width="2" fill="none" opacity="0.8"/>
    <circle cx="58" cy="58" r="18" fill="url(#gemGrad-${cfg.name.replace(/\s+/g, '')})" stroke="${cfg.gemBorder}" stroke-width="3.5" filter="url(#glow-${cfg.name.replace(/\s+/g, '')})"/>
    <circle cx="54" cy="54" r="5" fill="#ffffff" opacity="0.6"/>
    <path d="M 58,34 L 58,82 M 34,58 L 82,58 M 41,41 L 75,75 M 41,75 L 75,41" stroke="${cfg.gemBorder}" stroke-width="1.5" opacity="0.7"/>
  </g>

  <!-- BOTTOM-RIGHT CORNER -->
  <g transform="translate(${W - 14}, ${H - 14}) scale(-1, -1)">
    <path d="M 0,0 L 0,${C} C 40,${C - 20} ${C - 60},120 ${C - 20},40 C ${C - 10},20 ${C},0 ${C},0 L 0,0 Z" 
          fill="url(#ironGrad-${cfg.name.replace(/\s+/g, '')})" stroke="${cfg.primaryColor}" stroke-width="3.5" />
    <path d="M 12,${C - 15} C 45,${C - 35} 70,${C - 70} 70,${C - 100} C 70,${C - 130} 40,${C - 150} 12,${C - 165}" 
          stroke="${cfg.trimColor}" stroke-width="3" fill="none"/>
    <path d="M ${C - 15},12 C ${C - 35},45 ${C - 70},70 ${C - 100},70 C ${C - 130},70 ${C - 150},40 ${C - 165},12" 
          stroke="${cfg.trimColor}" stroke-width="3" fill="none"/>
    <path d="M 28,28 Q 75,35 90,80 Q 95,115 55,105 Q 35,98 38,70 Q 40,45 28,28 Z" 
          fill="${cfg.accentColor}" stroke="${cfg.primaryColor}" stroke-width="2" opacity="0.95" />
    <path d="M 45,45 Q 95,75 105,55 Q 115,35 80,90" 
          stroke="${cfg.gemLight}" stroke-width="2" fill="none" opacity="0.8"/>
    <circle cx="58" cy="58" r="18" fill="url(#gemGrad-${cfg.name.replace(/\s+/g, '')})" stroke="${cfg.gemBorder}" stroke-width="3.5" filter="url(#glow-${cfg.name.replace(/\s+/g, '')})"/>
    <circle cx="54" cy="54" r="5" fill="#ffffff" opacity="0.6"/>
    <path d="M 58,34 L 58,82 M 34,58 L 82,58 M 41,41 L 75,75 M 41,75 L 75,41" stroke="${cfg.gemBorder}" stroke-width="1.5" opacity="0.7"/>
  </g>

  <!-- ================= 4 CENTRAL MEDALLIONS / GOTHIC FLEUR-DE-LIS PEAKS ================= -->

  <!-- TOP CENTER FLEURON -->
  <g transform="translate(${W / 2}, 24)">
    <path d="M 0,-18 L 18,0 L 0,18 L -18,0 Z" fill="url(#ironGrad-${cfg.name.replace(/\s+/g, '')})" stroke="${cfg.primaryColor}" stroke-width="3" />
    <path d="M 0,-24 L 6,-6 L 24,0 L 6,6 L 0,24 L -6,6 L -24,0 L -6,-6 Z" fill="${cfg.accentColor}" stroke="${cfg.gemBorder}" stroke-width="1.5" />
    <circle cx="0" cy="0" r="7" fill="url(#gemGrad-${cfg.name.replace(/\s+/g, '')})" stroke="${cfg.trimColor}" stroke-width="2" />
    <path d="M -40,0 Q -25,-12 0,-18 Q 25,-12 40,0" stroke="${cfg.primaryColor}" stroke-width="2" fill="none"/>
  </g>

  <!-- BOTTOM CENTER FLEURON -->
  <g transform="translate(${W / 2}, ${H - 24}) scale(1, -1)">
    <path d="M 0,-18 L 18,0 L 0,18 L -18,0 Z" fill="url(#ironGrad-${cfg.name.replace(/\s+/g, '')})" stroke="${cfg.primaryColor}" stroke-width="3" />
    <path d="M 0,-24 L 6,-6 L 24,0 L 6,6 L 0,24 L -6,6 L -24,0 L -6,-6 Z" fill="${cfg.accentColor}" stroke="${cfg.gemBorder}" stroke-width="1.5" />
    <circle cx="0" cy="0" r="7" fill="url(#gemGrad-${cfg.name.replace(/\s+/g, '')})" stroke="${cfg.trimColor}" stroke-width="2" />
    <path d="M -40,0 Q -25,-12 0,-18 Q 25,-12 40,0" stroke="${cfg.primaryColor}" stroke-width="2" fill="none"/>
  </g>

  <!-- LEFT CENTER FLEURON -->
  <g transform="translate(24, ${H / 2}) rotate(-90)">
    <path d="M 0,-18 L 18,0 L 0,18 L -18,0 Z" fill="url(#ironGrad-${cfg.name.replace(/\s+/g, '')})" stroke="${cfg.primaryColor}" stroke-width="3" />
    <path d="M 0,-24 L 6,-6 L 24,0 L 6,6 L 0,24 L -6,6 L -24,0 L -6,-6 Z" fill="${cfg.accentColor}" stroke="${cfg.gemBorder}" stroke-width="1.5" />
    <circle cx="0" cy="0" r="7" fill="url(#gemGrad-${cfg.name.replace(/\s+/g, '')})" stroke="${cfg.trimColor}" stroke-width="2" />
    <path d="M -40,0 Q -25,-12 0,-18 Q 25,-12 40,0" stroke="${cfg.primaryColor}" stroke-width="2" fill="none"/>
  </g>

  <!-- RIGHT CENTER FLEURON -->
  <g transform="translate(${W - 24}, ${H / 2}) rotate(90)">
    <path d="M 0,-18 L 18,0 L 0,18 L -18,0 Z" fill="url(#ironGrad-${cfg.name.replace(/\s+/g, '')})" stroke="${cfg.primaryColor}" stroke-width="3" />
    <path d="M 0,-24 L 6,-6 L 24,0 L 6,6 L 0,24 L -6,6 L -24,0 L -6,-6 Z" fill="${cfg.accentColor}" stroke="${cfg.gemBorder}" stroke-width="1.5" />
    <circle cx="0" cy="0" r="7" fill="url(#gemGrad-${cfg.name.replace(/\s+/g, '')})" stroke="${cfg.trimColor}" stroke-width="2" />
    <path d="M -40,0 Q -25,-12 0,-18 Q 25,-12 40,0" stroke="${cfg.primaryColor}" stroke-width="2" fill="none"/>
  </g>
</svg>`;
}

for (const cfg of FRAMES_CONFIG) {
  const svgContent = generateGothicFrameSvg(cfg);
  const svgPath = path.join(framesDir, cfg.svgName);
  fs.writeFileSync(svgPath, svgContent, 'utf8');

  // Also write the .png reference as an SVG data or SVG alias for 100% crisp vector scaling
  const pngPath = path.join(framesDir, cfg.fileName);
  fs.writeFileSync(pngPath, svgContent, 'utf8');
}

console.log('Successfully generated all 9 gothic frame assets in public/frames/ !');
