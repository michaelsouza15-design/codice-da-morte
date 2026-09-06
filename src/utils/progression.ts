export interface CardFrameDefinition {
  id: string;
  name: string;
  price: number;
  description: string;
  themeClass: string;
  borderColor: string;
  glowColor: string;
  jewelGradient: string;
  cornerClass: string;
  badgeBg: string;
  previewGradient: string;
}

export interface AvatarFrameDefinition {
  id: string;
  name: string;
  price: number;
  description: string;
  ringClass: string;
  glowClass: string;
}

export interface TableFrameDefinition {
  id: string;
  name: string;
  price: number;
  description: string;
  borderColor: string;
  borderClass: string;
  glowClass: string;
  cornerAccent: string;
  previewGradient: string;
}

export interface PlayerProgression {
  level: number;
  xp: number;
  coins: number;
  victories: number;
  killerVictories: number;
  investigatorVictories: number;
  oracleVictories: number;
  totalGamesPlayed: number;
  unlockedCardFrames: string[];
  activeCardFrameId: string;
  unlockedAvatarFrames: string[];
  activeAvatarFrameId: string;
  unlockedTableFrames: string[];
  activeTableFrameId: string;
}

export const CARD_FRAMES: CardFrameDefinition[] = [
  {
    id: 'frame_default',
    name: '01. Aço dos Mortais & Bronze',
    price: 0,
    description: 'Moldura clássica de ferro forjado e rebites de bronze da biblioteca ancestral (Fundo Transparente).',
    themeClass: 'border-[#b45309] bg-transparent shadow-[0_0_15px_rgba(180,83,9,0.3)]',
    borderColor: '#b45309',
    glowColor: 'rgba(217, 119, 6, 0.4)',
    jewelGradient: 'from-amber-600 via-amber-500 to-amber-900',
    cornerClass: 'border-amber-500/80',
    badgeBg: 'from-[#240a08]/90 via-[#42140e]/90 to-[#240a08]/90',
    previewGradient: 'from-stone-900 via-stone-800 to-zinc-950',
  },
  {
    id: 'frame_azul_petroleo',
    name: '02. Azul Petróleo & Ouro',
    price: 250,
    description: 'Moldura nobre azul petróleo com arabescos de ouro e safiras reluzentes (moldura_02).',
    themeClass: 'border-[#0e7490] bg-transparent shadow-[0_0_20px_rgba(14,116,144,0.45)]',
    borderColor: '#0e7490',
    glowColor: 'rgba(14, 116, 144, 0.65)',
    jewelGradient: 'from-sky-400 via-cyan-500 to-cyan-950',
    cornerClass: 'border-cyan-400',
    badgeBg: 'from-[#082f49]/90 via-[#0369a1]/90 to-[#082f49]/90',
    previewGradient: 'from-cyan-950 via-sky-900 to-black',
  },
  {
    id: 'frame_verde_musgo',
    name: '03. Verde Musgo & Ouro Antigo',
    price: 350,
    description: 'Borda verde florestal esmaltada com filigrana em ouro antigo e gemas esmeralda (moldura_03).',
    themeClass: 'border-[#15803d] bg-transparent shadow-[0_0_20px_rgba(21,128,61,0.45)]',
    borderColor: '#15803d',
    glowColor: 'rgba(21, 128, 61, 0.65)',
    jewelGradient: 'from-emerald-400 via-emerald-600 to-emerald-950',
    cornerClass: 'border-emerald-400',
    badgeBg: 'from-[#052e16]/90 via-[#166534]/90 to-[#052e16]/90',
    previewGradient: 'from-emerald-950 via-green-900 to-black',
  },
  {
    id: 'frame_obsidian',
    name: '04. Roxo Ametista Arcano',
    price: 450,
    description: 'Moldura mística ametista com filigrana dourada e cristal púrpura ancestral (moldura_04).',
    themeClass: 'border-[#9333ea] bg-transparent shadow-[0_0_22px_rgba(147,51,234,0.55)]',
    borderColor: '#9333ea',
    glowColor: 'rgba(168, 85, 247, 0.75)',
    jewelGradient: 'from-purple-400 via-purple-600 to-indigo-950',
    cornerClass: 'border-purple-300',
    badgeBg: 'from-[#2e1065]/90 via-[#581c87]/90 to-[#2e1065]/90',
    previewGradient: 'from-purple-950 via-black to-[#0a0212]',
  },
  {
    id: 'frame_prata',
    name: '05. Prata Frio & Platina',
    price: 550,
    description: 'Traceria gótica em prata polida e platina fria com estrelas de diamante (moldura_05).',
    themeClass: 'border-[#cbd5e1] bg-transparent shadow-[0_0_20px_rgba(203,213,225,0.5)]',
    borderColor: '#cbd5e1',
    glowColor: 'rgba(203, 213, 225, 0.7)',
    jewelGradient: 'from-slate-200 via-slate-400 to-slate-800',
    cornerClass: 'border-slate-100',
    badgeBg: 'from-[#1e293b]/90 via-[#334155]/90 to-[#1e293b]/90',
    previewGradient: 'from-slate-900 via-slate-800 to-black',
  },
  {
    id: 'frame_azul_noite',
    name: '07. Azul Noite & Luas Douradas',
    price: 650,
    description: 'Safira azul noite real com luas douradas esculpidas e zircônias imperiais (moldura_07).',
    themeClass: 'border-[#1d4ed8] bg-transparent shadow-[0_0_22px_rgba(29,78,216,0.55)]',
    borderColor: '#1d4ed8',
    glowColor: 'rgba(59, 130, 246, 0.75)',
    jewelGradient: 'from-blue-400 via-blue-600 to-blue-950',
    cornerClass: 'border-blue-400',
    badgeBg: 'from-[#172554]/90 via-[#1e40af]/90 to-[#172554]/90',
    previewGradient: 'from-blue-950 via-indigo-950 to-black',
  },
  {
    id: 'frame_ambar',
    name: '08. Âmbar & Fogo Solar',
    price: 750,
    description: 'Âmbar radiante incrustado em ouro com pontas de diamante solar ardente (moldura_08).',
    themeClass: 'border-[#ea580c] bg-transparent shadow-[0_0_22px_rgba(234,88,12,0.55)]',
    borderColor: '#ea580c',
    glowColor: 'rgba(249, 115, 22, 0.75)',
    jewelGradient: 'from-orange-400 via-amber-500 to-amber-900',
    cornerClass: 'border-amber-400',
    badgeBg: 'from-[#431407]/90 via-[#7c2d12]/90 to-[#431407]/90',
    previewGradient: 'from-orange-950 via-amber-950 to-black',
  },
  {
    id: 'frame_negro_dourado',
    name: '10. Negro & Dourado Imperial',
    price: 900,
    description: 'Ferro negro abissal com cantoneiras em filigrana de ouro puro e rubis de sangue (moldura_10).',
    themeClass: 'border-[#d4af37] bg-transparent shadow-[0_0_25px_rgba(212,175,55,0.65)]',
    borderColor: '#d4af37',
    glowColor: 'rgba(212, 175, 55, 0.85)',
    jewelGradient: 'from-red-500 via-red-700 to-red-950',
    cornerClass: 'border-yellow-300',
    badgeBg: 'from-[#18181b]/95 via-[#27272a]/95 to-[#18181b]/95',
    previewGradient: 'from-stone-950 via-black to-zinc-950',
  },
  {
    id: 'frame_blood',
    name: '11. Carmesim Vladislav',
    price: 1100,
    description: 'Bordas vermelho-sangue ardente com rubis incandescentes e runas carmesins de Drácula.',
    themeClass: 'border-[#dc2626] bg-transparent shadow-[0_0_24px_rgba(220,38,38,0.6)]',
    borderColor: '#dc2626',
    glowColor: 'rgba(239, 68, 68, 0.8)',
    jewelGradient: 'from-red-400 via-red-600 to-red-950',
    cornerClass: 'border-red-400',
    badgeBg: 'from-[#450a0a]/90 via-[#7f1d1d]/90 to-[#450a0a]/90',
    previewGradient: 'from-red-950 via-rose-950 to-black',
  },
];

