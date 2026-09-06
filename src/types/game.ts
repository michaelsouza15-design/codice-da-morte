export type RoleType = 'assassino' | 'cumplice' | 'oraculo' | 'investigador' | 'sabotador';

export type MarkerColor = 'vermelho' | 'azul' | 'preto' | 'dourado' | 'cinza';

export interface MarkerInfo {
  color: MarkerColor;
  name: string;
  meaning: string;
  shortRole?: string;
  hex: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
}

export interface CardMethod {
  id: string; // e.g. M01
  name: string;
  category: 'Físico' | 'Químico' | 'Ambiental' | 'Psicológico' | 'Mecânico';
  description: string;
}

export interface CardObject {
  id: string; // e.g. O01
  name: string;
  category: 'Instrumento' | 'Documento' | 'Recipiente' | 'Iluminação' | 'Têxtil' | 'Mobiliário' | 'Artefato';
  description: string;
}

export interface CardEvidence {
  id: string; // e.g. E01
  title: string;
  subtitle?: string;
  options: string[]; // 5 or 6 options
  markedOptionIndex?: number;
  markedColor?: MarkerColor;
  markerX?: number; // X% position on card (0 to 100)
  markerY?: number; // Y% position on card (0 to 100)
  isProtected?: boolean; // Protected by Guardião (H09)
  isConcealed?: boolean; // Concealed during evidence concealment events (EV01, EV14, etc.)
  concealedReason?: string; // Reason or event name causing the concealment
}

export interface CardEvent {
  id: string; // e.g. EV01
  name: string;
  effect: string;
  duration?: number; // seconds if applicable
  aliases?: string[];
  assetKey?: string;
}

export interface CardAbility {
  id: string; // e.g. H01
  name: string;
  effect: string;
  aliases?: string[];
  assetKey?: string;
}

export interface Character {
  id: string;
  number?: number;
  name: string;
  title: string;
  bio: string;
  lore?: string;
  avatarSeed: string;
  avatarBg: string;
  accentColor: string;
  defaultAbilityId: string;
  spriteIndex?: number;
  roleTag?: string;
  roleColor?: string;
  category?: 'investigadores' | 'especiais' | 'especialista' | 'autoridade' | 'civil' | 'investigador';
  avatarUrl?: string;
  isLocked?: boolean;
  aliases?: string[];

  // Novos campos estruturados do banco de 42 personagens
  nome?: string;
  categoria?: 'especialista' | 'autoridade' | 'civil' | 'investigador' | 'especiais';
  profissao?: string;
  personalidade?: string[];
  descricao_visual?: string;
  historico?: string;
  motivacao?: string;
  segredo?: string;
  comportamento?: string;
  icone?: string;
  tipo?: 'personagem_secundario' | 'personagem_principal';
  relacoes_possiveis?: string[];
  frases_caracteristicas?: string[];
  nivel_importancia?: 'padrao' | 'chave' | 'recorrente';
}

export type CharacterInfo = Character;

export interface Player {
  id: string;
  name: string;
  characterId: string;
  isHost: boolean;
  isReady: boolean;
  isAI: boolean;
  aiDifficulty?: 'facil' | 'normal' | 'dificil' | 'especialista';
  seatNumber: number;
  
  // Hand of cards
  methods: CardMethod[];
  objects: CardObject[];
  ability: CardAbility;
  abilityUsed: boolean;
  
  // Secret role
  role?: RoleType;
  roleTitle?: string;
  
  // In-game stats
  hasAccused: boolean;
  isMuted?: boolean;
}

export type GamePhase = 
  | 'LOBBY'
  | 'DISTRIBUICAO'
  | 'PREPARACAO'
  | 'NOITE'
  | 'ORACULO'
  | 'HISTORIA'
  | 'EVIDENCIAS'
  | 'INVESTIGACAO'
  | 'EVENTO'
  | 'DISCUSSÃO'
  | 'ACUSACAO'
  | 'REVELACAO'
  | 'RESULTADO';

