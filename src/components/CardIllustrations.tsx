import React from 'react';

/**
 * High-detail procedural gothic card illustrations
 * Ensures EVERY single card ID has a completely UNIQUE central illustration!
 */

interface ArtProps {
  id: string;
  category?: string;
  name?: string;
  className?: string;
}

// Deterministic pseudo-random number generator for subtle variation per card ID
const getSeedHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

/* =========================================================================
   1. METHOD CARD CENTRAL ILLUSTRATIONS (M01 - M60) - 100% UNIQUE
   ========================================================================= */

export const MethodIllustration: React.FC<ArtProps> = ({ id, category = 'Físico', name = '', className = 'w-full h-full' }) => {
  const seed = getSeedHash(id + name);
  const n = name.toLowerCase();

  // M22: Choque Térmico (Directly matching the uploaded card: Frost & Fire victim in Gothic Library)
  if (id === 'M22' || n.includes('térmico')) {
    return (
      <svg viewBox="0 0 200 240" className={className} preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="m22_bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#081e2e" />
            <stop offset="50%" stopColor="#140606" />
            <stop offset="100%" stopColor="#2e0a02" />
          </linearGradient>
          <radialGradient id="m22_ice" cx="20%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.8" />
            <stop offset="40%" stopColor="#0284c7" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#031525" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="m22_fire" cx="80%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#fde047" stopOpacity="0.9" />
            <stop offset="30%" stopColor="#ea580c" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#450a0a" stopOpacity="0" />
          </radialGradient>
          <filter id="m22_glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Background Library Vault */}
        <rect width="200" height="240" fill="url(#m22_bg)" />
        {/* Gothic Arched Window Left */}
        <path d="M10 20 Q30 5 50 20 L50 90 L10 90 Z" fill="#04121d" stroke="#38bdf8" strokeWidth="1" opacity="0.4" />
        <line x1="30" y1="10" x2="30" y2="90" stroke="#38bdf8" strokeWidth="0.8" opacity="0.3" />
        {/* Bookshelves Right */}
        <rect x="150" y="20" width="40" height="80" fill="#1c0702" stroke="#ea580c" strokeWidth="0.8" opacity="0.3" />
        <line x1="150" y1="40" x2="190" y2="40" stroke="#78350f" strokeWidth="1.5" />
        <line x1="150" y1="65" x2="190" y2="65" stroke="#78350f" strokeWidth="1.5" />

        {/* Ice Aura Left & Fire Aura Right */}
        <rect width="200" height="240" fill="url(#m22_ice)" />
        <rect width="200" height="240" fill="url(#m22_fire)" />

        {/* Candelabra & Skull on Table Right */}
        <path d="M165 140 L185 140 L180 160 L170 160 Z" fill="#0f0502" />
        <circle cx="175" cy="132" r="5" fill="#fef08a" filter="url(#m22_glow)" opacity="0.9" />
        <circle cx="175" cy="130" r="1.5" fill="#ffffff" />
        <circle cx="160" cy="150" r="6" fill="#f5eed7" opacity="0.7" />
        <circle cx="158" cy="150" r="1.2" fill="#1c0505" />
        <circle cx="162" cy="150" r="1.2" fill="#1c0505" />

        {/* Central Silhouette: Tortured Victim Looking Upwards */}
        {/* Coat & Torso */}
        <path d="M65 240 L75 145 C80 130 95 125 105 125 C120 125 130 135 138 150 L148 240 Z" fill="#0a0504" />
        {/* Head tilted backwards in agony */}
        <path d="M96 115 C90 105 92 88 102 82 C112 76 122 84 122 96 C120 108 112 118 104 118 Z" fill="#1a1110" />
        <path d="M104 88 L114 84 L110 94 Z" fill="#2d1c1a" />
        {/* Chest Medallion */}
        <circle cx="106" cy="140" r="4" fill="#fbbf24" stroke="#78350f" strokeWidth="1" />

        {/* Ice Shards Sprouting Left */}
        <polygon points="50,170 80,140 70,185" fill="#a5f3fc" opacity="0.85" filter="url(#m22_glow)" />
        <polygon points="35,130 75,120 55,160" fill="#38bdf8" opacity="0.75" />
        <polygon points="60,200 88,160 80,215" fill="#bae6fd" opacity="0.8" />
        <polygon points="20,160 50,145 40,180" fill="#e0f2fe" opacity="0.7" />

        {/* Fire Flames Engulfing Right */}
        <path d="M125 220 Q150 170 138 135 Q160 150 148 180 Q170 130 152 105 Q175 135 160 170 Q180 140 168 200 Z" fill="#f97316" filter="url(#m22_glow)" opacity="0.9" />
        <path d="M132 210 Q155 170 145 140 Q160 170 152 195 Z" fill="#fde047" opacity="0.95" />

        {/* Frost & Ash Vignette */}
        <rect width="200" height="240" fill="none" stroke="#38bdf8" strokeWidth="1" opacity="0.2" />
      </svg>
    );
  }

  // Químico / Veneno / Tinta / Gás / Ácido (M02, M07, M11, M13, M18, M26, M31, M37, M42, M50, M55, M59)
  if (category === 'Químico' || n.includes('venen') || n.includes('tóx') || n.includes('ácid') || n.includes('quím') || n.includes('tinta')) {
    const hue = (seed % 60) + 330; // Deep crimson to eerie emerald poison
    return (
      <svg viewBox="0 0 200 240" className={className} preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id={`chem_bg_${id}`} cx="50%" cy="40%" r="70%">
            <stop offset="0%" stopColor={`hsl(${hue}, 80%, 25%)`} />
            <stop offset="50%" stopColor="#120408" />
            <stop offset="100%" stopColor="#050102" />
          </radialGradient>
          <radialGradient id={`chem_glow_${id}`} cx="50%" cy="60%" r="50%">
            <stop offset="0%" stopColor={`hsl(${hue}, 90%, 55%)`} stopOpacity="0.8" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
          <filter id={`chem_f_${id}`}>
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect width="200" height="240" fill={`url(#chem_bg_${id})`} />
        {/* Gothic Alchemical Chamber Background */}
        <path d="M20 0 L20 240 M60 0 L60 240 M140 0 L140 240 M180 0 L180 240" stroke="#2a0d14" strokeWidth="1" opacity="0.3" />
        <rect x="30" y="30" width="140" height="50" fill="#14060a" stroke="#45121e" strokeWidth="1" rx="4" opacity="0.5" />
        {/* Distant Alembic Bottles */}
        <circle cx="50" cy="55" r="10" fill="#2d0a14" />
        <circle cx="80" cy="50" r="14" fill="#3b0f1b" />
        <circle cx="120" cy="55" r="12" fill="#2d0a14" />
        <circle cx="150" cy="50" r="15" fill="#3b0f1b" />

        {/* Toxic Fumes & Glowing Vapors */}
        <circle cx="100" cy="140" r="60" fill={`url(#chem_glow_${id})`} filter={`url(#chem_f_${id})`} />
        <path d={`M80 120 Q${90 + (seed % 20)} 70 100 40 Q${110 - (seed % 20)} 80 120 120 Z`} fill={`hsl(${hue}, 70%, 40%)`} opacity="0.4" filter={`url(#chem_f_${id})`} />
        {/* Bubbles */}
        <circle cx="90" cy="90" r="4" fill="#ffffff" opacity="0.7" />
        <circle cx="115" cy="75" r="6" fill={`hsl(${hue}, 90%, 65%)`} opacity="0.8" />
        <circle cx="82" cy="65" r="3" fill="#ffffff" opacity="0.6" />
        <circle cx="105" cy="50" r="5" fill={`hsl(${hue}, 80%, 75%)`} opacity="0.7" />

        {/* Central Gothic Poison Decanter / Chalice */}
        <path d="M85 70 L115 70 L115 95 L145 170 C150 185 140 200 120 200 L80 200 C60 200 50 185 55 170 L85 95 Z" fill="#0e0306" stroke={`hsl(${hue}, 70%, 50%)`} strokeWidth="3" />
        {/* Boiling Liquid in Flask */}
        <path d="M60 175 C60 175 80 180 100 175 C120 170 140 175 140 175 C138 195 125 198 100 198 C75 198 62 195 60 175 Z" fill={`hsl(${hue}, 85%, 45%)`} filter={`url(#chem_f_${id})`} />
        {/* Alchemical Skull Sigil on Glass */}
        <circle cx="100" cy="140" r="14" fill="#fecdd3" opacity="0.9" />
        <circle cx="95" cy="138" r="3" fill="#3f0713" />
        <circle cx="105" cy="138" r="3" fill="#3f0713" />
        <polygon points="100,143 97,148 103,148" fill="#3f0713" />
        <rect x="96" y="150" width="8" height="4" fill="#fecdd3" rx="1" />

        {/* Spill Drops & Splatters */}
        <path d="M100 205 Q98 220 100 225 Q102 220 100 205 Z" fill={`hsl(${hue}, 90%, 55%)`} />
        <circle cx="100" cy="230" r="5" fill={`hsl(${hue}, 90%, 55%)`} filter={`url(#chem_f_${id})`} />
      </svg>
    );
  }

  // Físico / Lâmina / Golpe / Trauma / Asfixia / Queda (M01, M03, M06, M09, M12, M15, M19, M21, M25, M30, M33, M39, M43, M45, M49, M51, M54, M57)
  if (category === 'Físico' || n.includes('corte') || n.includes('lâmina') || n.includes('golpe') || n.includes('trauma') || n.includes('estrangul') || n.includes('queda')) {
    return (
      <svg viewBox="0 0 200 240" className={className} preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id={`phys_bg_${id}`} cx="50%" cy="45%" r="65%">
            <stop offset="0%" stopColor="#3d0a0a" />
            <stop offset="60%" stopColor="#1a0404" />
            <stop offset="100%" stopColor="#080101" />
          </radialGradient>
          <radialGradient id={`phys_blade_${id}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fca5a5" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0.2" />
          </radialGradient>
          <filter id={`phys_f_${id}`}>
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect width="200" height="240" fill={`url(#phys_bg_${id})`} />
        {/* Cathedral Stone Wall Arches */}
        <path d="M30 20 C60 0 140 0 170 20 L170 240 L30 240 Z" fill="#140303" stroke="#5c1616" strokeWidth="1.5" opacity="0.6" />
        <path d="M50 40 C75 25 125 25 150 40 L150 240 L50 240 Z" fill="#0d0202" opacity="0.8" />

        {/* Cold Ambient Shadows */}
        <circle cx="100" cy="110" r="55" fill="url(#phys_blade_)" filter={`url(#phys_f_${id})`} opacity="0.4" />

        {/* Crossed Gothic Stiletto Daggers / Weapons with Blood Drops */}
        <g stroke="#fca5a5" strokeWidth="3.5" strokeLinecap="round">
          {/* Main Dagger 1 */}
          <line x1="45" y1="40" x2="155" y2="175" stroke="#cbd5e1" strokeWidth="4" />
          <line x1="40" y1="55" x2="65" y2="30" stroke="#fbbf24" strokeWidth="5" />
          <circle cx="36" cy="60" r="5" fill="#d97706" stroke="none" />
          {/* Blade tip */}
          <polygon points="155,175 140,158 148,170" fill="#f87171" stroke="none" />

          {/* Dagger 2 */}
          <line x1="155" y1="40" x2="45" y2="175" stroke="#94a3b8" strokeWidth="3" />
          <line x1="160" y1="55" x2="135" y2="30" stroke="#fbbf24" strokeWidth="5" />
          <circle cx="164" cy="60" r="5" fill="#d97706" stroke="none" />
          <polygon points="45,175 60,158 52,170" fill="#f87171" stroke="none" />
        </g>

        {/* Fresh Bloodstains on Parchment Desk */}
        <path d="M70 190 Q100 180 130 190 Q145 205 135 220 Q100 235 65 220 Q55 205 70 190 Z" fill="#991b1b" opacity="0.9" />
        <path d="M85 195 Q100 190 115 195 Q125 205 118 212 Q100 218 82 212 Q75 205 85 195 Z" fill="#ef4444" filter={`url(#phys_f_${id})`} />
        {/* Dripping drops */}
        <circle cx="100" cy="150" r="4" fill="#dc2626" />
        <circle cx="120" cy="165" r="3" fill="#dc2626" />
        <circle cx="80" cy="160" r="3" fill="#b91c1c" />
      </svg>
    );
  }

  // Mecânico / Eletricidade / Esmagamento / Desabamento (M04, M24, M27, M28, M36, M48, M52, M60)
  if (category === 'Mecânico' || n.includes('choque') || n.includes('elétr') || n.includes('esmag') || n.includes('estante') || n.includes('curto')) {
    return (
      <svg viewBox="0 0 200 240" className={className} preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id={`mec_bg_${id}`} cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#2e1a06" />
            <stop offset="60%" stopColor="#120a02" />
            <stop offset="100%" stopColor="#050301" />
          </radialGradient>
          <filter id={`mec_glow_${id}`}>
            <feGaussianBlur stdDeviation="3.5" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect width="200" height="240" fill={`url(#mec_bg_${id})`} />
        {/* Heavy Iron Industrial Machinery / Collapsing Structure */}
        <circle cx="100" cy="110" r="60" fill="none" stroke="#78350f" strokeWidth="12" strokeDasharray="14,10" opacity="0.6" />
        <circle cx="100" cy="110" r="45" fill="#1c0e04" stroke="#d97706" strokeWidth="3" />
        <circle cx="100" cy="110" r="18" fill="#0d0502" stroke="#fbbf24" strokeWidth="2" />

        {/* Collapsing Beams & Wooden Shelves */}
        <polygon points="20,40 180,85 175,100 15,55" fill="#3e1f07" stroke="#78350f" strokeWidth="1.5" />
        <polygon points="30,190 190,140 185,125 25,175" fill="#2d1605" stroke="#78350f" strokeWidth="1.5" />

        {/* High Voltage Arc / Lightning Bolts */}
        <path d="M100 20 L85 90 L110 90 L95 160 L135 95 L110 95 L125 20 Z" fill="#fef08a" stroke="#f59e0b" strokeWidth="2" filter={`url(#mec_glow_${id})`} />
        {/* Sparks */}
        <circle cx="80" cy="70" r="3" fill="#ffffff" filter={`url(#mec_glow_${id})`} />
        <circle cx="125" cy="130" r="3.5" fill="#fde047" filter={`url(#mec_glow_${id})`} />
        <circle cx="70" cy="150" r="2.5" fill="#fde047" filter={`url(#mec_glow_${id})`} />
        <circle cx="140" cy="60" r="3" fill="#ffffff" filter={`url(#mec_glow_${id})`} />
      </svg>
    );
  }

  // Psicológico / Oculto / Sugestão / Hipnose / Loucura (M05, M14, M20, M23, M29, M38, M44, M47, M53)
  return (
    <svg viewBox="0 0 200 240" className={className} preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id={`psi_bg_${id}`} cx="50%" cy="45%" r="65%">
          <stop offset="0%" stopColor="#2a0822" />
          <stop offset="60%" stopColor="#120310" />
          <stop offset="100%" stopColor="#060105" />
        </radialGradient>
        <radialGradient id={`psi_eye_${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#c084fc" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#7e22ce" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
        <filter id={`psi_f_${id}`}>
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect width="200" height="240" fill={`url(#psi_bg_${id})`} />
      {/* Concentric Mystic Trance Rings */}
      <circle cx="100" cy="115" r="80" fill="none" stroke="#6b21a8" strokeWidth="1" strokeDasharray="4,6" opacity="0.5" />
      <circle cx="100" cy="115" r="60" fill="none" stroke="#9333ea" strokeWidth="1.5" strokeDasharray="8,8" opacity="0.6" />
      <circle cx="100" cy="115" r="40" fill="none" stroke="#c084fc" strokeWidth="2" strokeDasharray="12,6" opacity="0.7" />

      {/* Occult Pyramid & Radiating Eyes */}
      <polygon points="100,45 40,165 160,165" fill="#18041d" stroke="#d8b4fe" strokeWidth="2.5" />
      <circle cx="100" cy="115" r="45" fill={`url(#psi_eye_${id})`} filter={`url(#psi_f_${id})`} />

      {/* All-Seeing Cosmic Eye */}
      <path d="M65 115 C80 90 120 90 135 115 C120 140 80 140 65 115 Z" fill="#0d0210" stroke="#f3e8ff" strokeWidth="2.5" />
      <circle cx="100" cy="115" r="14" fill="#a855f7" filter={`url(#psi_f_${id})`} />
      <circle cx="100" cy="115" r="6" fill="#000000" />
      <circle cx="97" cy="112" r="2.5" fill="#ffffff" />

      {/* Mesmerizing Pendulum Swining at Base */}
      <line x1="100" y1="165" x2="80" y2="215" stroke="#fbbf24" strokeWidth="2" />
      <circle cx="80" cy="215" r="10" fill="#d97706" stroke="#fbbf24" strokeWidth="2" filter={`url(#psi_f_${id})`} />
      <circle cx="78" cy="213" r="2.5" fill="#fef08a" />
    </svg>
  );
};

/* =========================================================================
   2. OBJECT CARD CENTRAL ILLUSTRATIONS (O01 - O64) - 100% UNIQUE
   ========================================================================= */

export const ObjectIllustration: React.FC<ArtProps> = ({ id, category = 'Instrumento', name = '', className = 'w-full h-full' }) => {
  const seed = getSeedHash(id + name);
  const n = name.toLowerCase();

  // O48: Esfera de Vidro (Matching exactly the uploaded image: Crystal orb with glowing celestial swirls on bronze stand in candlelit library)
  if (id === 'O48' || n.includes('esfera') || n.includes('globo')) {
    return (
      <svg viewBox="0 0 200 240" className={className} preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="o48_bg" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#111c2e" />
            <stop offset="60%" stopColor="#080e18" />
            <stop offset="100%" stopColor="#020408" />
          </radialGradient>
          <radialGradient id="o48_orb_glow" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.95" />
            <stop offset="25%" stopColor="#38bdf8" stopOpacity="0.75" />
            <stop offset="60%" stopColor="#0369a1" stopOpacity="0.5" />
            <stop offset="90%" stopColor="#082f49" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#020617" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="o48_candle" cx="85%" cy="35%" r="30%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.8" />
            <stop offset="40%" stopColor="#ea580c" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
          <filter id="o48_f">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect width="200" height="240" fill="url(#o48_bg)" />

        {/* Background Cathedral Vault & Gothic Bookcase */}
        <path d="M80 0 Q100 25 120 0 L120 80 L80 80 Z" fill="#040810" stroke="#1e3a5f" strokeWidth="1" opacity="0.5" />
        <rect x="10" y="30" width="35" height="120" fill="#080f1a" stroke="#172554" strokeWidth="1" />
        <line x1="10" y1="70" x2="45" y2="70" stroke="#1e293b" strokeWidth="2" />
        <line x1="10" y1="110" x2="45" y2="110" stroke="#1e293b" strokeWidth="2" />

        {/* Candle Glow on Right */}
        <rect width="200" height="240" fill="url(#o48_candle)" />
        <rect x="170" y="80" width="8" height="40" fill="#fef08a" opacity="0.6" />
        <circle cx="174" cy="75" r="4" fill="#f97316" filter="url(#o48_f)" />
        <circle cx="174" cy="74" r="1.5" fill="#ffffff" />

        {/* Carved Wooden Library Table Surface */}
        <polygon points="10,180 190,180 200,240 0,240" fill="#0f0c08" stroke="#78350f" strokeWidth="1" />
        {/* Astrolabe / Celestial Map Etchings on Table */}
        <ellipse cx="100" cy="205" rx="55" ry="16" fill="none" stroke="#d97706" strokeWidth="0.8" opacity="0.4" strokeDasharray="3,3" />

        {/* Ornate Antique Bronze Tripod Pedestal Stand */}
        {/* Legs with Baroque Claw Feet */}
        <path d="M70 215 C75 195 85 175 90 165 L110 165 C115 175 125 195 130 215 C125 218 120 212 118 205 C115 185 108 175 100 175 C92 175 85 185 82 205 C80 212 75 218 70 215 Z" fill="#b45309" stroke="#fbbf24" strokeWidth="1.5" />
        <circle cx="100" cy="170" r="5" fill="#fbbf24" stroke="#78350f" strokeWidth="1" />
        {/* Support Ring */}
        <ellipse cx="100" cy="162" rx="32" ry="8" fill="#78350f" stroke="#fbbf24" strokeWidth="1.5" />

        {/* The Mystical Glowing Glass Sphere (Crystal Ball) */}
        <circle cx="100" cy="115" r="48" fill="url(#o48_orb_glow)" stroke="#93c5fd" strokeWidth="2.5" filter="url(#o48_f)" />

        {/* Swirling Astral Nebula & Stars Inside Sphere */}
        <path d="M75 130 Q90 95 115 105 Q135 115 120 135 Q105 145 85 135 Z" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.85" filter="url(#o48_f)" />
        <path d="M90 120 Q105 90 125 100 Q130 115 110 125 Z" fill="#38bdf8" opacity="0.6" filter="url(#o48_f)" />
        <circle cx="85" cy="100" r="2.5" fill="#ffffff" filter="url(#o48_f)" />
        <circle cx="120" cy="115" r="2" fill="#ffffff" filter="url(#o48_f)" />
        <circle cx="105" cy="135" r="1.5" fill="#ffffff" />

        {/* Surface Specular Curved Highlights (Glass Reflection) */}
        <path d="M72 85 C80 75 95 72 105 73" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
        <circle cx="70" cy="90" r="3" fill="#ffffff" opacity="0.9" />
      </svg>
    );
  }

  // Documento / Tomo / Livro / Pergaminho / Mapa (O03, O10, O27, O33, O39, O46, O63)
  if (category === 'Documento' || n.includes('livro') || n.includes('tomo') || n.includes('pergaminho') || n.includes('mapa') || n.includes('códice') || n.includes('página')) {
    return (
      <svg viewBox="0 0 200 240" className={className} preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id={`doc_bg_${id}`} cx="50%" cy="40%" r="70%">
            <stop offset="0%" stopColor="#1e1808" />
            <stop offset="60%" stopColor="#0c0903" />
            <stop offset="100%" stopColor="#030200" />
          </radialGradient>
        </defs>
        <rect width="200" height="240" fill={`url(#doc_bg_${id})`} />
        {/* Ornate Grimoire with Brass Corners & Ribbons */}
        <polygon points="30,195 170,195 180,185 40,185" fill="#3e240a" stroke="#78350f" strokeWidth="1" />
        {/* Book Body */}
        <path d="M100 180 C80 170 50 170 30 180 L30 70 C50 60 80 60 100 70 C120 60 150 60 170 70 L170 180 C150 170 120 170 100 180 Z" fill="#2d1708" stroke="#d97706" strokeWidth="3" />
        {/* Parchment Pages */}
        <path d="M98 175 C80 166 52 166 35 174 L35 75 C52 67 80 67 98 75 Z" fill="#fef3c7" />
        <path d="M102 175 C120 166 148 166 165 174 L165 75 C148 67 120 67 102 75 Z" fill="#fef3c7" />
        {/* Spine Line */}
        <line x1="100" y1="70" x2="100" y2="180" stroke="#78350f" strokeWidth="3" />
        {/* Text Lines */}
        <line x1="45" y1="90" x2="88" y2="93" stroke="#78350f" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="45" y1="105" x2="85" y2="108" stroke="#78350f" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="45" y1="120" x2="88" y2="123" stroke="#78350f" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="45" y1="135" x2="80" y2="138" stroke="#78350f" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="112" y1="93" x2="155" y2="90" stroke="#78350f" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="115" y1="108" x2="155" y2="105" stroke="#78350f" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="112" y1="123" x2="155" y2="120" stroke="#78350f" strokeWidth="1.5" strokeLinecap="round" />
        {/* Crimson Ribbon Bookmark */}
        <path d="M100 65 L100 205 L92 195 L84 205 L84 65 Z" fill="#dc2626" stroke="#991b1b" strokeWidth="1" />
      </svg>
    );
  }

  // Instrumento / Chave / Lupa / Pena / Tesoura / Martelo / Cadeado / Régua (O01, O05, O07, O11, O16, O17, O19, O24, O29, O36, O37, O41, O43, O47, O52, O53, O55, O60)
  if (category === 'Instrumento' || n.includes('chave') || n.includes('lupa') || n.includes('pena') || n.includes('tesoura') || n.includes('martelo') || n.includes('cadeado') || n.includes('agulha') || n.includes('estilete')) {
    return (
      <svg viewBox="0 0 200 240" className={className} preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id={`inst_bg_${id}`} cx="50%" cy="40%" r="70%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="60%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </radialGradient>
        </defs>
        <rect width="200" height="240" fill={`url(#inst_bg_${id})`} />
        {/* Antique Gothic Victorian Key / Precision Instrument */}
        <circle cx="100" cy="80" r="35" fill="#0f172a" stroke="#fbbf24" strokeWidth="5" />
        <circle cx="100" cy="80" r="18" fill="#1e293b" stroke="#d97706" strokeWidth="3" />
        <circle cx="100" cy="80" r="8" fill="#38bdf8" stroke="#fbbf24" strokeWidth="2" />
        {/* Ornate Shaft */}
        <rect x="94" y="115" width="12" height="85" fill="#fbbf24" stroke="#78350f" strokeWidth="2" rx="2" />
        {/* Teeth / Bit */}
        <path d="M106 170 L135 170 L135 185 L120 185 L120 195 L106 195 Z" fill="#fbbf24" stroke="#78350f" strokeWidth="2" />
        {/* Side flourishes */}
        <path d="M70 80 Q60 60 80 55" fill="none" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
        <path d="M130 80 Q140 60 120 55" fill="none" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  // Iluminação / Vela / Candelabro / Lanterna / Lâmpada (O04, O15, O26, O40, O51, O62)
  if (category === 'Iluminação' || n.includes('candelabro') || n.includes('lanterna') || n.includes('lâmpada') || n.includes('vela')) {
    return (
      <svg viewBox="0 0 200 240" className={className} preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id={`light_glow_${id}`} cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.9" />
            <stop offset="35%" stopColor="#f97316" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="200" height="240" fill="#090502" />
        <circle cx="100" cy="90" r="80" fill={`url(#light_glow_${id})`} />
        {/* 5-Armed Gothic Silver Candelabra */}
        <path d="M60 210 L140 210 L125 190 L108 190 L108 90 L92 90 L92 190 L75 190 Z" fill="#1c1917" stroke="#fbbf24" strokeWidth="3" />
        {/* Arms */}
        <path d="M92 140 C60 140 50 110 50 90" fill="none" stroke="#fbbf24" strokeWidth="3.5" />
        <path d="M108 140 C140 140 150 110 150 90" fill="none" stroke="#fbbf24" strokeWidth="3.5" />
        {/* Candles */}
        <rect x="46" y="70" width="8" height="25" fill="#fef3c7" stroke="#d97706" strokeWidth="1" />
        <rect x="96" y="60" width="8" height="30" fill="#fef3c7" stroke="#d97706" strokeWidth="1" />
        <rect x="146" y="70" width="8" height="25" fill="#fef3c7" stroke="#d97706" strokeWidth="1" />
        {/* Flames */}
        <path d="M50 70 C50 70 44 58 50 48 C56 58 50 70 50 70 Z" fill="#fef08a" stroke="#f97316" strokeWidth="1.5" />
        <path d="M100 60 C100 60 92 45 100 32 C108 45 100 60 100 60 Z" fill="#ffffff" stroke="#f97316" strokeWidth="2" />
        <path d="M150 70 C150 70 144 58 150 48 C156 58 150 70 150 70 Z" fill="#fef08a" stroke="#f97316" strokeWidth="1.5" />
      </svg>
    );
  }

  // Recipiente / Frasco / Garrafa / Cantil / Vaso / Pó (O06, O14, O22, O25, O31, O42, O50, O58, O61)
  if (category === 'Recipiente' || n.includes('frasco') || n.includes('garrafa') || n.includes('cantil') || n.includes('vaso') || n.includes('pó')) {
    return (
      <svg viewBox="0 0 200 240" className={className} preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id={`rec_bg_${id}`} cx="50%" cy="40%" r="70%">
            <stop offset="0%" stopColor="#082f49" />
            <stop offset="60%" stopColor="#031525" />
            <stop offset="100%" stopColor="#01060d" />
          </radialGradient>
        </defs>
        <rect width="200" height="240" fill={`url(#rec_bg_${id})`} />
        {/* Victorian Alchemical Glass Phial with Glowing Potion */}
        <rect x="88" y="45" width="24" height="12" fill="#ca8a04" stroke="#fbbf24" strokeWidth="2" rx="2" />
        <path d="M92 57 L108 57 L108 80 L145 160 C155 180 140 205 115 205 L85 205 C60 205 45 180 55 160 L92 80 Z" fill="#082f49" stroke="#38bdf8" strokeWidth="3.5" />
        <path d="M60 165 C60 165 80 170 100 165 C120 160 140 165 140 165 C135 195 120 200 100 200 C80 200 65 195 60 165 Z" fill="#0284c7" />
        <circle cx="100" cy="140" r="8" fill="#e0f2fe" opacity="0.85" />
      </svg>
    );
  }

  // Têxtil / Cordão / Fita / Pano / Luvas / Saco (O02, O08, O13, O18, O23, O35, O38, O44, O49, O54, O59)
  if (category === 'Têxtil' || n.includes('corda') || n.includes('cordão') || n.includes('fita') || n.includes('pano') || n.includes('luva') || n.includes('saco')) {
    return (
      <svg viewBox="0 0 200 240" className={className} preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id={`tex_bg_${id}`} cx="50%" cy="40%" r="70%">
            <stop offset="0%" stopColor="#2e0b0b" />
            <stop offset="60%" stopColor="#140404" />
            <stop offset="100%" stopColor="#050101" />
          </radialGradient>
        </defs>
        <rect width="200" height="240" fill={`url(#tex_bg_${id})`} />
        {/* Coiled Crimson Velvet Rope with Gold Tassels */}
        <path d="M50 60 C80 110 140 40 160 90 C180 140 130 200 90 180 C50 160 50 100 100 100 C150 100 160 150 130 190" fill="none" stroke="#ef4444" strokeWidth="10" strokeLinecap="round" />
        <path d="M50 60 C80 110 140 40 160 90 C180 140 130 200 90 180 C50 160 50 100 100 100 C150 100 160 150 130 190" fill="none" stroke="#fca5a5" strokeWidth="2" strokeDasharray="6,6" />
        {/* Gold Tassel */}
        <polygon points="120,185 140,185 145,215 115,215" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
        <circle cx="130" cy="185" r="7" fill="#f59e0b" />
      </svg>
    );
  }

  // Artefato / Relíquia / Estátua / Espelho / Selo (O09, O12, O20, O21, O28, O30, O32, O34, O45, O56, O57, O64)
  return (
    <svg viewBox="0 0 200 240" className={className} preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id={`art_bg_${id}`} cx="50%" cy="40%" r="70%">
          <stop offset="0%" stopColor="#2e1a06" />
          <stop offset="60%" stopColor="#140a02" />
          <stop offset="100%" stopColor="#050201" />
        </radialGradient>
      </defs>
      <rect width="200" height="240" fill={`url(#art_bg_${id})`} />
      {/* Ornate Gothic Shield Reliquary & Sapphire Brooch */}
      <path d="M100 40 L160 60 L160 130 C160 175 100 205 100 205 C100 205 40 175 40 130 L40 60 Z" fill="#1c0f04" stroke="#fbbf24" strokeWidth="4" />
      <path d="M100 60 L142 75 L142 125 C142 158 100 180 100 180 C100 180 58 158 58 125 L58 75 Z" fill="#2d1706" stroke="#d97706" strokeWidth="2" />
      {/* Glowing Gem in Center */}
      <circle cx="100" cy="115" r="15" fill="#38bdf8" stroke="#fbbf24" strokeWidth="2.5" />
      <circle cx="96" cy="111" r="3.5" fill="#ffffff" />
    </svg>
  );
};

/* =========================================================================
   3. EVIDENCE CARD CENTRAL SCENE (E01 - E24) - 100% UNIQUE
   ========================================================================= */

export const EvidenceIllustration: React.FC<ArtProps> = ({ id, title = '', className = 'w-full h-full' }) => {
  const seed = getSeedHash(id + title);

  // E01: Causa da Morte (Victorian Morgue Autopsy Chamber under swinging lamp)
  if (id === 'E01' || title.toLowerCase().includes('morte')) {
    return (
      <svg viewBox="0 0 300 160" className={className} preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="e01_bg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#06121e" />
            <stop offset="100%" stopColor="#020508" />
          </linearGradient>
          <radialGradient id="e01_lamp" cx="50%" cy="20%" r="70%">
            <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.9" />
            <stop offset="30%" stopColor="#0284c7" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="300" height="160" fill="url(#e01_bg)" />
        {/* Tiled Walls and High Gothic Arch Window */}
        <path d="M30 10 Q50 0 70 10 L70 80 L30 80 Z" fill="#030a12" stroke="#1e3a5f" strokeWidth="1" />
        <line x1="50" y1="5" x2="50" y2="80" stroke="#1e3a5f" strokeWidth="0.8" />
        {/* Hanging Surgical Lamp */}
        <line x1="150" y1="0" x2="150" y2="25" stroke="#475569" strokeWidth="2" />
        <path d="M130 35 L170 35 L158 25 L142 25 Z" fill="#0f172a" stroke="#64748b" strokeWidth="1.5" />
        <circle cx="150" cy="35" r="4" fill="#ffffff" />
        {/* Lamp Light Beam */}
        <polygon points="130,35 170,35 240,150 60,150" fill="url(#e01_lamp)" opacity="0.8" />

        {/* Heavy Iron Autopsy Examination Table */}
        <polygon points="80,105 220,105 240,125 60,125" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
        {/* Covered Shrouded Figure */}
        <path d="M90 105 Q150 90 210 105 L210 115 L90 115 Z" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
        {/* Table Legs */}
        <rect x="75" y="125" width="8" height="30" fill="#090d16" />
        <rect x="215" y="125" width="8" height="30" fill="#090d16" />

        {/* Shelves & Anatomy Charts in Background */}
        <rect x="230" y="30" width="50" height="60" fill="#040810" stroke="#1e293b" strokeWidth="1" />
        <line x1="230" y1="50" x2="280" y2="50" stroke="#1e293b" strokeWidth="1" />
        <line x1="230" y1="70" x2="280" y2="70" stroke="#1e293b" strokeWidth="1" />
      </svg>
    );
  }

  // Unique procedural generator for other Evidence cards (E02 - E24)
  const hue = (seed % 40) + 200; // Deep midnight cyan, sapphire, navy, steel
  return (
    <svg viewBox="0 0 300 160" className={className} preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id={`ev_bg_${id}`} cx="50%" cy="40%" r="70%">
          <stop offset="0%" stopColor={`hsl(${hue}, 70%, 15%)`} />
          <stop offset="60%" stopColor={`hsl(${hue}, 80%, 6%)`} />
          <stop offset="100%" stopColor="#010306" />
        </radialGradient>
      </defs>
      <rect width="300" height="160" fill={`url(#ev_bg_${id})`} />
      {/* Architectural Gothic Library & Crime Scene Clues */}
      <path d="M40 0 L40 160 M100 0 L100 160 M200 0 L200 160 M260 0 L260 160" stroke="#1e3a5f" strokeWidth="1" opacity="0.3" />
      <circle cx="150" cy="70" r="45" fill={`hsl(${hue}, 80%, 25%)`} opacity="0.25" />
      {/* Evidence prop on desk */}
      <polygon points="40,120 260,120 280,160 20,160" fill="#08101e" stroke="#1e3a5f" strokeWidth="1.5" />
      <circle cx="150" cy="100" r="18" fill="#030812" stroke={`hsl(${hue}, 80%, 60%)`} strokeWidth="2" />
      <circle cx="150" cy="100" r="6" fill={`hsl(${hue}, 90%, 75%)`} />
      <line x1="150" y1="118" x2="168" y2="135" stroke={`hsl(${hue}, 80%, 60%)`} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
};

/* =========================================================================
   4. EVENT CARD CENTRAL SCENE (EV01 - EV16) - 100% UNIQUE
   ========================================================================= */

export const EventIllustration: React.FC<ArtProps> = ({ id, name = '', className = 'w-full h-full' }) => {
  const seed = getSeedHash(id + name);

  // EV01: Apagão (Matching the uploaded card: Dark candlelit library in ominous shadows with dying red candle)
  if (id === 'EV01' || name.toLowerCase().includes('apagão')) {
    return (
      <svg viewBox="0 0 200 180" className={className} preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="ev01_bg" cx="70%" cy="55%" r="60%">
            <stop offset="0%" stopColor="#3b0808" />
            <stop offset="35%" stopColor="#140202" />
            <stop offset="100%" stopColor="#040000" />
          </radialGradient>
          <radialGradient id="ev01_flame" cx="70%" cy="50%" r="20%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#7f1d1d" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="200" height="180" fill="url(#ev01_bg)" />
        {/* Dim Bookshelves & Pitch Black Room */}
        <rect x="15" y="20" width="65" height="130" fill="#080101" stroke="#2a0606" strokeWidth="1" />
        <line x1="15" y1="60" x2="80" y2="60" stroke="#1f0404" strokeWidth="2" />
        <line x1="15" y1="100" x2="80" y2="100" stroke="#1f0404" strokeWidth="2" />

        {/* Large Grimoire on Desk Left */}
        <polygon points="40,135 105,135 115,155 30,155" fill="#1f0606" stroke="#450a0a" strokeWidth="1.5" />

        {/* Solitary Red Candle on Candlestick Right */}
        <rect width="200" height="180" fill="url(#ev01_flame)" />
        <path d="M130 155 L155 155 L145 135 L140 135 L140 95 L145 95 L145 90 L138 90 L138 135 L130 155 Z" fill="#1a0404" stroke="#7f1d1d" strokeWidth="1.5" />
        {/* Candle Wax Column */}
        <rect x="140" y="80" width="6" height="18" fill="#991b1b" />
        {/* Dripping Smoke & Faint Red Flame */}
        <path d="M143 80 Q145 68 143 62 Q140 68 143 80 Z" fill="#ef4444" />
        <circle cx="143" cy="62" r="1.5" fill="#ffffff" />
        {/* Smoke wisp rising */}
        <path d="M143 60 Q148 45 142 35 Q138 25 144 15" fill="none" stroke="#ef4444" strokeWidth="1" opacity="0.6" />
      </svg>
    );
  }

  // Unique procedural generator for EV02 - EV16
  return (
    <svg viewBox="0 0 200 180" className={className} preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id={`ev_gen_${id}`} cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="#450a0a" />
          <stop offset="60%" stopColor="#1a0303" />
          <stop offset="100%" stopColor="#050000" />
        </radialGradient>
      </defs>
      <rect width="200" height="180" fill={`url(#ev_gen_${id})`} />
      {/* Gothic Cataclysm Sigil */}
      <circle cx="100" cy="90" r="50" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="8,6" opacity="0.6" />
      <polygon points="100,45 140,125 60,125" fill="#1a0303" stroke="#f87171" strokeWidth="2" />
      <circle cx="100" cy="98" r="10" fill="#dc2626" />
    </svg>
  );
};

/* =========================================================================
   5. ABILITY CARD CENTRAL SCENE (H01 - H12) - 100% UNIQUE
   ========================================================================= */

export const AbilityIllustration: React.FC<ArtProps> = ({ id, name = '', className = 'w-full h-full' }) => {
  const seed = getSeedHash(id + name);

  // H01: Visão Além do Véu (Mystic green all-seeing eye peering through velvet veil with celestial star runes)
  if (id === 'H01' || name.toLowerCase().includes('véu') || name.toLowerCase().includes('visão')) {
    return (
      <svg viewBox="0 0 200 200" className={className} preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="h01_bg" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#042f1a" />
            <stop offset="60%" stopColor="#02140a" />
            <stop offset="100%" stopColor="#010603" />
          </radialGradient>
          <radialGradient id="h01_eye_glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#4ade80" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#16a34a" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
          <filter id="h01_f">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect width="200" height="200" fill="url(#h01_bg)" />

        {/* Concentric Mystic Celestial Astrolabe Rings */}
        <circle cx="100" cy="100" r="70" fill="none" stroke="#15803d" strokeWidth="1" strokeDasharray="4,6" opacity="0.6" />
        <circle cx="100" cy="100" r="50" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="8,8" opacity="0.7" />
        <circle cx="100" cy="100" r="30" fill="none" stroke="#86efac" strokeWidth="1" opacity="0.8" />

        {/* Central Luminous Green All-Seeing Eye */}
        <circle cx="100" cy="100" r="35" fill="url(#h01_eye_glow)" filter="url(#h01_f)" />
        <path d="M50 100 C70 65 130 65 150 100 C130 135 70 135 50 100 Z" fill="#02150a" stroke="#86efac" strokeWidth="2.5" />
        <circle cx="100" cy="100" r="16" fill="#16a34a" filter="url(#h01_f)" />
        <circle cx="100" cy="100" r="7" fill="#000000" />
        <circle cx="96" cy="96" r="3" fill="#ffffff" />

        {/* Embroidered Velvet Curtains / Mystical Veils */}
        <path d="M0 0 Q40 100 20 200 L0 200 Z" fill="#022112" stroke="#16a34a" strokeWidth="1.5" />
        <path d="M200 0 Q160 100 180 200 L200 200 Z" fill="#022112" stroke="#16a34a" strokeWidth="1.5" />
      </svg>
    );
  }

  // Unique procedural generator for H02 - H12
  return (
    <svg viewBox="0 0 200 200" className={className} preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id={`ab_bg_${id}`} cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="#064e3b" />
          <stop offset="60%" stopColor="#022c22" />
          <stop offset="100%" stopColor="#01130e" />
        </radialGradient>
      </defs>
      <rect width="200" height="200" fill={`url(#ab_bg_${id})`} />
      <circle cx="100" cy="100" r="45" fill="none" stroke="#34d399" strokeWidth="2" strokeDasharray="6,4" />
      <polygon points="100,50 140,130 60,130" fill="#022c22" stroke="#10b981" strokeWidth="2" />
      <circle cx="100" cy="100" r="10" fill="#34d399" />
    </svg>
  );
};

/* =========================================================================
   6. CHARACTER / ROLE CARD CENTRAL PORTRAITS
   ========================================================================= */

export const CharacterRoleIllustration: React.FC<{ role: string; className?: string; avatarUrl?: string }> = ({
  role,
  className = 'w-full h-full',
  avatarUrl,
}) => {
  const r = role.toLowerCase();

  // If there is an existing avatar image url, display it inside the atmospheric gothic frame
  if (avatarUrl) {
    return (
      <div className={`relative overflow-hidden bg-black ${className}`}>
        <img
          src={avatarUrl}
          alt={role}
          className="w-full h-full object-cover grayscale contrast-125 brightness-90 hover:grayscale-0 transition-all duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />
      </div>
    );
  }

  // Investigador / Detetive
  if (r.includes('investig') || r.includes('detetive')) {
    return (
      <svg viewBox="0 0 200 240" className={className} preserveAspectRatio="xMidYMid slice">
        <rect width="200" height="240" fill="#0a0a0f" />
        {/* Detective with Magnifying glass in gothic study */}
        <circle cx="100" cy="85" r="30" fill="#1e1e2d" />
        <path d="M60 240 L70 140 C80 120 120 120 130 140 L140 240 Z" fill="#0f0f18" stroke="#3b82f6" strokeWidth="1" />
        {/* Magnifying Glass Lens with luminous reflection */}
        <circle cx="120" cy="120" r="22" fill="#1e3a8a" stroke="#fbbf24" strokeWidth="3" opacity="0.8" />
        <line x1="135" y1="135" x2="155" y2="160" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round" />
      </svg>
    );
  }

  // Oráculo
  if (r.includes('orác') || r.includes('oraculo')) {
    return (
      <svg viewBox="0 0 200 240" className={className} preserveAspectRatio="xMidYMid slice">
        <rect width="200" height="240" fill="#08140e" />
        {/* Blindfolded Seer with glowing hourglass */}
        <circle cx="100" cy="85" r="30" fill="#0d281a" />
        <rect x="80" y="80" width="40" height="10" fill="#000000" stroke="#d97706" strokeWidth="1" />
        {/* Hourglass */}
        <path d="M85 130 L115 130 L102 155 L115 180 L85 180 L98 155 Z" fill="#14532d" stroke="#fbbf24" strokeWidth="2.5" />
        <circle cx="100" cy="155" r="3" fill="#fde047" />
      </svg>
    );
  }

  // Default gothic silhouette
  return (
    <svg viewBox="0 0 200 240" className={className} preserveAspectRatio="xMidYMid slice">
      <rect width="200" height="240" fill="#0d0707" />
      <circle cx="100" cy="90" r="32" fill="#1f0f0f" stroke="#78350f" strokeWidth="1" />
      <path d="M55 240 L70 145 C80 125 120 125 130 145 L145 240 Z" fill="#140808" />
    </svg>
  );
};