export const AVATAR_FRAMES: AvatarFrameDefinition[] = [
  {
    id: 'avatar_default',
    name: 'Aço dos Mortais',
    price: 0,
    description: 'Aro de ferro forjado sóbrio.',
    ringClass: 'ring-amber-500/40 border-amber-500/50',
    glowClass: 'shadow-amber-500/10',
  },
  {
    id: 'avatar_gold',
    name: 'Coroa Imperial',
    price: 400,
    description: 'Aro em ouro puro com brasão de louros.',
    ringClass: 'ring-amber-400 border-yellow-300 ring-2',
    glowClass: 'shadow-[0_0_16px_rgba(234,179,8,0.6)]',
  },
  {
    id: 'avatar_blood',
    name: 'Linhagem de Sangue',
    price: 650,
    description: 'Aro carmesim ardente de Vlad Drácula.',
    ringClass: 'ring-red-500 border-red-400 ring-2',
    glowClass: 'shadow-[0_0_16px_rgba(239,68,68,0.7)]',
  },
  {
    id: 'avatar_oracle',
    name: 'Olho do Oráculo',
    price: 900,
    description: 'Aura mística púrpura das profecias ancestrais.',
    ringClass: 'ring-purple-400 border-purple-300 ring-2',
    glowClass: 'shadow-[0_0_16px_rgba(168,85,247,0.7)]',
  },
];