export interface GameLog {
  id: string;
  timestamp: string;
  text: string;
  type: 'system' | 'night' | 'oracle' | 'event' | 'ability' | 'accusation' | 'result';
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole?: RoleType; // only shown when permitted
  text: string;
  timestamp: string;
  isSystem?: boolean;
  isVoiceSimulation?: boolean;
  isWhisper?: boolean;
  audioUrl?: string; // Base64 data URI of recorded voice note
  audioDuration?: number; // duration in seconds
  audioMimeType?: string; // e.g. audio/mp4, audio/webm, audio/wav
  reactions?: Record<string, string[]>; // emoji -> array of playerIds who reacted
}

export interface SecretSolution {
  killerPlayerId: string;
  methodId: string;
  objectId: string;
  accomplicePlayerIds?: string[];
  saboteurPlayerId?: string;
  suggestedMethodId?: string;
  suggestedObjectId?: string;
  suggestedByPlayerName?: string;
}

export interface ActiveEvent {
  event: CardEvent;
  activeUntilTime?: number;
  remainingSeconds?: number;
  targetPlayerId?: string;
  affectedEvidenceIds?: string[]; // IDs of evidence cards affected by concealment
}

export interface ActiveAbility {
  ability: CardAbility;
  userId: string;
  userName: string;
  userCharacterId?: string;
  activatedAt: string;
  remainingSeconds: number;
  extraPayload?: any;
}

export interface RoomSettings {
  maxPlayers: number;
  minPlayers: number;
  maxRounds: number;
  hasAccomplice: boolean;
  accompliceCount: number;
  hasSaboteur: boolean;
  roundTimerSeconds: number;
  discussionTimerSeconds: number;
  allowEvents: boolean;
  allowAbilities: boolean;
  aiDifficulty: 'facil' | 'normal' | 'dificil' | 'especialista';
  botAccuracyPercent?: number; // 0 - 100 percentage of bot accusation accuracy (default 20%)
  oracleSelectionMode?: 'random' | 'host' | 'custom';
  designatedOraclePlayerId?: string;
}

export interface AccusationRecord {
  id: string;
  round: number;
  timestamp: string;
  accuserPlayerId: string;
  accuserName: string;
  accuserCharacterId: string;
  targetPlayerId: string;
  targetName: string;
  targetCharacterId: string;
  methodId: string;
  methodName: string;
  methodCategory?: string;
  methodDescription?: string;
  objectId: string;
  objectName: string;
  objectCategory?: string;
  objectDescription?: string;
  isCorrect: boolean;
}

export interface RoomState {
  code: string;
  hostId: string;
  roomName?: string;
  gameMode?: string;
  phase: GamePhase;
  round: number;
  maxRounds: number;
  settings: RoomSettings;
  players: Player[];
  
  // Public game board items
  evidencesOnTable: CardEvidence[];
  discardedEvidences: CardEvidence[];
  activeEvent: ActiveEvent | null;
  activeAbility?: ActiveAbility | null;
  storyNarrative: string;
  
  // Timers
  phaseTimerRemaining: number;
  phaseTimerActive: boolean;
  
  // Accusations and history
  logs: GameLog[];
  messages: ChatMessage[];
  accusationHistory?: AccusationRecord[];
  lastAccusation?: {
    accuserPlayerId: string;
    targetPlayerId: string;
    methodId: string;
    objectId: string;
    isCorrect: boolean;
  };
  
  // Final revelation
  winner?: 'investigadores' | 'assassino' | 'sabotador';
  revelationStep?: number; // 0 to 6 for cinematic reconstruction

  // Match statistics and timestamps
  startedAt?: number;
  endedAt?: number;
  totalElapsedSeconds?: number;
  roundsPlayed?: number;
  presentedEvidenceIds?: string[];
  abilitiesUsedCount?: number;
  eventsActivatedCount?: number;
  
  // Oracle Designation
  designatedOraclePlayerId?: string;
  
  // Secret solution - ONLY visible to server and authorized views (Oracle, Killer, Accomplice)
  secretSolution?: SecretSolution;

  // Accomplice night suggestion (only visible to Killer and Accomplice during night phase)
  nightSuggestion?: {
    methodId?: string;
    objectId?: string;
    suggestedByPlayerId: string;
    suggestedByPlayerName: string;
  };
}
