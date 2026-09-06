import React, { useRef } from 'react';
import { CHARACTER_IMAGES } from '../assets/characters';
import { useCustomCardArt, promptCardArtUpload } from '../utils/customCardArt';

export interface GothicAvatarProps {
  characterId?: string;
  avatarSeed?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
  className?: string;
  glow?: boolean;
  border?: boolean;
  medal?: boolean;
  showLabel?: boolean;
  labelText?: string;
  allowDoubleClickUpload?: boolean;
}

export const CHAR_SPRITE_MAP: Record<string, number> = {
  // Direct names & IDs for all 42 characters from the 7x6 grid
  rafael: 0,
  char_rafael: 0,
  char_00: 0,
  detective: 0,
  investigador: 0,

  lia: 1,
  char_lia: 1,
  char_01: 1,
  forense: 1,
  perito: 1,

  bruno: 2,
  char_bruno: 2,
  char_02: 2,
  advogado: 2,

  sofia: 3,
  char_sofia: 3,
  char_03: 3,
  medica: 3,

  lucas: 4,
  char_lucas: 4,
  char_04: 4,

  julia: 5,
  char_julia: 5,
  char_05: 5,
  jornalista: 5,

  igor: 6,
  char_igor: 6,
  char_06: 6,
  oficial: 6,
  seguranca: 6,

  mariana: 7,
  char_mariana: 7,
  char_07: 7,
  arquivista: 7,

  enzo: 8,
  char_enzo: 8,
  char_08: 8,

  ana: 9,
  char_ana: 9,
  char_09: 9,
  criminologista: 9,

  pedro: 10,
  char_pedro: 10,
  char_10: 10,

  clara: 11,
  char_clara: 11,
  char_11: 11,
  promotora: 11,

  gabriel: 12,
  char_gabriel: 12,
  char_12: 12,
  legista: 12,

  beatriz: 13,
  char_beatriz: 13,
  char_13: 13,

  mateus: 14,
  char_mateus: 14,
  char_14: 14,
  fotografo: 14,

  valentina: 15,
  char_valentina: 15,
  char_15: 15,
  agente: 15,

  thiago: 16,
  char_thiago: 16,
  char_16: 16,

  melissa: 17,
  char_melissa: 17,
  char_17: 17,
  psicologa: 17,

  daniel: 18,
  char_daniel: 18,
  char_18: 18,
  historiador: 18,

  isabela: 19,
  char_isabela: 19,
  char_19: 19,
  diplomata: 19,

  vinicius: 20,
  char_vinicius: 20,
  char_20: 20,

  laura: 21,
  char_laura: 21,
  char_21: 21,

  otavio: 22,
  char_otavio: 22,
  'otávio': 22,
  char_22: 22,
  rastreador: 22,

  marcia: 23,
  char_marcia: 23,
  'márcia': 23,
  char_23: 23,

  heitor: 24,
  char_heitor: 24,
  char_24: 24,
  vigilante: 24,

  nicole: 25,
  char_nicole: 25,
  char_25: 25,

  felipe: 26,
  char_felipe: 26,
  char_26: 26,

  aline: 27,
  char_aline: 27,
  char_27: 27,
  biologa: 27,

  diego: 28,
  char_diego: 28,
  char_28: 28,

  yasmim: 29,
  char_yasmim: 29,
  char_29: 29,

  sergio: 30,
  char_sergio: 30,
  'sérgio': 30,
  char_30: 30,
  juiz: 30,

  paola: 31,
  char_paola: 31,
  char_31: 31,

  arthur: 32,
  char_arthur: 32,
  char_32: 32,

  joao: 33,
  char_joao: 33,
  'joão': 33,
  char_33: 33,

  tatiana: 34,
  char_tatiana: 34,
  char_34: 34,

  rodrigo: 35,
  char_rodrigo: 35,
  char_35: 35,

  carolina: 36,
  char_carolina: 36,
  char_36: 36,

  andre: 37,
  char_andre: 37,
  'andré': 37,
  char_37: 37,

  renata: 38,
  char_renata: 38,
  char_38: 38,

  guilherme: 39,
  char_guilherme: 39,
  char_39: 39,

  vitoria: 40,
  char_vitoria: 40,
  'vitória': 40,
  char_40: 40,

  leonardo: 41,
  char_leonardo: 41,
  char_41: 41,

  // Oráculo and special roles
  oraculo: 0,
  char_oraculo: 0,
  assassino: 16,
  char_assassino: 16,
  cumplice: 28,
  char_cumplice: 28,
  testemunha: 8,
  char_testemunha: 8,
};