export const TABLE_FRAMES: TableFrameDefinition[] = [
  {
    id: 'table_default',
    name: '01. Abadia Ancestral & Bronze',
    price: 0,
    description: 'Borda clássica de ferro forjado e rebites de bronze da biblioteca ancestral gótica.',
    borderColor: '#b45309',
    borderClass: 'border-amber-500/30 ring-1 ring-amber-500/20',
    glowClass: 'shadow-[0_0_25px_rgba(180,83,9,0.25)]',
    cornerAccent: 'border-amber-500/70',
    previewGradient: 'from-amber-950/80 via-black to-[#120703]',
  },
  {
    id: 'table_ouro_imperial',
    name: '02. Carvalho Nobre & Ouro Imperial',
    price: 350,
    description: 'Moldura de carvalho polido com tracerias e cantoneiras de ouro reluzente.',
    borderColor: '#d97706',
    borderClass: 'border-amber-400/70 ring-2 ring-amber-400/40',
    glowClass: 'shadow-[0_0_35px_rgba(245,158,11,0.45)]',
    cornerAccent: 'border-yellow-400',
    previewGradient: 'from-amber-900/90 via-black to-[#241205]',
  },
  {
    id: 'table_ametista_arcano',
    name: '03. Santuário Ametista & Runa Púrpura',
    price: 500,
    description: 'Borda esculpida em pedra obsidiana e ametistas reluzentes dos oráculos cósmicos.',
    borderColor: '#9333ea',
    borderClass: 'border-purple-500/70 ring-2 ring-purple-500/40',
    glowClass: 'shadow-[0_0_35px_rgba(147,51,234,0.45)]',
    cornerAccent: 'border-purple-400',
    previewGradient: 'from-purple-950/90 via-black to-[#150424]',
  },
  {
    id: 'table_prata_platina',
    name: '04. Cripta de Prata Fria & Platina',
    price: 650,
    description: 'Cantoneiras de filigrana em prata antiga e estrelas polares de platina.',
    borderColor: '#cbd5e1',
    borderClass: 'border-slate-300/70 ring-2 ring-slate-300/40',
    glowClass: 'shadow-[0_0_35px_rgba(203,213,225,0.45)]',
    cornerAccent: 'border-white',
    previewGradient: 'from-slate-900/90 via-black to-[#0f172a]',
  },
  {
    id: 'table_safira_noite',
    name: '05. Biblioteca Safira & Luas Celestes',
    price: 800,
    description: 'Safira abissal esculpida com glifos lunares dourados e orbes astrais.',
    borderColor: '#0284c7',
    borderClass: 'border-sky-400/70 ring-2 ring-sky-400/40',
    glowClass: 'shadow-[0_0_35px_rgba(2,132,199,0.45)]',
    cornerAccent: 'border-sky-300',
    previewGradient: 'from-sky-950/90 via-black to-[#08182b]',
  },
  {
    id: 'table_sangue_dracula',
    name: '06. Trono Carmesim de Vlad Drácula',
    price: 1000,
    description: 'Mesa forjada em ferro de sangue ancestral com rubis incandescentes da Valáquia.',
    borderColor: '#dc2626',
    borderClass: 'border-red-500/80 ring-2 ring-red-500/50',
    glowClass: 'shadow-[0_0_40px_rgba(220,38,38,0.55)]',
    cornerAccent: 'border-red-400',
    previewGradient: 'from-red-950/90 via-black to-[#280505]',
  },
];

const STORAGE_KEY = 'codice_player_progression_v2';

