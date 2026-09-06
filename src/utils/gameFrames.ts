export interface GameFrameDefinition {
  id: string;
  name: string;
  shortName: string;
  src: string | null;
  thumbnail: string;
  description: string;
  gemColor: string;
  accentColor: string;
  borderColor: string;
  glowColor: string;
  themeStyle: 'dark-gold' | 'ruby' | 'petroleum' | 'moss' | 'amethyst' | 'silver' | 'night-blue' | 'amber' | 'turquoise' | 'none';
}

export const GAME_FRAMES: Record<string, GameFrameDefinition> = {
  blackGold: {
    id: 'blackGold',
    name: '10. Negro & Dourado Imperial',
    shortName: 'Negro & Dourado',
    src: '/frames/moldura_10_negro_dourado.png',
    thumbnail: '/frames/moldura_10_negro_dourado.png',
    description: 'Moldura gótica imperial em ferro negro abissal com filigrana dourada e rubis de sangue nos quatro vértices.',
    gemColor: '#dc2626',
    accentColor: '#d4af37',
    borderColor: '#d4af37',
    glowColor: 'rgba(212, 175, 55, 0.4)',
    themeStyle: 'dark-gold',
  },
  rubi: {
    id: 'rubi',
    name: '01. Rubi de Sangue Ancestral',
    shortName: 'Rubi Carmesim',
    src: '/frames/moldura_01_rubi.png',
    thumbnail: '/frames/moldura_01_rubi.png',
    description: 'Moldura forjada com essência carmesim de rubi, incrustações de ouro e símbolos de sacrifício.',
    gemColor: '#ef4444',
    accentColor: '#b91c1c',
    borderColor: '#dc2626',
    glowColor: 'rgba(239, 68, 68, 0.45)',
    themeStyle: 'ruby',
  },
  azulPetroleo: {
    id: 'azulPetroleo',
    name: '02. Azul Petróleo & Ouro Nobre',
    shortName: 'Azul Petróleo',
    src: '/frames/moldura_02_azul_petroleo.png',
    thumbnail: '/frames/moldura_02_azul_petroleo.png',
    description: 'Traceria nobre em azul petróleo com ornatos dourados dos círculos da alta corte.',
    gemColor: '#06b6d4',
    accentColor: '#0e7490',
    borderColor: '#0891b2',
    glowColor: 'rgba(14, 116, 144, 0.45)',
    themeStyle: 'petroleum',
  },
  verdeMusgo: {
    id: 'verdeMusgo',
    name: '03. Verde Musgo & Ouro Antigo',
    shortName: 'Verde Musgo',
    src: '/frames/moldura_03_verde_musgo.png',
    thumbnail: '/frames/moldura_03_verde_musgo.png',
    description: 'Esmaltação verde florestal e ouro envelhecido dos botânicos e alquimistas do monastério.',
    gemColor: '#10b981',
    accentColor: '#15803d',
    borderColor: '#16a34a',
    glowColor: 'rgba(22, 163, 74, 0.45)',
    themeStyle: 'moss',
  },
  roxoAmetista: {
    id: 'roxoAmetista',
    name: '04. Roxo Ametista Arcano',
    shortName: 'Roxo Ametista',
    src: '/frames/moldura_04_roxo_ametista.png',
    thumbnail: '/frames/moldura_04_roxo_ametista.png',
    description: 'Borda ritualística envolta em ametista profunda e ouro sagrado do Oráculo.',
    gemColor: '#a855f7',
    accentColor: '#9333ea',
    borderColor: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.45)',
    themeStyle: 'amethyst',
  },
  prataFrio: {
    id: 'prataFrio',
    name: '05. Prata Frio & Platina Gótica',
    shortName: 'Prata Frio',
    src: '/frames/moldura_05_prata_frio.png',
    thumbnail: '/frames/moldura_05_prata_frio.png',
    description: 'Traceria em prata polida estelar e platina fria, com reflexos de noites enluaradas.',
    gemColor: '#e2e8f0',
    accentColor: '#cbd5e1',
    borderColor: '#94a3b8',
    glowColor: 'rgba(203, 213, 225, 0.45)',
    themeStyle: 'silver',
  },
  azulNoite: {
    id: 'azulNoite',
    name: '07. Azul Noite & Luas Místicas',
    shortName: 'Azul Noite',
    src: '/frames/moldura_07_azul_noite.png',
    thumbnail: '/frames/moldura_07_azul_noite.png',
    description: 'Azul safira celestial adornado com relevos lunares dourados e estrelas da meia-noite.',
    gemColor: '#3b82f6',
    accentColor: '#1d4ed8',
    borderColor: '#2563eb',
    glowColor: 'rgba(37, 99, 235, 0.45)',
    themeStyle: 'night-blue',
  },
  ambar: {
    id: 'ambar',
    name: '08. Âmbar & Fogo Solar',
    shortName: 'Âmbar Solar',
    src: '/frames/moldura_08_ambar.png',
    thumbnail: '/frames/moldura_08_ambar.png',
    description: 'Resina fóssil de âmbar incandescente com arabescos de ouro reluzente.',
    gemColor: '#f97316',
    accentColor: '#ea580c',
    borderColor: '#f97316',
    glowColor: 'rgba(249, 115, 22, 0.45)',
    themeStyle: 'amber',
  },
  turquesa: {
    id: 'turquesa',
    name: '09. Turquesa & Bronze Abissal',
    shortName: 'Turquesa',
    src: '/frames/moldura_09_turquesa.png',
    thumbnail: '/frames/moldura_09_turquesa.png',
    description: 'Tonalidade turquesa com filigrana em bronze e gemas cintilantes.',
    gemColor: '#14b8a6',
    accentColor: '#0d9488',
    borderColor: '#14b8a6',
    glowColor: 'rgba(20, 184, 166, 0.45)',
    themeStyle: 'turquoise',
  },
  none: {
    id: 'none',
    name: 'Sem Moldura (Padrão Limpo)',
    shortName: 'Sem Moldura',
    src: null,
    thumbnail: '',
    description: 'Interface limpa original sem camada de moldura ornamental externa.',
    gemColor: '#71717a',
    accentColor: '#71717a',
    borderColor: 'transparent',
    glowColor: 'transparent',
    themeStyle: 'none',
  },
};

export const DEFAULT_FRAME_ID = 'blackGold';
export const GAME_FRAME_STORAGE_KEY = 'codice_selected_game_frame';
export const CUSTOM_FRAMES_STORAGE_KEY = 'codice_custom_frames_catalog';

/**
 * Get active frame ID from localStorage
 */
export function getSavedGameFrameId(): string {
  try {
    const saved = localStorage.getItem(GAME_FRAME_STORAGE_KEY);
    if (saved && (GAME_FRAMES[saved] || saved.startsWith('custom_'))) {
      return saved;
    }
  } catch (err) {
    console.error('Failed to read frame from localStorage:', err);
  }
  return DEFAULT_FRAME_ID;
}

/**
 * Save active frame ID to localStorage
 */
export function saveGameFrameId(frameId: string): void {
  try {
    localStorage.setItem(GAME_FRAME_STORAGE_KEY, frameId);
  } catch (err) {
    console.error('Failed to save frame to localStorage:', err);
  }
}