/**
 * Generates an intricately styled Victorian Gothic vector portrait based on character archetype
 */
export const getGothicAvatarSvg = (seed: string, charId?: string) => {
  const s = (seed || charId || 'default').toLowerCase();

  // 1. Lord Alistair Blackwood - Top Hat, High Victorian Collar & Monocle
  if (s.includes('blackwood') || s.includes('01')) {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <radialGradient id="bw_bg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#451a03" />
            <stop offset="100%" stopColor="#1c0702" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#bw_bg)" />
        {/* Shoulders & Suit */}
        <path d="M22 92 C22 74, 34 68, 50 68 C66 68, 78 74, 78 92 Z" fill="#0f0704" stroke="#d97706" strokeWidth="1.5" />
        <path d="M42 68 L50 82 L58 68" fill="#e2d9cc" />
        <polygon points="50,75 46,88 54,88" fill="#78350f" />
        {/* Head & Neck */}
        <rect x="44" y="58" width="12" height="12" fill="#d4a373" />
        <ellipse cx="50" cy="48" rx="15" ry="18" fill="#e0ab76" />
        {/* Mustache & Features */}
        <path d="M42 54 Q50 58 58 54 Q50 62 42 54 Z" fill="#291207" />
        {/* Monocle & Cord */}
        <circle cx="56" cy="45" r="5" fill="none" stroke="#fbbf24" strokeWidth="1.5" />
        <circle cx="56" cy="45" r="3" fill="#60a5fa" opacity="0.4" />
        <path d="M61 45 C66 50, 68 62, 60 72" fill="none" stroke="#fbbf24" strokeWidth="1" strokeDasharray="1.5,1.5" />
        {/* Eye Left */}
        <ellipse cx="44" cy="45" rx="2" ry="1.5" fill="#1c0702" />
        {/* Victorian Top Hat */}
        <ellipse cx="50" cy="35" rx="26" ry="6" fill="#170d07" stroke="#d97706" strokeWidth="1" />
        <path d="M32 34 L34 10 L66 10 L68 34 Z" fill="#110804" stroke="#d97706" strokeWidth="1.5" />
        <rect x="33.5" y="27" width="33" height="5" fill="#b45309" />
        <polygon points="50,26 47,29 50,32 53,29" fill="#fbbf24" />
      </svg>
    );
  }

  // 2. Lady Eleanor Ravenscroft - Hooded Velvet Cloak & Occult Raven Amulet
  if (s.includes('eleanor') || s.includes('02') || s.includes('ravenscroft')) {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <radialGradient id="el_bg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3b0764" />
            <stop offset="100%" stopColor="#0f021e" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#el_bg)" />
        {/* Occult Hood */}
        <path d="M22 92 C20 66, 26 28, 50 20 C74 28, 80 66, 78 92 Z" fill="#1a052b" stroke="#a855f7" strokeWidth="1.5" />
        <path d="M30 42 C30 28, 40 24, 50 24 C60 24, 70 28, 70 42 C70 56, 62 66, 50 66 C38 66, 30 56, 30 42 Z" fill="#090111" />
        {/* Face */}
        <ellipse cx="50" cy="46" rx="13" ry="16" fill="#f1c0a8" />
        {/* Hair Strands */}
        <path d="M38 38 C42 46, 40 56, 41 62" fill="none" stroke="#2e1065" strokeWidth="2.5" />
        <path d="M62 38 C58 46, 60 56, 59 62" fill="none" stroke="#2e1065" strokeWidth="2.5" />
        {/* Eyes & Lips */}
        <ellipse cx="44" cy="45" rx="2.5" ry="1.5" fill="#581c87" />
        <ellipse cx="56" cy="45" rx="2.5" ry="1.5" fill="#581c87" />
        <path d="M47 54 Q50 56 53 54" fill="none" stroke="#9333ea" strokeWidth="1.5" />
        {/* Gothic Amulet / Pentacle */}
        <circle cx="50" cy="74" r="7" fill="#2e1065" stroke="#c084fc" strokeWidth="1.5" />
        <polygon points="50,68 52,73 57,73 53,76 55,80 50,77 45,80 47,76 43,73 48,73" fill="#e9d5ff" />
      </svg>
    );
  }

  // 3. Dr. Victor Hawthorne - Forensic Doctor with Monocle / Spectacles & Scalpel Collar
  if (s.includes('hawthorne') || s.includes('03') || s.includes('victor')) {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <radialGradient id="vh_bg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#083344" />
            <stop offset="100%" stopColor="#02141c" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#vh_bg)" />
        {/* Coat & White Shirt */}
        <path d="M22 92 C22 72, 34 66, 50 66 C66 66, 78 72, 78 92 Z" fill="#0f172a" stroke="#06b6d4" strokeWidth="1.5" />
        <polygon points="44,66 50,82 56,66" fill="#f8fafc" />
        <rect x="48" y="70" width="4" height="12" fill="#0284c7" />
        {/* Head & Stern Jaw */}
        <polygon points="42,54 58,54 55,68 45,68" fill="#d59b72" />
        <ellipse cx="50" cy="46" rx="14" ry="17" fill="#e8b993" />
        {/* Hair - Neat Doctor Part */}
        <path d="M35 40 C35 28, 48 24, 65 30 C66 38, 62 44, 62 44 C62 44, 52 32, 35 40 Z" fill="#334155" />
        {/* Wire Spectacles */}
        <circle cx="44" cy="44" r="5" fill="#e0f2fe" opacity="0.6" stroke="#38bdf8" strokeWidth="1.5" />
        <circle cx="56" cy="44" r="5" fill="#e0f2fe" opacity="0.6" stroke="#38bdf8" strokeWidth="1.5" />
        <line x1="49" y1="44" x2="51" y2="44" stroke="#38bdf8" strokeWidth="1.5" />
        {/* Physician Forensic Reflector Mirror Band */}
        <circle cx="50" cy="27" r="5" fill="#94a3b8" stroke="#06b6d4" strokeWidth="1.5" />
        <path d="M37 29 C44 26, 56 26, 63 29" fill="none" stroke="#64748b" strokeWidth="2" />
      </svg>
    );
  }

  // 4. Mestre Barnaby Vance - Bookbinder with Leather Apron & Tools
  if (s.includes('barnaby') || s.includes('04') || s.includes('vance')) {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <radialGradient id="bv_bg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#78350f" />
            <stop offset="100%" stopColor="#240c03" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#bv_bg)" />
        {/* Heavy Leather Apron */}
        <path d="M22 92 C22 70, 32 66, 50 66 C68 66, 78 70, 78 92 Z" fill="#451a03" stroke="#f59e0b" strokeWidth="1.5" />
        <line x1="38" y1="66" x2="44" y2="92" stroke="#b45309" strokeWidth="2" />
        <line x1="62" y1="66" x2="56" y2="92" stroke="#b45309" strokeWidth="2" />
        {/* Head & Full Beard */}
        <ellipse cx="50" cy="46" rx="15" ry="17" fill="#d99f73" />
        <path d="M35 48 C35 68, 65 68, 65 48 C65 62, 58 72, 50 72 C42 72, 35 62, 35 48 Z" fill="#713f12" />
        {/* Spectacles pushed up */}
        <rect x="42" y="32" width="7" height="4" rx="1" fill="#fef08a" stroke="#d97706" strokeWidth="1" />
        <rect x="51" y="32" width="7" height="4" rx="1" fill="#fef08a" stroke="#d97706" strokeWidth="1" />
        <line x1="49" y1="34" x2="51" y2="34" stroke="#d97706" strokeWidth="1" />
        {/* Awl / Bone Folder tool in pocket */}
        <line x1="60" y1="74" x2="68" y2="64" stroke="#fef08a" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  // 5. Madame Genevieve Dupré - Victorian Botanist with Lace Hat & Poison Florals
  if (s.includes('genevieve') || s.includes('05') || s.includes('dupre')) {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <radialGradient id="gd_bg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#064e3b" />
            <stop offset="100%" stopColor="#021f17" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#gd_bg)" />
        {/* Emerald Velvet Gown */}
        <path d="M22 92 C22 72, 34 68, 50 68 C66 68, 78 72, 78 92 Z" fill="#064e3b" stroke="#10b981" strokeWidth="1.5" />
        <circle cx="50" cy="72" r="3.5" fill="#34d399" />
        {/* Head */}
        <ellipse cx="50" cy="48" rx="13" ry="16" fill="#f8d1ba" />
        {/* Dark Styled Victorian Updo Hair */}
        <circle cx="50" cy="38" r="16" fill="#18181b" />
        {/* Green Botanist Hat with Belladonna Blossom */}
        <ellipse cx="50" cy="30" rx="22" ry="7" fill="#022c22" stroke="#34d399" strokeWidth="1.5" />
        <circle cx="60" cy="28" r="5" fill="#a7f3d0" />
        <circle cx="60" cy="28" r="2.5" fill="#047857" />
        {/* Eyes & Emerald Choker */}
        <ellipse cx="45" cy="48" rx="2" ry="1.5" fill="#047857" />
        <ellipse cx="55" cy="48" rx="2" ry="1.5" fill="#047857" />
        <rect x="44" y="60" width="12" height="3" fill="#022c22" stroke="#10b981" strokeWidth="0.8" />
      </svg>
    );
  }

  // 6. Inspetor Arthur Pendelton - Scotland Yard Detective with Bowler Hat & Pipe
  if (s.includes('pendelton') || s.includes('06') || s.includes('arthur')) {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <radialGradient id="ap_bg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1e3a8a" />
            <stop offset="100%" stopColor="#081028" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#ap_bg)" />
        {/* Overcoat with High Collar */}
        <path d="M20 92 C20 70, 32 64, 50 64 C68 64, 80 70, 80 92 Z" fill="#172554" stroke="#3b82f6" strokeWidth="1.5" />
        <polygon points="40,64 50,78 60,64" fill="#93c5fd" />
        {/* Head & Mutton Chops */}
        <ellipse cx="50" cy="46" rx="14" ry="17" fill="#e2ad82" />
        <path d="M36 40 C36 54, 40 58, 42 58" fill="none" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
        <path d="M64 40 C64 54, 60 58, 58 58" fill="none" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
        {/* Bowler Hat */}
        <path d="M32 30 C32 16, 68 16, 68 30 Z" fill="#0f172a" stroke="#60a5fa" strokeWidth="1.5" />
        <ellipse cx="50" cy="30" rx="24" ry="5" fill="#1e293b" stroke="#60a5fa" strokeWidth="1.5" />
        {/* Detective Pipe */}
        <path d="M52 54 L62 58 L68 52" fill="none" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
        <rect x="66" y="48" width="5" height="6" fill="#9a3412" rx="1" />
        <circle cx="68.5" cy="46" r="2" fill="#ef4444" opacity="0.8" />
      </svg>
    );
  }

  // 7. Frei Casimiro de Toledo - Franciscan Monk with Hooded Habit & Rosary
  if (s.includes('casimiro') || s.includes('08') || s.includes('toledo') || s.includes('frei')) {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <radialGradient id="fc_bg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#713f12" />
            <stop offset="100%" stopColor="#1a0c02" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#fc_bg)" />
        {/* Brown Monk Habit Cowl */}
        <path d="M22 92 C20 68, 28 40, 50 32 C72 40, 80 68, 78 92 Z" fill="#3b1f0b" stroke="#eab308" strokeWidth="1.5" />
        {/* Face inside cowl */}
        <ellipse cx="50" cy="52" rx="14" ry="16" fill="#e5b88f" />
        {/* Tonsure Ring of Hair */}
        <path d="M38 42 C44 38, 56 38, 62 42" fill="none" stroke="#573014" strokeWidth="3" strokeLinecap="round" />
        {/* Eyes & Humble Expression */}
        <ellipse cx="45" cy="50" rx="2" ry="1.5" fill="#291305" />
        <ellipse cx="55" cy="50" rx="2" ry="1.5" fill="#291305" />
        {/* Rosary Cross Pendant */}
        <line x1="50" y1="72" x2="50" y2="86" stroke="#fbbf24" strokeWidth="2" />
        <line x1="44" y1="76" x2="56" y2="76" stroke="#fbbf24" strokeWidth="2" />
      </svg>
    );
  }

  // 8. Condessa Beatrix von Falk - Ornate Pearl Tiara & High Royal Ruff
  if (s.includes('beatrix') || s.includes('07') || s.includes('falk') || s.includes('condessa')) {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <radialGradient id="bf_bg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#881337" />
            <stop offset="100%" stopColor="#20030a" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#bf_bg)" />
        {/* High Elizabethan Lace Ruff Collar */}
        <ellipse cx="50" cy="70" rx="26" ry="12" fill="#fff1f2" stroke="#f43f5e" strokeWidth="1.5" />
        <path d="M22 92 C22 76, 32 72, 50 72 C68 72, 78 76, 78 92 Z" fill="#4c0519" stroke="#fb7185" strokeWidth="1.5" />
        {/* Face */}
        <ellipse cx="50" cy="48" rx="13" ry="16" fill="#fde2e4" />
        {/* Golden Hair Updo */}
        <ellipse cx="50" cy="34" rx="16" ry="12" fill="#ca8a04" />
        {/* Ruby & Pearl Tiara */}
        <path d="M38 28 L44 20 L50 26 L56 20 L62 28 Z" fill="#fbbf24" stroke="#e11d48" strokeWidth="1" />
        <circle cx="50" cy="24" r="2.5" fill="#e11d48" />
        {/* Ruby Earrings */}
        <circle cx="36" cy="50" r="2.5" fill="#e11d48" stroke="#fbbf24" strokeWidth="0.8" />
        <circle cx="64" cy="50" r="2.5" fill="#e11d48" stroke="#fbbf24" strokeWidth="0.8" />
      </svg>
    );
  }

  // 9. Nikolai Voronin - Russian Chemist with Protective Brass Goggles
  if (s.includes('voronin') || s.includes('09') || s.includes('nikolai')) {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <radialGradient id="nv_bg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#134e4a" />
            <stop offset="100%" stopColor="#04211f" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#nv_bg)" />
        {/* Heavy Winter Wool Coat */}
        <path d="M22 92 C22 72, 34 66, 50 66 C66 66, 78 72, 78 92 Z" fill="#0f2922" stroke="#14b8a6" strokeWidth="1.5" />
        {/* Fur Collar */}
        <path d="M32 66 C40 60, 60 60, 68 66 C60 76, 40 76, 32 66 Z" fill="#2d3748" stroke="#5eead4" strokeWidth="1" />
        {/* Head */}
        <ellipse cx="50" cy="46" rx="14" ry="17" fill="#dfab85" />
        {/* Steampunk / Chemist Brass Goggles */}
        <circle cx="43" cy="42" r="7" fill="#0f766e" stroke="#fbbf24" strokeWidth="2" />
        <circle cx="57" cy="42" r="7" fill="#0f766e" stroke="#fbbf24" strokeWidth="2" />
        <line x1="49" y1="42" x2="51" y2="42" stroke="#fbbf24" strokeWidth="2.5" />
        <path d="M36 42 L30 44" stroke="#92400e" strokeWidth="2" />
        <path d="M64 42 L70 44" stroke="#92400e" strokeWidth="2" />
        {/* Dark Russian Mustache */}
        <path d="M42 54 Q50 56 58 54" fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }

  // 10. Cassandra Vane - Mystic Spiritualist with Crystal Pendulum & Third Eye
  if (s.includes('cassandra') || s.includes('10') || s.includes('medium')) {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <radialGradient id="cv_bg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#312e81" />
            <stop offset="100%" stopColor="#0b0a26" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#cv_bg)" />
        {/* Silk Shawl */}
        <path d="M22 92 C22 70, 32 66, 50 66 C68 66, 78 70, 78 92 Z" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.5" />
        {/* Head */}
        <ellipse cx="50" cy="48" rx="13" ry="16" fill="#f3c6a5" />
        {/* Dark Ringlets Hair & Mystic Turban */}
        <path d="M32 36 C32 20, 68 20, 68 36 Z" fill="#4338ca" stroke="#a5b4fc" strokeWidth="1.5" />
        <circle cx="50" cy="28" r="4" fill="#c7d2fe" stroke="#fbbf24" strokeWidth="1.5" />
        {/* Forehead Third Eye Sigil */}
        <circle cx="50" cy="40" r="2" fill="#818cf8" />
        {/* Spiritualist Eye Glow */}
        <ellipse cx="44" cy="48" rx="2.5" ry="1.5" fill="#a5b4fc" />
        <ellipse cx="56" cy="48" rx="2.5" ry="1.5" fill="#a5b4fc" />
      </svg>
    );
  }

  // 11. Prof. Cornelius Thorne - Academic Mortarboard & Long Silver Beard
  if (s.includes('thorne') || s.includes('11') || s.includes('cornelius') || s.includes('reitor')) {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <radialGradient id="ct_bg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#713f12" />
            <stop offset="100%" stopColor="#1a0802" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#ct_bg)" />
        <path d="M22 92 C22 70, 32 66, 50 66 C68 66, 78 70, 78 92 Z" fill="#1c1917" stroke="#ca8a04" strokeWidth="1.5" />
        <ellipse cx="50" cy="46" rx="14" ry="16" fill="#e7b892" />
        {/* Long White Academic Beard */}
        <path d="M38 48 C38 76, 50 86, 50 86 C50 86, 62 76, 62 48 Z" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1" />
        {/* Academic Cap / Mortarboard */}
        <polygon points="50,18 24,30 50,38 76,30" fill="#27272a" stroke="#fbbf24" strokeWidth="1.5" />
        <circle cx="50" cy="28" r="2.5" fill="#ca8a04" />
        <path d="M50 28 L72 38 L74 48" fill="none" stroke="#fbbf24" strokeWidth="1.5" />
        {/* Round Scholar Glasses */}
        <circle cx="44" cy="42" r="4.5" fill="none" stroke="#fbbf24" strokeWidth="1.2" />
        <circle cx="56" cy="42" r="4.5" fill="none" stroke="#fbbf24" strokeWidth="1.2" />
        <line x1="48.5" y1="42" x2="51.5" y2="42" stroke="#fbbf24" strokeWidth="1.2" />
      </svg>
    );
  }

  // 12. Silas Crowley - Night Scribe with Dark Cowl & Feather Quill
  if (s.includes('silas') || s.includes('12') || s.includes('crowley') || s.includes('escrivao')) {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <radialGradient id="sc_bg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#050811" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#sc_bg)" />
        <path d="M22 92 C22 68, 30 56, 50 56 C70 56, 78 68, 78 92 Z" fill="#090d16" stroke="#64748b" strokeWidth="1.5" />
        <ellipse cx="50" cy="46" rx="13" ry="16" fill="#d8b492" />
        {/* Dark Hood */}
        <path d="M28 32 C34 16, 66 16, 72 32 C74 46, 68 58, 50 62 C32 58, 26 46, 28 32 Z" fill="#0f172a" stroke="#475569" strokeWidth="1" />
        <ellipse cx="50" cy="46" rx="11" ry="13" fill="#e2b997" />
        {/* Quill Feather behind Ear */}
        <path d="M62 44 L80 20 C76 22, 70 30, 64 38 Z" fill="#f8fafc" stroke="#94a3b8" strokeWidth="0.8" />
        {/* Eyes in shadows */}
        <ellipse cx="46" cy="44" rx="2" ry="1.5" fill="#0f172a" />
        <ellipse cx="54" cy="44" rx="2" ry="1.5" fill="#0f172a" />
      </svg>
    );
  }

  // 13. Irene Adler-Vogel - Cryptographer with Fascinator & Cipher Lens
  if (s.includes('irene') || s.includes('13') || s.includes('criptografa')) {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <radialGradient id="ia_bg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#4c1d95" />
            <stop offset="100%" stopColor="#15042e" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#ia_bg)" />
        <path d="M22 92 C22 72, 34 68, 50 68 C66 68, 78 72, 78 92 Z" fill="#2e1065" stroke="#a78bfa" strokeWidth="1.5" />
        <ellipse cx="50" cy="48" rx="13" ry="16" fill="#fae8d8" />
        {/* Violet Fascinator Hat & Feathers */}
        <ellipse cx="58" cy="30" rx="14" ry="7" fill="#5b21b6" stroke="#c4b5fd" strokeWidth="1" />
        <path d="M64 26 C72 16, 80 14, 82 12 C78 20, 72 24, 68 28 Z" fill="#c4b5fd" />
        {/* Sleek Dark Hair */}
        <path d="M37 38 C37 28, 48 24, 63 32 C63 42, 60 52, 60 52 C60 52, 48 34, 37 38 Z" fill="#18181b" />
        {/* Cipher Loupe Lens */}
        <circle cx="44" cy="46" r="6" fill="#a78bfa" opacity="0.4" stroke="#fbbf24" strokeWidth="1.5" />
        <line x1="40" y1="50" x2="34" y2="58" stroke="#fbbf24" strokeWidth="1.5" />
      </svg>
    );
  }

  // 14. Dra. Miriam Al-Hassan - Celestial Astronomer with Star Veil
  if (s.includes('miriam') || s.includes('15') || s.includes('astronoma')) {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <radialGradient id="ma_bg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0369a1" />
            <stop offset="100%" stopColor="#031d2e" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#ma_bg)" />
        <path d="M22 92 C20 68, 30 36, 50 30 C70 36, 80 68, 78 92 Z" fill="#082f49" stroke="#38bdf8" strokeWidth="1.5" />
        <ellipse cx="50" cy="50" rx="13" ry="16" fill="#d99b70" />
        {/* Golden Astrolabe Hair Comb */}
        <circle cx="50" cy="28" r="8" fill="none" stroke="#fbbf24" strokeWidth="1.5" />
        <line x1="50" y1="20" x2="50" y2="36" stroke="#fbbf24" strokeWidth="1" />
        <line x1="42" y1="28" x2="58" y2="28" stroke="#fbbf24" strokeWidth="1" />
        <circle cx="50" cy="28" r="3" fill="#fef08a" />
        {/* Eyes & Kohl */}
        <ellipse cx="44" cy="48" rx="3" ry="1.5" fill="#0c4a6e" />
        <ellipse cx="56" cy="48" rx="3" ry="1.5" fill="#0c4a6e" />
      </svg>
    );
  }

  // 15. Valeria Morosini - Venetian Noble with Masquerade Mask
  if (s.includes('valeria') || s.includes('17') || s.includes('morosini')) {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <radialGradient id="vm_bg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#991b1b" />
            <stop offset="100%" stopColor="#250404" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#vm_bg)" />
        <path d="M22 92 C22 72, 34 68, 50 68 C66 68, 78 72, 78 92 Z" fill="#450a0a" stroke="#ef4444" strokeWidth="1.5" />
        <ellipse cx="50" cy="48" rx="13" ry="16" fill="#fae8d8" />
        {/* Venetian Gold & Ruby Masquerade Half-Mask */}
        <path d="M34 42 C40 36, 46 44, 50 42 C54 44, 60 36, 66 42 C68 50, 60 52, 50 50 C40 52, 32 50, 34 42 Z" fill="#7f1d1d" stroke="#fbbf24" strokeWidth="1.5" />
        <ellipse cx="42" cy="44" rx="3.5" ry="2" fill="#0a0502" />
        <ellipse cx="58" cy="44" rx="3.5" ry="2" fill="#0a0502" />
        <circle cx="50" cy="38" r="2.5" fill="#fbbf24" />
      </svg>
    );
  }

  // Default / Universal Gothic Scholar / Investigator Silhouette
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <defs>
        <radialGradient id="def_bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#374151" />
          <stop offset="100%" stopColor="#111827" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#def_bg)" />
      {/* Victorian Scholar Cloak */}
      <path d="M22 92 C22 72, 34 66, 50 66 C66 66, 78 72, 78 92 Z" fill="#1f2937" stroke="#fbbf24" strokeWidth="1.5" />
      <polygon points="44,66 50,78 56,66" fill="#fbbf24" opacity="0.8" />
      {/* Head */}
      <ellipse cx="50" cy="46" rx="14" ry="17" fill="#d1a075" />
      {/* Scholar Hat */}
      <path d="M30 32 L50 20 L70 32 L50 40 Z" fill="#111827" stroke="#f59e0b" strokeWidth="1.5" />
      <circle cx="50" cy="30" r="2.5" fill="#fbbf24" />
      {/* Monocle / Key Feature */}
      <circle cx="54" cy="46" r="4" fill="none" stroke="#fbbf24" strokeWidth="1.5" />
      <ellipse cx="44" cy="46" rx="2" ry="1.5" fill="#1f2937" />
    </svg>
  );
};