/**
 * Calculates XP required to reach the next level.
 * Rule:
 * - Levels 1..5: 400 XP per level
 * - Levels 6..10: 300 XP per level (as requested)
 * - Level 11+: scales gradually (+150 per level)
 */
export function getXpRequiredForLevel(level: number): number {
  if (level < 1) return 400;
  if (level <= 5) return 400;
  if (level <= 10) return 300;
  return 300 + (level - 10) * 150;
}

export function loadProgression(): PlayerProgression {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        level: typeof parsed.level === 'number' && parsed.level >= 1 ? parsed.level : 1,
        xp: typeof parsed.xp === 'number' && parsed.xp >= 0 ? parsed.xp : 0,
        coins: typeof parsed.coins === 'number' && parsed.coins >= 0 ? parsed.coins : 0,
        victories: typeof parsed.victories === 'number' ? parsed.victories : 0,
        killerVictories: typeof parsed.killerVictories === 'number' ? parsed.killerVictories : 0,
        investigatorVictories: typeof parsed.investigatorVictories === 'number' ? parsed.investigatorVictories : 0,
        oracleVictories: typeof parsed.oracleVictories === 'number' ? parsed.oracleVictories : 0,
        totalGamesPlayed: typeof parsed.totalGamesPlayed === 'number' ? parsed.totalGamesPlayed : 0,
        unlockedCardFrames: Array.isArray(parsed.unlockedCardFrames) && parsed.unlockedCardFrames.length > 0
          ? parsed.unlockedCardFrames
          : ['frame_default'],
        activeCardFrameId: parsed.activeCardFrameId || 'frame_default',
        unlockedAvatarFrames: Array.isArray(parsed.unlockedAvatarFrames) && parsed.unlockedAvatarFrames.length > 0
          ? parsed.unlockedAvatarFrames
          : ['avatar_default'],
        activeAvatarFrameId: parsed.activeAvatarFrameId || 'avatar_default',
        unlockedTableFrames: Array.isArray(parsed.unlockedTableFrames) && parsed.unlockedTableFrames.length > 0
          ? parsed.unlockedTableFrames
          : ['table_default'],
        activeTableFrameId: parsed.activeTableFrameId || 'table_default',
      };
    }
  } catch (err) {
    console.error('Failed to load progression from localStorage:', err);
  }

  // Initial default state starting at zero/level 1
  return {
    level: 1,
    xp: 0,
    coins: 0,
    victories: 0,
    killerVictories: 0,
    investigatorVictories: 0,
    oracleVictories: 0,
    totalGamesPlayed: 0,
    unlockedCardFrames: ['frame_default'],
    activeCardFrameId: 'frame_default',
    unlockedAvatarFrames: ['avatar_default'],
    activeAvatarFrameId: 'avatar_default',
    unlockedTableFrames: ['table_default'],
    activeTableFrameId: 'table_default',
  };
}

export function saveProgression(progression: PlayerProgression): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progression));
    // Dispatch custom event for reactive UI updates across all components
    window.dispatchEvent(new CustomEvent('codice_progression_updated', { detail: progression }));
  } catch (err) {
    console.error('Failed to save progression:', err);
  }
}

/**
 * Add XP and coins, automatically handling level-up logic and rewarding bonus coins on level up.
 */
export function addProgressionRewards(
  xpGained: number,
  coinsGained: number,
  isVictory: boolean = false,
  role?: 'assassino' | 'investigador' | 'oraculo' | 'cumplice' | 'sabotador'
): { updated: PlayerProgression; didLevelUp: boolean; newLevel: number; earnedCoinsTotal: number } {
  const current = loadProgression();
  let currentLevel = current.level;
  let currentXp = current.xp + Math.max(0, xpGained);
  let currentCoins = current.coins + Math.max(0, coinsGained);
  let didLevelUp = false;

  while (true) {
    const requiredXp = getXpRequiredForLevel(currentLevel);
    if (currentXp >= requiredXp) {
      currentXp -= requiredXp;
      currentLevel += 1;
      didLevelUp = true;
      // Bonus coins per level up
      currentCoins += 150;
    } else {
      break;
    }
  }

  const updated: PlayerProgression = {
    ...current,
    level: currentLevel,
    xp: currentXp,
    coins: currentCoins,
    totalGamesPlayed: current.totalGamesPlayed + 1,
    victories: isVictory ? current.victories + 1 : current.victories,
    killerVictories: isVictory && role === 'assassino' ? current.killerVictories + 1 : current.killerVictories,
    investigatorVictories: isVictory && role === 'investigador' ? current.investigatorVictories + 1 : current.investigatorVictories,
    oracleVictories: isVictory && role === 'oraculo' ? current.oracleVictories + 1 : current.oracleVictories,
  };

  saveProgression(updated);
  return {
    updated,
    didLevelUp,
    newLevel: currentLevel,
    earnedCoinsTotal: coinsGained + (didLevelUp ? 150 : 0),
  };
}