export const GothicAvatar: React.FC<GothicAvatarProps> = ({
  characterId,
  avatarSeed,
  name,
  size = 'md',
  className = '',
  glow = false,
  border = true,
  medal = false,
  showLabel = false,
  labelText,
  allowDoubleClickUpload = true,
}) => {
  const lastTapRef = useRef<number>(0);
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-20 h-20',
    '3xl': 'w-28 h-28',
    full: 'w-full h-full',
  };

  const seed = (avatarSeed || characterId || name || 'default').toLowerCase().trim();
  
  let spriteIdx: number | undefined = undefined;
  // 1. Direct map lookups
  if (CHAR_SPRITE_MAP[seed] !== undefined) {
    spriteIdx = CHAR_SPRITE_MAP[seed];
  } else if (characterId && CHAR_SPRITE_MAP[characterId.toLowerCase().trim()] !== undefined) {
    spriteIdx = CHAR_SPRITE_MAP[characterId.toLowerCase().trim()];
  } else if (name && CHAR_SPRITE_MAP[name.toLowerCase().trim()] !== undefined) {
    spriteIdx = CHAR_SPRITE_MAP[name.toLowerCase().trim()];
  } else {
    // 2. Substring matching
    for (const [key, idx] of Object.entries(CHAR_SPRITE_MAP)) {
      if (seed.includes(key) || (characterId && characterId.toLowerCase().includes(key))) {
        spriteIdx = idx;
        break;
      }
    }
  }

  // 3. Fallback by index extraction
  if (spriteIdx === undefined && characterId) {
    const numMatch = characterId.match(/\d+/);
    if (numMatch) {
      const parsed = parseInt(numMatch[0], 10);
      if (parsed >= 0 && parsed < CHARACTER_IMAGES.length) {
        spriteIdx = parsed;
      }
    }
  }

  if (spriteIdx === undefined) {
    spriteIdx = 0; // Default to Rafael
  }

  spriteIdx = Math.abs(spriteIdx) % CHARACTER_IMAGES.length;
  const defaultImgSrc = CHARACTER_IMAGES[spriteIdx] || CHARACTER_IMAGES[0];

  // Dynamic custom uploaded art hook check
  const cleanCharId = characterId || `char_${String(spriteIdx).padStart(2, '0')}`;
  const lookupIds = [
    `crest_${cleanCharId}`,
    `brasao_${cleanCharId}`,
    `crest_char_${spriteIdx}`,
    `crest_${spriteIdx}`,
    `crest_${spriteIdx + 1}`,
    cleanCharId,
    seed,
    name || '',
    `char_${spriteIdx}`,
    `char_${String(spriteIdx).padStart(2, '0')}`,
  ].filter(Boolean);

  const customArt = useCustomCardArt(lookupIds);
  const imgSrc = customArt || defaultImgSrc;

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (!allowDoubleClickUpload) return;
    e.stopPropagation();
    const targetId = `crest_${cleanCharId}`;
    promptCardArtUpload(targetId, {
      name: `Brasão: ${name || targetId}`,
      aliases: lookupIds,
    });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!allowDoubleClickUpload) return;
    const now = Date.now();
    if (now - lastTapRef.current < 350) {
      // Double tap detected
      e.stopPropagation();
      const targetId = `crest_${cleanCharId}`;
      promptCardArtUpload(targetId, {
        name: `Brasão: ${name || targetId}`,
        aliases: lookupIds,
      });
    }
    lastTapRef.current = now;
  };

  if (medal || showLabel) {
    return (
      <div
        className={`relative flex flex-col items-center select-none ${className}`}
        onDoubleClick={handleDoubleClick}
        onTouchEnd={handleTouchEnd}
        title={allowDoubleClickUpload ? 'Dê duplo clique para vincular nova imagem' : undefined}
      >
        <div
          className={`relative rounded-full overflow-hidden shrink-0 transition-transform duration-200 ${
            sizeClasses[size]
          } border border-[#3d241c] bg-zinc-950 shadow-[0_4px_16px_rgba(0,0,0,0.8)] ${
            glow ? 'speaking-glow ring-2 ring-emerald-500/80' : ''
          }`}
        >
          <img
            src={imgSrc}
            alt={name || 'Avatar'}
            className="w-full h-full object-cover object-center rounded-full"
            referrerPolicy="no-referrer"
          />
        </div>

        {showLabel && (
          <div className="mt-1.5 px-2.5 py-0.5 rounded-md bg-[#120a07] border border-[#3d241c] shadow-md">
            <span className="text-[10px] sm:text-xs font-serif font-semibold text-amber-100 tracking-wider uppercase text-center block">
              {labelText || name || 'Detective'}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      onDoubleClick={handleDoubleClick}
      onTouchEnd={handleTouchEnd}
      title={allowDoubleClickUpload ? 'Dê duplo clique para vincular nova imagem' : undefined}
      className={`relative overflow-hidden shrink-0 transition-transform duration-200 select-none rounded-full ${
        sizeClasses[size]
      } ${
        border ? 'border border-[#3d241c] shadow-[0_2px_8px_rgba(0,0,0,0.6)]' : ''
      } ${
        glow ? 'speaking-glow ring-2 ring-emerald-500/80 shadow-[0_0_16px_rgba(16,185,129,0.8)]' : ''
      } ${className}`}
    >
      <img
        src={imgSrc}
        alt={name || 'Avatar'}
        className="w-full h-full object-cover object-center rounded-full"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};