export function buyCardFrame(frameId: string): { success: boolean; message: string; updated: PlayerProgression } {
  const current = loadProgression();
  const frame = CARD_FRAMES.find((f) => f.id === frameId);
  if (!frame) return { success: false, message: 'Moldura não encontrada.', updated: current };

  if (current.unlockedCardFrames.includes(frameId)) {
    // Already unlocked, equip it
    const updated = { ...current, activeCardFrameId: frameId };
    saveProgression(updated);
    return { success: true, message: `Moldura [${frame.name}] equipada!`, updated };
  }

  if (current.coins < frame.price) {
    return {
      success: false,
      message: `Moedas insuficientes! Você precisa de ${frame.price} moedas (você tem ${current.coins}).`,
      updated: current,
    };
  }

  const updated: PlayerProgression = {
    ...current,
    coins: current.coins - frame.price,
    unlockedCardFrames: [...current.unlockedCardFrames, frameId],
    activeCardFrameId: frameId,
  };

  saveProgression(updated);
  return { success: true, message: `Moldura [${frame.name}] comprada e equipada com sucesso!`, updated };
}

export function equipCardFrame(frameId: string): { success: boolean; message: string; updated: PlayerProgression } {
  const current = loadProgression();
  if (!current.unlockedCardFrames.includes(frameId)) {
    return { success: false, message: 'Você precisa comprar esta moldura na loja antes de equipá-la!', updated: current };
  }

  const updated = { ...current, activeCardFrameId: frameId };
  saveProgression(updated);
  return { success: true, message: 'Moldura equipada com sucesso!', updated };
}

export function getActiveCardFrame(): CardFrameDefinition {
  const current = loadProgression();
  return CARD_FRAMES.find((f) => f.id === current.activeCardFrameId) || CARD_FRAMES[0];
}

export function buyTableFrame(frameId: string): { success: boolean; message: string; updated: PlayerProgression } {
  const current = loadProgression();
  const frame = TABLE_FRAMES.find((f) => f.id === frameId);
  if (!frame) return { success: false, message: 'Moldura de mesa não encontrada.', updated: current };

  if (current.unlockedTableFrames.includes(frameId)) {
    const updated = { ...current, activeTableFrameId: frameId };
    saveProgression(updated);
    return { success: true, message: `Moldura de mesa [${frame.name}] equipada!`, updated };
  }

  if (current.coins < frame.price) {
    return {
      success: false,
      message: `Moedas insuficientes! Você precisa de ${frame.price} moedas (você tem ${current.coins}).`,
      updated: current,
    };
  }

  const updated: PlayerProgression = {
    ...current,
    coins: current.coins - frame.price,
    unlockedTableFrames: [...current.unlockedTableFrames, frameId],
    activeTableFrameId: frameId,
  };

  saveProgression(updated);
  return { success: true, message: `Moldura de mesa [${frame.name}] comprada e equipada!`, updated };
}

export function equipTableFrame(frameId: string): { success: boolean; message: string; updated: PlayerProgression } {
  const current = loadProgression();
  if (!current.unlockedTableFrames.includes(frameId)) {
    return { success: false, message: 'Você precisa comprar esta moldura na loja antes de equipá-la!', updated: current };
  }

  const updated = { ...current, activeTableFrameId: frameId };
  saveProgression(updated);
  return { success: true, message: 'Moldura de mesa equipada!', updated };
}

export function getActiveTableFrame(progression?: PlayerProgression): TableFrameDefinition {
  const current = progression || loadProgression();
  return TABLE_FRAMES.find((f) => f.id === current.activeTableFrameId) || TABLE_FRAMES[0];
}

export function getActiveAvatarFrame(progression?: PlayerProgression): AvatarFrameDefinition {
  const current = progression || loadProgression();
  return AVATAR_FRAMES.find((f) => f.id === current.activeAvatarFrameId) || AVATAR_FRAMES[0];
}
