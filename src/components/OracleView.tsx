import React, { useState, useEffect, useRef } from 'react';
import { RoomState, MarkerColor, CardEvidence, CardMethod, CardObject, CardEvent, CardAbility, Character, Player } from '../types/game';
import { MARKER_INFOS, METHODS, OBJECTS, EVENTS, ABILITIES, CHARACTERS, STORY_CHAPTERS, EVIDENCES } from '../data/gameData';
import { EvidenceCard, MethodCard, ObjectCard, EventCard, AbilityCard, CharacterRoleCard } from './GothicCard';
import { EvidenceMarkerPlacementModal } from './EvidenceMarkerPlacementModal';
import { GothicAvatar } from './GothicAvatar';
import { GothicWaxSeal } from './GothicWaxSeal';
import { soundEngine } from '../utils/soundEngine';
import {
  Eye,
  ShieldAlert,
  Sparkles,
  BookOpen,
  CheckCircle,
  Clock,
  Plus,
  Minus,
  PlusCircle,
  Trash2,
  Zap,
  AlertTriangle,
  Menu,
  Settings,
  Book,
  ChevronLeft,
  ChevronRight,
  Info,
  RotateCcw,
  Check,
  Flame,
  Shield,
  Layers,
  Volume2,
  X,
  FileText,
  Skull,
  Search,
  Maximize2,
  Filter,
  SkipForward,
  User,
  Grid,
} from 'lucide-react';
import libraryHeaderBg from '../assets/images/gothic_hall_investigation_1788010723428.jpg';
import codiceEmblemaCaveiraImg from '../assets/images/codice_emblema_caveira_1787918811337.jpg';

interface OracleViewProps {
  room: RoomState;
  myPlayerId: string;
  onMarkOption: (
    evidenceId: string,
    optionIdx: number,
    color: MarkerColor,
    coords?: { x: number; y: number }
  ) => void;
  onFinishOraclePhase: () => void;
  onUpdateStory?: (story: string) => void;
  onAdjustTimer?: (deltaSeconds: number) => void;
  onSetTimerDuration?: (durationSeconds: number) => void;
  onDrawEvidence?: () => void;
  onAddSpecificEvidence?: (evidenceId: string) => void;
  onDiscardEvidence?: (evidenceId: string) => void;
  onDrawEvent?: () => void;
  onOpenRules?: () => void;
  onOpenSettings?: () => void;
  onOpenMenu?: () => void;
  onClearAllMarkers?: () => void;
}

type InspectItem = 
  | { type: 'method'; item: CardMethod; isSolution?: boolean }
  | { type: 'object'; item: CardObject; isSolution?: boolean }
  | { type: 'evidence'; item: CardEvidence }
  | { type: 'event'; item: CardEvent }
  | { type: 'ability'; item: CardAbility }
  | { type: 'character'; item: Character; player?: Player };

export const OracleView: React.FC<OracleViewProps> = ({
  room,
  myPlayerId,
  onMarkOption,
  onFinishOraclePhase,
  onUpdateStory,
  onAdjustTimer,
  onSetTimerDuration,
  onDrawEvidence,
  onAddSpecificEvidence,
  onDiscardEvidence,
  onDrawEvent,
  onOpenRules,
  onOpenSettings,
  onOpenMenu,
  onClearAllMarkers,
}) => {
  const [activeTab, setActiveTab] = useState<'NARRATIVA' | 'VERDADE_SECRETA' | 'EVIDÊNCIAS' | 'EVENTOS' | 'HABILIDADES' | 'RODADA'>('NARRATIVA');
  const [selectedColor, setSelectedColor] = useState<MarkerColor>('dourado');
  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(16); // Chapter 17 default
  const [showSummaryModal, setShowSummaryModal] = useState<boolean>(false);
  const [showAll60EvidencesModal, setShowAll60EvidencesModal] = useState<boolean>(false);
  const [evidenceCatalogSearch, setEvidenceCatalogSearch] = useState<string>('');
  const [evidenceCatalogRange, setEvidenceCatalogRange] = useState<'ALL' | 'E01-E10' | 'E11-E20' | 'E21-E30' | 'E31-E40' | 'E41-E50' | 'E51-E60'>('ALL');
  const [customStory, setCustomStory] = useState<string>(() => room.storyNarrative || '');
  const [savedNarrativeAlert, setSavedNarrativeAlert] = useState<boolean>(false);
  const [inspectItem, setInspectItem] = useState<InspectItem | null>(null);
  const [placementEvidence, setPlacementEvidence] = useState<CardEvidence | null>(null);

  const tabsNavRef = useRef<HTMLDivElement>(null);
  const isDraggingTabsRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  const handleTabsMouseDown = (e: React.MouseEvent) => {
    if (!tabsNavRef.current) return;
    isDraggingTabsRef.current = true;
    startXRef.current = e.pageX - tabsNavRef.current.offsetLeft;
    scrollLeftRef.current = tabsNavRef.current.scrollLeft;
  };

  const handleTabsMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingTabsRef.current || !tabsNavRef.current) return;
    e.preventDefault();
    const x = e.pageX - tabsNavRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    tabsNavRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleTabsMouseUpOrLeave = () => {
    isDraggingTabsRef.current = false;
  };

  // Filters for catalogs
  const [eventFilterTerm, setEventFilterTerm] = useState<string>('');
  const [abilityFilterTerm, setAbilityFilterTerm] = useState<string>('');
  const [evidenceFilterCategory, setEvidenceFilterCategory] = useState<'ALL' | 'FÍSICA' | 'CENA' | 'DOCUMENTO'>('ALL');

  useEffect(() => {
    if (room.storyNarrative) {
      setCustomStory(room.storyNarrative);
    }
  }, [room.storyNarrative]);

  const solution = room.secretSolution;
  const killerPlayer = room.players.find((p) => p.id === solution?.killerPlayerId);
  const killerChar = CHARACTERS.find((c) => c.id === killerPlayer?.characterId);
  const accomplicePlayer = room.players.find((p) => p.role === 'cumplice');
  const accompliceChar = CHARACTERS.find((c) => c.id === accomplicePlayer?.characterId);
  const solutionMethod = METHODS.find((m) => m.id === solution?.methodId);
  const solutionObject = OBJECTS.find((o) => o.id === solution?.objectId);

  // Total and placed markers
  const placedMarkersCount = (room.evidencesOnTable || []).filter(
    (e) => e.markedOptionIndex !== undefined && e.markedColor !== undefined
  ).length;
  const maxMarkers = 10;
  const availableMarkers = Math.max(0, maxMarkers - placedMarkersCount);

  const colors: MarkerColor[] = ['dourado', 'vermelho', 'azul', 'cinza', 'preto'];

  const currentChapter = STORY_CHAPTERS[activeChapterIndex] || {
    id: 17,
    title: 'CAPÍTULO XVII: O TESTAMENTO OCULTO',
    text: 'A chuva fustiga as janelas ogivais da abadia enquanto as sombras no piso de mármore revelam detalhes perturbadores. Entre os tomos empoeirados, uma carta rasgada e fragmentos de cera selada indicam que a vítima fora atraída com uma falsa promessa de redenção.',
  };

  const handlePrevChapter = () => {
    soundEngine.playCardFlip();
    const newIdx = activeChapterIndex > 0 ? activeChapterIndex - 1 : STORY_CHAPTERS.length - 1;
    setActiveChapterIndex(newIdx);
    setCustomStory(STORY_CHAPTERS[newIdx].text);
  };

  const handleNextChapter = () => {
    soundEngine.playCardFlip();
    const newIdx = activeChapterIndex < STORY_CHAPTERS.length - 1 ? activeChapterIndex + 1 : 0;
    setActiveChapterIndex(newIdx);
    setCustomStory(STORY_CHAPTERS[newIdx].text);
  };

  const handleSaveNarrative = () => {
    soundEngine.playClick();
    if (onUpdateStory && customStory.trim()) {
      onUpdateStory(customStory.trim());
      setSavedNarrativeAlert(true);
      setTimeout(() => setSavedNarrativeAlert(false), 2500);
    }
  };

  const currentDuration = room.settings?.discussionTimerSeconds !== undefined ? room.settings.discussionTimerSeconds : 180;

  // Filtered Events
  const filteredEvents = EVENTS.filter((ev) => {
    if (!eventFilterTerm) return true;
    const term = eventFilterTerm.toLowerCase();
    return ev.name.toLowerCase().includes(term) || ev.effect.toLowerCase().includes(term) || ev.id.toLowerCase().includes(term);
  });

  // Filtered Abilities
  const filteredAbilities = ABILITIES.filter((ab) => {
    if (!abilityFilterTerm) return true;
    const term = abilityFilterTerm.toLowerCase();
    return ab.name.toLowerCase().includes(term) || ab.effect.toLowerCase().includes(term) || ab.id.toLowerCase().includes(term);
  });

  return (
    <div className="w-full flex flex-col bg-[#0b0504] text-[#e8ded5] rounded-3xl overflow-hidden border-2 border-amber-500/50 shadow-2xl select-none max-w-6xl mx-auto animate-fade-in font-serif">
      {/* ---------------------------------------------------- */}
      {/* 1. TOP HEADER (MENU - CÓDICE DA MORTE - SUBTITLE - BOOK & GEAR) */}
      {/* ---------------------------------------------------- */}
      <header className="relative z-20 px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between border-b border-amber-950/90 bg-gradient-to-b from-[#180a06] via-[#100604] to-[#0a0302]">
        {/* Left: Menu Hamburger */}
        <button
          onClick={() => {
            soundEngine.playClick();
            if (onOpenMenu) onOpenMenu();
          }}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-black/60 border border-amber-500/30 hover:border-amber-400 flex items-center justify-center text-amber-300 hover:text-white transition-all shadow-md active:scale-95 shrink-0"
          title="Menu Principal"
        >
          <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Center: Title & Subtitle with Emblem */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden ring-1 ring-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.25)] flex items-center justify-center shrink-0 bg-black/80">
            <img
              src={codiceEmblemaCaveiraImg}
              alt="Códice da Morte"
              className="w-full h-full object-cover filter contrast-110"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col text-left truncate">
            <h1 className="font-serif text-sm sm:text-base md:text-lg font-black text-[#f5ebd9] tracking-[0.2em] uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] flex items-center gap-1.5 truncate">
              <span>CÓDICE</span>
              <span className="text-red-500 font-black">DA</span>
              <span>MORTE</span>
            </h1>
            <span className="text-[8px] sm:text-[9px] font-serif font-bold text-amber-400 tracking-[0.15em] uppercase truncate">
              — GRIMÓRIO DO ORÁCULO —
            </span>
          </div>
        </div>

        {/* Right: Book (Rules) & Settings Icons */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={() => {
              soundEngine.playClick();
              if (onOpenRules) onOpenRules();
            }}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-black/60 border border-amber-500/30 hover:border-amber-400 flex items-center justify-center text-amber-300 hover:text-white transition-all shadow-md active:scale-95"
            title="Livro de Regras"
          >
            <Book className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={() => {
              soundEngine.playClick();
              if (onOpenSettings) onOpenSettings();
              else if (onOpenMenu) onOpenMenu();
            }}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-black/60 border border-amber-500/30 hover:border-amber-400 flex items-center justify-center text-amber-300 hover:text-white transition-all shadow-md active:scale-95"
            title="Configurações"
          >
            <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </header>

      {/* ---------------------------------------------------- */}
      {/* 2. 6 FLOATING NAVIGATION BUTTONS (RESPONSIVE TOUCH & DRAG CAROUSEL) */}
      {/* ---------------------------------------------------- */}
      <div className="sticky top-0 z-30 bg-gradient-to-b from-[#140603] via-[#0f0402] to-[#0a0302] border-b border-amber-900/60 shadow-xl px-1 sm:px-4 py-2">
        <div className="relative flex items-center max-w-full">
          {/* Scrollable Tabs Track with Horizontal Touch & Mouse Drag */}
          <div
            ref={tabsNavRef}
            onMouseDown={handleTabsMouseDown}
            onMouseMove={handleTabsMouseMove}
            onMouseUp={handleTabsMouseUpOrLeave}
            onMouseLeave={handleTabsMouseUpOrLeave}
            className="flex-1 flex items-center justify-start sm:justify-center gap-1.5 sm:gap-2.5 overflow-x-auto scrollbar-none snap-x touch-pan-x py-1 px-1 select-none cursor-grab active:cursor-grabbing"
            style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {/* TAB 1: NARRATIVA */}
            <button
              type="button"
              id="oracle-tab-narrativa"
              onClick={() => {
                soundEngine.playClick();
                setActiveTab('NARRATIVA');
              }}
              className={`snap-start min-h-[38px] sm:min-h-[42px] px-3 sm:px-4 py-1.5 rounded-xl text-[11px] sm:text-xs font-serif font-black tracking-wider uppercase transition-all whitespace-nowrap border flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'NARRATIVA'
                  ? 'bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 text-white border-amber-300 shadow-[0_0_14px_rgba(245,158,11,0.6)] scale-105 ring-1 ring-amber-400'
                  : 'bg-black/60 border-amber-900/40 text-zinc-300 hover:text-amber-200 hover:border-amber-700/60 hover:bg-black/80 active:scale-95'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Narrativa</span>
            </button>

            {/* TAB 2: VERDADE SECRETA */}
            <button
              type="button"
              id="oracle-tab-verdade-secreta"
              onClick={() => {
                soundEngine.playClick();
                setActiveTab('VERDADE_SECRETA');
              }}
              className={`snap-start min-h-[38px] sm:min-h-[42px] px-3 sm:px-4 py-1.5 rounded-xl text-[11px] sm:text-xs font-serif font-black tracking-wider uppercase transition-all whitespace-nowrap border flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'VERDADE_SECRETA'
                  ? 'bg-gradient-to-r from-red-700 via-red-600 to-red-700 text-white border-red-300 shadow-[0_0_14px_rgba(239,68,68,0.7)] scale-105 ring-1 ring-red-400'
                  : 'bg-black/60 border-red-900/40 text-zinc-300 hover:text-red-200 hover:border-red-700/60 hover:bg-black/80 active:scale-95'
              }`}
            >
              <Skull className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span>Verdade Secreta</span>
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
            </button>

            {/* TAB 3: EVIDÊNCIAS */}
            <button
              type="button"
              id="oracle-tab-evidencias"
              onClick={() => {
                soundEngine.playClick();
                setActiveTab('EVIDÊNCIAS');
              }}
              className={`snap-start min-h-[38px] sm:min-h-[42px] px-3 sm:px-4 py-1.5 rounded-xl text-[11px] sm:text-xs font-serif font-black tracking-wider uppercase transition-all whitespace-nowrap border flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'EVIDÊNCIAS'
                  ? 'bg-gradient-to-r from-sky-700 via-sky-600 to-sky-700 text-white border-sky-300 shadow-[0_0_14px_rgba(56,189,248,0.6)] scale-105 ring-1 ring-sky-300'
                  : 'bg-black/60 border-sky-900/40 text-zinc-300 hover:text-sky-200 hover:border-sky-700/60 hover:bg-black/80 active:scale-95'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>Evidências</span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-sky-950 text-sky-300 border border-sky-500/40 shrink-0">
                {availableMarkers}
              </span>
            </button>

            {/* TAB 4: EVENTOS */}
            <button
              type="button"
              id="oracle-tab-eventos"
              onClick={() => {
                soundEngine.playClick();
                setActiveTab('EVENTOS');
              }}
              className={`snap-start min-h-[38px] sm:min-h-[42px] px-3 sm:px-4 py-1.5 rounded-xl text-[11px] sm:text-xs font-serif font-black tracking-wider uppercase transition-all whitespace-nowrap border flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'EVENTOS'
                  ? 'bg-gradient-to-r from-orange-700 via-orange-600 to-orange-700 text-white border-orange-300 shadow-[0_0_14px_rgba(249,115,22,0.6)] scale-105 ring-1 ring-orange-300'
                  : 'bg-black/60 border-orange-900/40 text-zinc-300 hover:text-orange-200 hover:border-orange-700/60 hover:bg-black/80 active:scale-95'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              <span>Eventos</span>
              {room.activeEvent && (
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping shrink-0" />
              )}
            </button>

            {/* TAB 5: HABILIDADES */}
            <button
              type="button"
              id="oracle-tab-habilidades"
              onClick={() => {
                soundEngine.playClick();
                setActiveTab('HABILIDADES');
              }}
              className={`snap-start min-h-[38px] sm:min-h-[42px] px-3 sm:px-4 py-1.5 rounded-xl text-[11px] sm:text-xs font-serif font-black tracking-wider uppercase transition-all whitespace-nowrap border flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'HABILIDADES'
                  ? 'bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-700 text-white border-emerald-300 shadow-[0_0_14px_rgba(16,185,129,0.6)] scale-105 ring-1 ring-emerald-300'
                  : 'bg-black/60 border-emerald-900/40 text-zinc-300 hover:text-emerald-200 hover:border-emerald-700/60 hover:bg-black/80 active:scale-95'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Habilidades</span>
            </button>

            {/* TAB 6: RODADA */}
            <button
              type="button"
              id="oracle-tab-rodada"
              onClick={() => {
                soundEngine.playClick();
                setActiveTab('RODADA');
              }}
              className={`snap-start min-h-[38px] sm:min-h-[42px] px-3 sm:px-4 py-1.5 rounded-xl text-[11px] sm:text-xs font-serif font-black tracking-wider uppercase transition-all whitespace-nowrap border flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'RODADA'
                  ? 'bg-gradient-to-r from-red-700 via-amber-600 to-red-700 text-white border-amber-300 shadow-[0_0_14px_rgba(245,158,11,0.6)] scale-105 ring-1 ring-amber-300'
                  : 'bg-black/60 border-amber-900/40 text-zinc-300 hover:text-amber-200 hover:border-amber-700/60 hover:bg-black/80 active:scale-95'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Rodada R{room.round}/3</span>
            </button>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* MAIN CONTENT CONTAINER */}
      {/* ---------------------------------------------------- */}
      <div className="p-3 sm:p-6 space-y-5 min-h-[480px]">
        {/* ==================================================== */}
        {/* VIEW 1: NARRATIVA (CAPÍTULOS + DIÁRIO DO ORÁCULO) */}
        {/* ==================================================== */}
        {activeTab === 'NARRATIVA' && (
          <div className="space-y-4 animate-fade-in">
            {/* Current Chapter Card */}
            <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-b from-[#180b06] via-[#100604] to-[#080201] border border-amber-500/40 shadow-xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-amber-500/20">
                <span className="text-xs sm:text-sm font-serif font-black text-amber-300 tracking-[0.2em] uppercase flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  ✧ NARRATIVA DO GRIMÓRIO ✧
                </span>

                {/* Chapter navigation: < 17 / 20 > */}
                <div className="flex items-center gap-2 bg-black/60 px-3 py-1 rounded-full border border-amber-500/30 self-end sm:self-auto">
                  <button
                    onClick={handlePrevChapter}
                    className="text-amber-400 hover:text-white transition-colors p-1"
                    title="Capítulo Anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-mono font-bold text-amber-200">
                    &lt; {activeChapterIndex + 1} / {STORY_CHAPTERS.length} &gt;
                  </span>
                  <button
                    onClick={handleNextChapter}
                    className="text-amber-400 hover:text-white transition-colors p-1"
                    title="Próximo Capítulo"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Narrative Body: Illustration + Parchment */}
              <div className="mt-3.5 flex flex-col md:flex-row items-center gap-4">
                <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden border border-amber-500/30 shrink-0 relative bg-black">
                  <img
                    src={libraryHeaderBg}
                    alt="Grimório da Biblioteca"
                    className="w-full h-full object-cover opacity-85"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                </div>

                <div className="flex-1 space-y-2 text-left w-full">
                  <h3 className="text-sm sm:text-base font-serif font-black text-amber-200 uppercase tracking-wider">
                    {currentChapter.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#e0d6c8] font-serif leading-relaxed italic bg-black/50 p-3 sm:p-4 rounded-xl border border-white/5 shadow-inner">
                    "{currentChapter.text}"
                  </p>
                </div>
              </div>

              {/* Custom Story / Edit Box */}
              <div className="mt-4 pt-3 border-t border-amber-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-mono text-amber-300 font-bold uppercase tracking-wider">
                    Editar / Transcrever Narrativa da Rodada:
                  </label>
                  {savedNarrativeAlert && (
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40 animate-pulse">
                      Narrativa Atualizada na Abadia!
                    </span>
                  )}
                </div>
                <textarea
                  value={customStory}
                  onChange={(e) => setCustomStory(e.target.value)}
                  placeholder="Escreva a narrativa mística do Oráculo para orientar os investigadores..."
                  className="w-full h-20 p-3 bg-black/70 border border-amber-500/30 rounded-xl text-xs sm:text-sm font-serif text-amber-100 placeholder-zinc-500 focus:border-amber-400 focus:outline-none resize-none leading-relaxed"
                />
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1">
                  <span className="text-[10px] text-zinc-400 font-serif italic">
                    Ao salvar, o texto é transmitido imediatamente para os quadros de todos os investigadores.
                  </span>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={handleSaveNarrative}
                      className="flex-1 sm:flex-none px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-serif font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 border border-amber-300"
                    >
                      Salvar Narrativa
                    </button>
                    <button
                      onClick={() => {
                        handleNextChapter();
                        if (onUpdateStory) {
                          onUpdateStory(STORY_CHAPTERS[(activeChapterIndex + 1) % STORY_CHAPTERS.length].text);
                        }
                      }}
                      className="flex-1 sm:flex-none px-4 py-1.5 rounded-xl bg-gradient-to-r from-red-900 to-red-800 hover:from-red-800 hover:to-red-700 text-white font-serif font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 border border-red-500/40 flex items-center justify-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                      <span>Próximo Capítulo</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* VIEW 2: VERDADE SECRETA (CARTAS DO ASSASSINO & SOLUÇÃO) */}
        {/* ==================================================== */}
        {activeTab === 'VERDADE_SECRETA' && (
          <div className="space-y-4 animate-fade-in">
            {/* Secret Solution Banner */}
            <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-red-950/80 via-black to-red-950/80 border-2 border-red-500/50 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-red-900/60 border border-red-400 flex items-center justify-center shrink-0 shadow-lg">
                  <Skull className="w-5 h-5 text-red-300" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-serif font-black text-red-200 uppercase tracking-widest">
                    VERDADE SECRETA DO CRIME
                  </h2>
                  <p className="text-[11px] text-zinc-300 font-serif leading-tight">
                    Sigilo absoluto: apenas o Oráculo e o Assassino conhecem a conspiração. Toque em qualquer carta para examinar em detalhes ampliados.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold px-3 py-1 rounded-full bg-red-900/80 text-red-200 border border-red-400/50 uppercase tracking-wider shrink-0">
                ★ CONFIDENCIAL ★
              </span>
            </div>

            {/* Killer & Accomplice Identities */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Killer Identity Card */}
              <div
                onClick={() => {
                  soundEngine.playCardFlip();
                  if (killerChar) {
                    setInspectItem({ type: 'character', item: killerChar, player: killerPlayer });
                  }
                }}
                className="p-4 rounded-2xl bg-gradient-to-b from-[#2a0c07] via-[#140503] to-[#090201] border-2 border-red-500/60 shadow-xl cursor-pointer hover:border-red-400 hover:scale-[1.01] transition-all group relative overflow-hidden"
              >
                <div className="flex items-center justify-between pb-2 border-b border-red-500/30">
                  <span className="text-[10px] font-mono text-red-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Skull className="w-3.5 h-3.5 text-red-400" />
                    IDENTIDADE DO ASSASSINO
                  </span>
                  <span className="text-[9px] font-serif text-amber-300 uppercase tracking-wider bg-red-950 px-2 py-0.5 rounded border border-red-500/40 group-hover:bg-red-900">
                    Toque para Inspecionar
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <GothicAvatar
                    characterId={killerPlayer?.characterId || 'C01'}
                    avatarSeed={killerPlayer?.name}
                    name={killerPlayer?.name || 'Assassino'}
                    size="md"
                    glow={true}
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-serif font-black text-white group-hover:text-amber-200 transition-colors truncate">
                      {killerPlayer?.name || 'Identificando...'}
                    </h3>
                    <span className="text-xs font-serif text-red-400 font-bold block">
                      {killerChar?.name || 'Assassino da Abadia'}
                    </span>
                    <p className="text-[11px] text-zinc-300 font-serif italic line-clamp-2 mt-1">
                      "{killerChar?.bio || killerChar?.lore || 'O autor do assassinato encoberto pelas sombras.'}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Accomplice Identity Card (if present) */}
              <div
                onClick={() => {
                  if (accompliceChar) {
                    soundEngine.playCardFlip();
                    setInspectItem({ type: 'character', item: accompliceChar, player: accomplicePlayer });
                  }
                }}
                className={`p-4 rounded-2xl border-2 shadow-xl transition-all relative overflow-hidden ${
                  accomplicePlayer
                    ? 'bg-gradient-to-b from-[#1f0a28] via-[#0e0414] to-[#060209] border-purple-500/60 cursor-pointer hover:border-purple-400 hover:scale-[1.01] group'
                    : 'bg-black/40 border-zinc-800'
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-purple-500/30">
                  <span className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
                    CÚMPLICE / OCULTISTA
                  </span>
                  {accomplicePlayer && (
                    <span className="text-[9px] font-serif text-purple-300 uppercase tracking-wider bg-purple-950 px-2 py-0.5 rounded border border-purple-500/40">
                      Toque para Inspecionar
                    </span>
                  )}
                </div>

                {accomplicePlayer ? (
                  <div className="mt-3 flex items-center gap-3">
                    <GothicAvatar
                      characterId={accomplicePlayer?.characterId || 'C02'}
                      avatarSeed={accomplicePlayer?.name}
                      name={accomplicePlayer?.name || 'Cúmplice'}
                      size="md"
                      glow={true}
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-serif font-black text-white group-hover:text-purple-200 transition-colors truncate">
                        {accomplicePlayer.name}
                      </h3>
                      <span className="text-xs font-serif text-purple-400 font-bold block">
                        {accompliceChar?.name || 'Ocultista da Abadia'}
                      </span>
                      <p className="text-[11px] text-zinc-300 font-serif italic line-clamp-2 mt-1">
                        "{accompliceChar?.bio || accompliceChar?.lore || 'Auxiliou o assassino a esconder os rastros do códice.'}"
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 text-center py-2">
                    <span className="text-xs font-serif text-zinc-500 italic">
                      Nenhum cúmplice ativo nesta partida.
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Crime Solution Cards: Method & Object */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Method Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-b from-[#1e0805] via-[#100402] to-[#080201] border-2 border-red-500/50 shadow-xl flex flex-col items-center text-center space-y-3">
                <div className="w-full flex items-center justify-between pb-2 border-b border-red-500/30">
                  <span className="text-xs font-serif font-black text-red-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Skull className="w-4 h-4 text-red-400" />
                    MÉTODO DO CRIME (CAUSA DA MORTE)
                  </span>
                  <span className="text-[9px] font-mono font-bold text-red-300 bg-red-950 px-2 py-0.5 rounded border border-red-500/40">
                    {solutionMethod?.id || 'M??'}
                  </span>
                </div>

                {solutionMethod ? (
                  <div
                    onClick={() => {
                      soundEngine.playCardFlip();
                      setInspectItem({ type: 'method', item: solutionMethod, isSolution: true });
                    }}
                    className="cursor-pointer group flex flex-col items-center transition-transform hover:scale-105"
                  >
                    <MethodCard method={solutionMethod} isSolution={true} size="md" />
                    <button className="mt-2 px-3 py-1 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-500/50 text-red-200 text-[10px] font-serif uppercase tracking-wider flex items-center gap-1">
                      <Maximize2 className="w-3 h-3 text-red-300" />
                      Inspecionar Método
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400 font-serif italic py-6">
                    Aguardando distribuição de método...
                  </p>
                )}
              </div>

              {/* Object Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-b from-[#1c1205] via-[#0f0902] to-[#080501] border-2 border-amber-500/50 shadow-xl flex flex-col items-center text-center space-y-3">
                <div className="w-full flex items-center justify-between pb-2 border-b border-amber-500/30">
                  <span className="text-xs font-serif font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Search className="w-4 h-4 text-amber-400" />
                    OBJETO DO CRIME (ARMA OCULTA)
                  </span>
                  <span className="text-[9px] font-mono font-bold text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-500/40">
                    {solutionObject?.id || 'O??'}
                  </span>
                </div>

                {solutionObject ? (
                  <div
                    onClick={() => {
                      soundEngine.playCardFlip();
                      setInspectItem({ type: 'object', item: solutionObject, isSolution: true });
                    }}
                    className="cursor-pointer group flex flex-col items-center transition-transform hover:scale-105"
                  >
                    <ObjectCard object={solutionObject} isSolution={true} size="md" />
                    <button className="mt-2 px-3 py-1 rounded-lg bg-amber-950/80 hover:bg-amber-900 border border-amber-500/50 text-amber-200 text-[10px] font-serif uppercase tracking-wider flex items-center gap-1">
                      <Maximize2 className="w-3 h-3 text-amber-300" />
                      Inspecionar Objeto
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400 font-serif italic py-6">
                    Aguardando distribuição de objeto...
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* VIEW 3: EVIDÊNCIAS (MARCADORES & CARTAS DE PISTAS) */}
        {/* ==================================================== */}
        {activeTab === 'EVIDÊNCIAS' && (
          <div className="space-y-4 animate-fade-in">
            {/* Markers Controls Panel */}
            <div className="p-3 sm:p-5 rounded-2xl bg-gradient-to-b from-[#140b07] via-[#0d0604] to-[#080302] border-2 border-amber-500/40 shadow-xl space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2.5 border-b border-amber-500/20">
                <div>
                  <h3 className="text-xs sm:text-sm font-serif font-black text-amber-200 uppercase tracking-widest flex items-center gap-2">
                    <Search className="w-4 h-4 text-amber-400" />
                    PAINEL DE MARCADORES DO ORÁCULO
                  </h3>
                  <span className="text-[10px] text-zinc-400 font-serif block">
                    Selecione a cor e clique nas opções das cartas de evidência para orientar os investigadores
                  </span>
                </div>

                {/* Actions Header Bar: Puxar Nova Evidência */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {onDrawEvidence && (
                    <button
                      onClick={() => {
                        soundEngine.playCardFlip();
                        onDrawEvidence();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-black text-xs font-serif font-black uppercase flex items-center gap-1.5 transition-all shadow-md active:scale-95 border border-amber-300"
                    >
                      <PlusCircle className="w-4 h-4 text-black" />
                      <span>Puxar Evidência</span>
                    </button>
                  )}
                </div>
              </div>

              {/* MARCADORES DISPONÍVEIS ROW (10 Circular Bullets + Counter) */}
              <div className="p-3 rounded-xl bg-black/60 border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                    MARCADORES DISPONÍVEIS:
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-200">
                    {availableMarkers} / {maxMarkers} RESTANTES
                  </span>
                </div>

                {/* Row of 10 wax seals representation */}
                <div className="flex items-center gap-2 flex-wrap">
                  {Array.from({ length: maxMarkers }).map((_, idx) => {
                    const isUsed = idx >= availableMarkers;
                    return (
                      <div
                        key={idx}
                        className={`w-6 h-6 transition-all flex items-center justify-center ${
                          isUsed ? 'opacity-25 grayscale' : 'drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]'
                        }`}
                        title={isUsed ? 'Selo Alocado' : 'Selo Disponível'}
                      >
                        <GothicWaxSeal color="dourado" size="custom" glow={!isUsed} pulse={!isUsed && idx === availableMarkers - 1} />
                      </div>
                    );
                  })}
                </div>

                {/* Color Selection Buttons */}
                <div className="pt-2 flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono text-zinc-400 mr-1 uppercase">Selo de Cera:</span>
                  {colors.map((c) => {
                    const info = MARKER_INFOS[c];
                    const isSelected = selectedColor === c;
                    return (
                      <button
                        key={c}
                        onClick={() => {
                          soundEngine.playClick();
                          setSelectedColor(c);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-serif font-bold uppercase transition-all flex items-center gap-2 border ${
                          isSelected
                            ? 'bg-amber-950/90 text-amber-200 border-amber-400 shadow-lg ring-2 ring-amber-400 scale-105'
                            : 'bg-black/60 border-white/10 text-zinc-300 hover:text-white hover:border-white/30'
                        }`}
                      >
                        <div className="w-5 h-5">
                          <GothicWaxSeal color={c} size="custom" glow={isSelected} />
                        </div>
                        <span>{info.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons Row: Limpar, Ver Resumo, Puxar, Catalogo Completo 60 */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    if (onClearAllMarkers) {
                      onClearAllMarkers();
                    } else {
                      room.evidencesOnTable.forEach((ev) => {
                        if (ev.markedOptionIndex !== undefined) {
                          onMarkOption(ev.id, -1, 'dourado');
                        }
                      });
                    }
                  }}
                  className="py-2 px-2.5 rounded-xl bg-red-950/70 hover:bg-red-900 border border-red-500/40 text-red-200 text-[10px] sm:text-xs font-serif font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-red-400" />
                  <span>LIMPAR</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setShowSummaryModal(true);
                  }}
                  className="py-2 px-2.5 rounded-xl bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 border border-amber-400 text-white text-[10px] sm:text-xs font-serif font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow active:scale-95"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-200" />
                  <span>RESUMO</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setShowAll60EvidencesModal(true);
                  }}
                  className="py-2 px-2.5 rounded-xl bg-gradient-to-r from-sky-900/90 to-blue-950/90 hover:from-sky-800 hover:to-blue-900 border border-sky-400/60 text-sky-200 text-[10px] sm:text-xs font-serif font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow active:scale-95"
                >
                  <Grid className="w-3.5 h-3.5 text-sky-400" />
                  <span>60 EVIDÊNCIAS</span>
                </button>

                {onDrawEvidence && (
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playCardFlip();
                      onDrawEvidence();
                    }}
                    className="py-2 px-2.5 rounded-xl bg-amber-950/90 hover:bg-amber-900 border border-amber-500/50 text-amber-200 text-[10px] sm:text-xs font-serif font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow active:scale-95"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>+ PUXAR</span>
                  </button>
                )}
              </div>
            </div>

            {/* Evidence Cards Grid on Table */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {room.evidencesOnTable.map((ev: CardEvidence) => {
                const isFundamental = ev.id === 'E01' || ev.id === 'E02';
                return (
                  <div key={ev.id} className="relative flex flex-col bg-black/40 p-2.5 rounded-2xl border border-amber-950/80 shadow-md group">
                    <EvidenceCard
                      evidence={ev}
                      isOracleInteractive={true}
                      selectedColor={selectedColor}
                      onOptionClick={(optIdx) => {
                        soundEngine.playCardFlip();
                        // Open the large-view placement modal with this option pre-selected
                        setPlacementEvidence({ ...ev, markedOptionIndex: optIdx });
                      }}
                      onDoubleClickCard={() => {
                        soundEngine.playCardFlip();
                        setPlacementEvidence(ev);
                      }}
                    />
                    <div className="mt-2 flex items-center justify-between gap-1.5 pt-1.5 border-t border-white/5">
                      <span className="text-[8.5px] font-serif italic text-amber-400/80 flex items-center gap-1 pl-1">
                        <Sparkles className="w-2.5 h-2.5 text-amber-300 animate-pulse" />
                        <span>Toque 2x p/ alocar</span>
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            soundEngine.playCardFlip();
                            setInspectItem({ type: 'evidence', item: ev });
                          }}
                          className="py-1 px-2 rounded-lg bg-black/70 hover:bg-zinc-800 text-amber-300 text-[9px] font-serif uppercase tracking-wider border border-white/10 flex items-center gap-1 active:scale-95 transition-all"
                          title="Examinar Carta Ampliada"
                        >
                          <Maximize2 className="w-2.5 h-2.5" />
                          <span>Ver</span>
                        </button>

                        {!isFundamental && onDiscardEvidence && (
                          <button
                            type="button"
                            onClick={() => {
                              soundEngine.playClick();
                              onDiscardEvidence(ev.id);
                            }}
                            className="py-1 px-1.5 rounded-lg bg-red-950/50 hover:bg-red-900 text-red-300 text-[9px] font-serif border border-red-500/40 transition-colors flex items-center gap-1 active:scale-95"
                            title="Descartar Evidência"
                          >
                            <Trash2 className="w-2.5 h-2.5 text-red-400" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* VIEW 4: EVENTOS (ATIVO + CATÁLOGO COMPLETO DE CARTAS) */}
        {/* ==================================================== */}
        {activeTab === 'EVENTOS' && (
          <div className="space-y-4 animate-fade-in">
            {/* Active Event Banner & Draw Random Event */}
            <div className="p-4 rounded-2xl bg-gradient-to-b from-[#240a08] via-[#140403] to-[#0a0201] border-2 border-red-500/50 shadow-xl space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-red-500/30">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-red-400 animate-pulse" />
                  <div>
                    <h3 className="text-xs sm:text-sm font-serif font-black text-red-200 uppercase tracking-wider">
                      EVENTO ATIVO NA RODADA
                    </h3>
                    <span className="text-[10px] text-zinc-400 font-serif">
                      Eventos alteram as regras do debate e impõem desafios aos investigadores
                    </span>
                  </div>
                </div>

                {onDrawEvent && (
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      onDrawEvent();
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-700 via-red-600 to-red-700 hover:from-red-600 hover:to-red-500 text-white text-xs font-serif font-black uppercase tracking-wider transition-all shadow-md active:scale-95 border border-red-400 flex items-center gap-1.5 self-end sm:self-auto"
                  >
                    <Zap className="w-4 h-4 text-yellow-300" />
                    Sortear Evento Aleatório
                  </button>
                )}
              </div>

              {room.activeEvent ? (
                <div
                  onClick={() => {
                    soundEngine.playCardFlip();
                    setInspectItem({ type: 'event', item: room.activeEvent!.event });
                  }}
                  className="p-3.5 rounded-xl bg-black/70 border border-red-500/50 space-y-2 cursor-pointer hover:border-red-400 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-serif font-black text-amber-300 uppercase group-hover:text-white transition-colors">
                      {room.activeEvent.event.name}
                    </span>
                    <span className="text-xs font-mono text-red-400 font-bold bg-red-950 px-2.5 py-0.5 rounded border border-red-500/50">
                      TERMINA EM: {Math.floor(room.activeEvent.remainingSeconds / 60)}:
                      {(room.activeEvent.remainingSeconds % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-200 font-serif leading-relaxed italic">
                    "{room.activeEvent.event.effect}"
                  </p>
                  <span className="text-[9px] font-mono text-red-300 uppercase block text-right">
                    Toque para inspecionar carta completa →
                  </span>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-center">
                  <p className="text-xs text-zinc-400 font-serif italic">
                    Nenhum evento ativo no momento. Use o botão acima para sortear um evento cósmico.
                  </p>
                </div>
              )}
            </div>

            {/* Catalog of all Gothic Events */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <h4 className="text-xs sm:text-sm font-serif font-black text-amber-200 uppercase tracking-widest flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  CATÁLOGO DE CARTAS DE EVENTOS ({filteredEvents.length})
                </h4>

                {/* Search Bar */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    value={eventFilterTerm}
                    onChange={(e) => setEventFilterTerm(e.target.value)}
                    placeholder="Buscar evento..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-black/60 border border-white/10 text-xs font-serif text-amber-100 placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Grid of all Event Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredEvents.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => {
                      soundEngine.playCardFlip();
                      setInspectItem({ type: 'event', item: event });
                    }}
                    className="cursor-pointer transition-transform hover:scale-[1.02] flex flex-col justify-between"
                  >
                    <EventCard event={event} />
                    <button className="mt-1.5 w-full py-1 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-500/40 text-red-200 text-[10px] font-serif font-bold uppercase tracking-wider flex items-center justify-center gap-1">
                      <Maximize2 className="w-3 h-3 text-red-300" />
                      Inspecionar Evento
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* VIEW 5: HABILIDADES (USADAS + CATÁLOGO COMPLETO) */}
        {/* ==================================================== */}
        {activeTab === 'HABILIDADES' && (
          <div className="space-y-4 animate-fade-in">
            {/* Active / Used Abilities */}
            <div className="p-4 rounded-2xl bg-gradient-to-b from-[#082018] via-[#04120e] to-[#020806] border-2 border-emerald-500/50 shadow-xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-500/30">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h3 className="text-xs sm:text-sm font-serif font-black text-emerald-200 uppercase tracking-wider">
                      HABILIDADES USADAS NA RODADA
                    </h3>
                    <span className="text-[10px] text-zinc-400 font-serif">
                      Registro de poderes e ações especiais executadas pelos investigadores
                    </span>
                  </div>
                </div>
                <span className="text-[9px] font-mono text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded border border-emerald-500/40">
                  REGISTRO
                </span>
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {room.players.filter((p) => p.abilityUsed).length > 0 ? (
                  room.players
                    .filter((p) => p.abilityUsed)
                    .map((p) => {
                      const ab = ABILITIES.find((a) => a.id === p.assignedAbilityId);
                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            if (ab) {
                              soundEngine.playCardFlip();
                              setInspectItem({ type: 'ability', item: ab });
                            }
                          }}
                          className="p-2.5 rounded-xl bg-black/70 border border-emerald-500/40 flex items-center justify-between text-xs cursor-pointer hover:border-emerald-300 transition-all"
                        >
                          <div className="flex items-center gap-2">
                            <GothicAvatar characterId={p.characterId} name={p.name} size="sm" />
                            <div>
                              <span className="font-serif font-bold text-zinc-200 block">{p.name}</span>
                              <span className="text-[10px] font-serif text-emerald-300">{ab?.name || 'Habilidade Especial'}</span>
                            </div>
                          </div>
                          <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/40">
                            Ativada
                          </span>
                        </div>
                      );
                    })
                ) : (
                  <p className="text-xs text-zinc-400 font-serif italic p-3 text-center bg-black/40 rounded-xl">
                    Nenhum investigador ativou sua habilidade única nesta rodada ainda.
                  </p>
                )}
              </div>
            </div>

            {/* Catalog of all Abilities */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <h4 className="text-xs sm:text-sm font-serif font-black text-emerald-200 uppercase tracking-widest flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  CATÁLOGO DE CARTAS DE HABILIDADES ({filteredAbilities.length})
                </h4>

                {/* Search Bar */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    value={abilityFilterTerm}
                    onChange={(e) => setAbilityFilterTerm(e.target.value)}
                    placeholder="Buscar habilidade..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-black/60 border border-white/10 text-xs font-serif text-emerald-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              {/* Grid of all Ability Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredAbilities.map((ability) => (
                  <div
                    key={ability.id}
                    onClick={() => {
                      soundEngine.playCardFlip();
                      setInspectItem({ type: 'ability', item: ability });
                    }}
                    className="cursor-pointer transition-transform hover:scale-[1.02] flex flex-col justify-between"
                  >
                    <AbilityCard ability={ability} />
                    <button className="mt-1.5 w-full py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-200 text-[10px] font-serif font-bold uppercase tracking-wider flex items-center justify-center gap-1">
                      <Maximize2 className="w-3 h-3 text-emerald-300" />
                      Inspecionar Habilidade
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* VIEW 6: RODADA (CONTROLE DE TEMPO & FINALIZAÇÃO) */}
        {/* ==================================================== */}
        {activeTab === 'RODADA' && (
          <div className="space-y-5 animate-fade-in">
            {/* Round Summary Card */}
            <div className="rounded-2xl p-4 sm:p-6 bg-gradient-to-b from-[#1c0a06] via-[#100503] to-[#080201] border-2 border-amber-500/60 shadow-2xl space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-amber-500/30">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-950/80 border border-amber-500/60 flex items-center justify-center text-amber-300 shadow-lg">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-serif font-black text-amber-200 uppercase tracking-widest">
                      RODADA {room.round} DE 3
                    </h3>
                    <span className="text-xs text-zinc-300 font-serif">
                      Fase do Oráculo: Distribuição de Pistas e Direção Mística
                    </span>
                  </div>
                </div>

                <div className="text-right bg-black/60 px-4 py-2 rounded-xl border border-amber-500/30">
                  <span className="text-[10px] font-mono text-zinc-400 block uppercase">Pistas Marcadas:</span>
                  <span className="text-sm font-mono font-bold text-amber-300">
                    {placedMarkersCount} / {maxMarkers} Pistas
                  </span>
                </div>
              </div>

              {/* Timer Adjusters */}
              <div className="p-4 rounded-xl bg-black/60 border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-serif font-bold text-amber-300 uppercase tracking-wider">
                    Duração da Discussão: ({currentDuration === 0 ? 'Sem Limite' : `${Math.floor(currentDuration / 60)} min`})
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400">
                    Apenas o Oráculo define o ritmo
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => onAdjustTimer && onAdjustTimer(-30)}
                    className="px-3.5 py-1.5 rounded-xl bg-red-950/80 hover:bg-red-800 text-red-200 border border-red-500/40 text-xs font-mono font-bold transition-all shadow active:scale-95"
                  >
                    -30s
                  </button>
                  <button
                    onClick={() => onAdjustTimer && onAdjustTimer(30)}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-500/40 text-xs font-mono font-bold transition-all shadow active:scale-95"
                  >
                    +30s
                  </button>

                  {[120, 180, 240, 300].map((s) => (
                    <button
                      key={s}
                      onClick={() => onSetTimerDuration && onSetTimerDuration(s)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border ${
                        currentDuration === s
                          ? 'bg-amber-600 text-white border-amber-300 shadow'
                          : 'bg-black/60 border-white/10 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {s / 60}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Grand Red Gothic Button: ENCERRAR RODADA & INICIAR DISCUSSÃO */}
              <div className="pt-3 flex justify-center">
                <button
                  onClick={() => {
                    soundEngine.playRoundStart();
                    onFinishOraclePhase();
                  }}
                  className="w-full max-w-lg px-8 py-4 rounded-2xl bg-gradient-to-r from-red-700 via-red-600 to-red-700 hover:from-red-600 hover:to-red-500 text-white font-serif font-black text-sm sm:text-base uppercase tracking-[0.2em] transition-all shadow-[0_0_24px_rgba(220,38,38,0.6)] active:scale-95 border-2 border-red-400 flex items-center justify-center gap-3 animate-pulse"
                >
                  <Clock className="w-5 h-5 text-yellow-300" />
                  <span>ENCERRAR RODADA & INICIAR DISCUSSÃO ⌛</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ==================================================== */}
      {/* CARD INSPECTION / ZOOM MODAL (HIGH RESOLUTION FULL SCREEN) */}
      {/* ==================================================== */}
      {inspectItem && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 md:p-8 animate-fade-in overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setInspectItem(null);
          }}
        >
          <div className="rounded-3xl max-w-2xl sm:max-w-3xl w-full p-4 sm:p-8 shadow-2xl space-y-5 relative my-auto bg-[#0d0604]/95 border border-amber-500/40 text-[#e0d8d0] backdrop-blur-xl">
            {/* Header with Close */}
            <div className="flex items-center justify-between border-b border-amber-500/40 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rotate-45 bg-amber-400" />
                <span className="text-xs sm:text-sm font-serif text-amber-300 font-bold uppercase tracking-[0.2em]">
                  {inspectItem.type === 'method' && 'MÉTODO DO CRIME • CAUSA DA MORTE'}
                  {inspectItem.type === 'object' && 'OBJETO DO CRIME • ARMA OCULTA'}
                  {inspectItem.type === 'evidence' && 'CARTA DE EVIDÊNCIA'}
                  {inspectItem.type === 'event' && 'CARTA DE EVENTO'}
                  {inspectItem.type === 'ability' && 'CARTA DE HABILIDADE'}
                  {inspectItem.type === 'character' && 'DOSSIÊ DE PERSONAGEM'}
                </span>
              </div>
              <button
                onClick={() => setInspectItem(null)}
                className="p-1.5 rounded-xl text-zinc-300 hover:text-white bg-black/70 border border-amber-500/40 hover:border-amber-400 transition-all active:scale-95 shadow-md"
                title="Fechar Visualização (ESC)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Full-Screen Card Layout */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 py-2">
              {/* Card Container with explicit dimensions and full display */}
              <div className="flex items-center justify-center shrink-0 w-full max-w-[280px] sm:max-w-[320px] md:max-w-[350px]">
                {inspectItem.type === 'method' && (
                  <div className="w-full flex justify-center shadow-2xl">
                    <MethodCard method={inspectItem.item} isSolution={inspectItem.isSolution} size="lg" />
                  </div>
                )}

                {inspectItem.type === 'object' && (
                  <div className="w-full flex justify-center shadow-2xl">
                    <ObjectCard object={inspectItem.item} isSolution={inspectItem.isSolution} size="lg" />
                  </div>
                )}

                {inspectItem.type === 'evidence' && (
                  <div className="w-full max-w-sm">
                    <EvidenceCard
                      evidence={inspectItem.item}
                      isOracleInteractive={false}
                    />
                  </div>
                )}

                {inspectItem.type === 'event' && (
                  <div className="w-full max-w-sm">
                    <EventCard event={inspectItem.item} />
                  </div>
                )}

                {inspectItem.type === 'ability' && (
                  <div className="w-full max-w-sm">
                    <AbilityCard ability={inspectItem.item} />
                  </div>
                )}

                {inspectItem.type === 'character' && (
                  <div className="w-full space-y-4 text-center">
                    <GothicAvatar
                      characterId={inspectItem.item.id}
                      avatarSeed={inspectItem.item.name}
                      name={inspectItem.item.name}
                      size="lg"
                      glow={true}
                    />
                    <div>
                      <h3 className="text-xl font-serif font-black text-white">{inspectItem.item.name}</h3>
                      <span className="text-xs font-serif text-amber-300 font-bold block mt-1">{inspectItem.item.title || inspectItem.item.roleTag}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Side Details / Lore & Oracle Guidance Panel */}
              <div className="flex-1 flex flex-col justify-between space-y-3 w-full bg-black/60 p-4 sm:p-5 rounded-2xl border border-amber-900/40">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-bold">
                      {inspectItem.type === 'method' && 'MÉTODO FATAL'}
                      {inspectItem.type === 'object' && 'OBJETO FATAL'}
                      {inspectItem.type === 'character' && 'HISTÓRICO'}
                      {inspectItem.type === 'evidence' && 'PISTA MÍSTICA'}
                      {inspectItem.type === 'event' && 'EVENTO'}
                      {inspectItem.type === 'ability' && 'HABILIDADE'}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/40">
                      {inspectItem.item?.id || 'ID??'}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-serif font-black text-amber-100 uppercase tracking-wide mt-2">
                    {inspectItem.item?.name || 'Item do Códice'}
                  </h3>

                  {inspectItem.item?.category && (
                    <span className="text-xs font-serif text-amber-400/90 font-bold block mt-0.5">
                      Categoria: {inspectItem.item.category}
                    </span>
                  )}

                  {inspectItem.isSolution && (
                    <div className="mt-3 p-2.5 rounded-xl bg-red-950/70 border border-red-500/50 flex items-center gap-2">
                      <Skull className="w-4 h-4 text-red-400 shrink-0 animate-pulse" />
                      <p className="text-xs font-serif text-red-200 leading-snug">
                        ★ Solução Secreta: Este elemento compõe a verdade do assassinato.
                      </p>
                    </div>
                  )}

                  {inspectItem.item?.description && (
                    <p className="text-xs sm:text-sm text-zinc-300 font-serif leading-relaxed mt-2.5 italic">
                      "{inspectItem.item.description}"
                    </p>
                  )}

                  {inspectItem.item?.bio && (
                    <p className="text-xs sm:text-sm text-zinc-300 font-serif leading-relaxed mt-2.5 italic">
                      "{inspectItem.item.bio}"
                    </p>
                  )}

                  {inspectItem.item?.lore && (
                    <p className="text-xs sm:text-sm text-zinc-300 font-serif leading-relaxed mt-2.5 italic">
                      "{inspectItem.item.lore}"
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-white/10 text-[10px] text-zinc-400 font-serif italic flex items-center justify-between">
                  <span>💡 Duplo toque/clique para vincular arte customizada</span>
                  <span className="text-amber-400 font-mono font-bold">ALTA RESOLUÇÃO</span>
                </div>
              </div>
            </div>

            {/* Bottom Action Button */}
            <button
              onClick={() => setInspectItem(null)}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-black font-serif font-black text-xs sm:text-sm uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95 border border-amber-300"
            >
              FECHAR VISUALIZAÇÃO
            </button>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* SUMMARY MODAL */}
      {/* ==================================================== */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-gradient-to-b from-[#180a06] via-[#0e0402] to-black border-2 border-amber-500/60 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-amber-500/30">
              <h3 className="text-base font-serif font-black text-amber-200 uppercase tracking-widest">
                RESUMO DO CÓDICE E PISTAS
              </h3>
              <button
                onClick={() => setShowSummaryModal(false)}
                className="p-1.5 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {room.evidencesOnTable.map((ev) => {
                const marked = ev.markedOptionIndex !== undefined;
                const optText = marked ? ev.options[ev.markedOptionIndex!] : 'Não marcada';
                return (
                  <div key={ev.id} className="p-2.5 rounded-xl bg-black/60 border border-white/10 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-serif font-bold text-amber-300 block">{ev.title}</span>
                      <span className="text-[11px] text-zinc-300 font-serif">
                        Opção: {optText}
                      </span>
                    </div>
                    {marked && ev.markedColor && MARKER_INFOS[ev.markedColor] && (
                      <span className="px-2 py-0.5 rounded-full bg-black/80 text-amber-300 border border-amber-400/40 text-[10px] font-mono flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: MARKER_INFOS[ev.markedColor].hex }} />
                        <span>{MARKER_INFOS[ev.markedColor].name}</span>
                        <span className="text-[9px] text-zinc-400">({MARKER_INFOS[ev.markedColor].shortRole || MARKER_INFOS[ev.markedColor].meaning})</span>
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setShowSummaryModal(false)}
              className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-serif font-bold text-xs uppercase"
            >
              Fechar Resumo
            </button>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 60 EVIDENCES COMPLETE CATALOG MODAL (E01 to E60) */}
      {/* ==================================================== */}
      {showAll60EvidencesModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fade-in">
          <div className="bg-gradient-to-b from-[#180a06] via-[#0e0402] to-black border-2 border-amber-500/60 rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-amber-500/30 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-sky-950/80 border border-sky-500/40 text-sky-300">
                  <Grid className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-serif font-black text-amber-200 uppercase tracking-wider">
                    BIBLIOTECA COMPLETA DE EVIDÊNCIAS ({EVIDENCES.length} CARTAS)
                  </h3>
                  <span className="text-[10px] sm:text-xs text-zinc-400 font-serif">
                    Todas as 60 tábuas periciais do Códice (E01 a E60)
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAll60EvidencesModal(false)}
                className="p-1.5 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white border border-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter & Range Controls */}
            <div className="py-3 space-y-2 shrink-0 border-b border-amber-900/40">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={evidenceCatalogSearch}
                  onChange={(e) => setEvidenceCatalogSearch(e.target.value)}
                  placeholder="Buscar evidência por código (ex: E01), título ou opção (ex: Asfixia)..."
                  className="w-full pl-9 pr-8 py-2 rounded-xl bg-black/70 border border-amber-500/30 text-amber-100 placeholder-zinc-500 text-xs font-serif focus:outline-none focus:border-amber-400"
                />
                {evidenceCatalogSearch && (
                  <button
                    type="button"
                    onClick={() => setEvidenceCatalogSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Range Filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 text-[10px] font-mono">
                {(['ALL', 'E01-E10', 'E11-E20', 'E21-E30', 'E31-E40', 'E41-E50', 'E51-E60'] as const).map((rng) => {
                  const isSelected = evidenceCatalogRange === rng;
                  return (
                    <button
                      key={rng}
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        setEvidenceCatalogRange(rng);
                      }}
                      className={`px-2.5 py-1 rounded-lg border font-bold whitespace-nowrap transition-all ${
                        isSelected
                          ? 'bg-amber-600 text-white border-amber-300 shadow'
                          : 'bg-black/50 border-white/10 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {rng === 'ALL' ? 'Todas (60)' : rng}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Grid of Evidence Cards */}
            <div className="flex-1 overflow-y-auto pr-1 py-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {EVIDENCES.filter((ev) => {
                // Range filter
                if (evidenceCatalogRange !== 'ALL') {
                  const num = parseInt(ev.id.replace('E', ''), 10);
                  if (evidenceCatalogRange === 'E01-E10' && (num < 1 || num > 10)) return false;
                  if (evidenceCatalogRange === 'E11-E20' && (num < 11 || num > 20)) return false;
                  if (evidenceCatalogRange === 'E21-E30' && (num < 21 || num > 30)) return false;
                  if (evidenceCatalogRange === 'E31-E40' && (num < 31 || num > 40)) return false;
                  if (evidenceCatalogRange === 'E41-E50' && (num < 41 || num > 50)) return false;
                  if (evidenceCatalogRange === 'E51-E60' && (num < 51 || num > 60)) return false;
                }
                // Search filter
                if (evidenceCatalogSearch.trim()) {
                  const q = evidenceCatalogSearch.toLowerCase();
                  const matchId = ev.id.toLowerCase().includes(q);
                  const matchTitle = ev.title.toLowerCase().includes(q);
                  const matchOpt = ev.options.some((o) => o.toLowerCase().includes(q));
                  return matchId || matchTitle || matchOpt;
                }
                return true;
              }).map((ev) => {
                const onTable = room.evidencesOnTable.find((e) => e.id === ev.id);
                const isMarked = onTable && onTable.markedOptionIndex !== undefined;

                return (
                  <div
                    key={ev.id}
                    className={`p-3 rounded-2xl border flex flex-col justify-between transition-all ${
                      onTable
                        ? 'bg-amber-950/30 border-amber-500/60 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
                        : 'bg-black/60 border-zinc-800 hover:border-zinc-600'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-white/5">
                        <span className="text-[11px] font-mono font-bold text-amber-400">
                          {ev.id}
                        </span>
                        {onTable ? (
                          <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Na Mesa
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono text-zinc-500">
                            No Arquivo
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-serif font-bold text-amber-100 uppercase tracking-wide mb-2">
                        {ev.title}
                      </h4>

                      {/* 6 Options Preview */}
                      <div className="grid grid-cols-2 gap-1 mb-2">
                        {ev.options.map((opt, oIdx) => {
                          const isOptionMarked = onTable?.markedOptionIndex === oIdx;
                          return (
                            <div
                              key={oIdx}
                              className={`px-1.5 py-1 rounded text-[10px] font-serif border flex items-center justify-between ${
                                isOptionMarked
                                  ? 'bg-amber-600 text-white font-bold border-amber-300 shadow-sm'
                                  : 'bg-black/40 border-white/5 text-zinc-400'
                              }`}
                            >
                              <span className="truncate">{opt}</span>
                              {isOptionMarked && (
                                <span className="w-1.5 h-1.5 rounded-full bg-white ml-1 shrink-0" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Action button */}
                    <div className="pt-2 border-t border-white/5 flex items-center gap-2">
                      {!onTable && onAddSpecificEvidence ? (
                        <button
                          type="button"
                          onClick={() => {
                            soundEngine.playCardFlip();
                            onAddSpecificEvidence(ev.id);
                          }}
                          className="w-full py-1.5 rounded-xl bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white font-serif font-bold text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-1 active:scale-95 shadow"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Adicionar à Mesa</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            soundEngine.playClick();
                            setInspectItem({ type: 'evidence', item: ev });
                          }}
                          className="w-full py-1.5 rounded-xl bg-black/60 hover:bg-zinc-800 border border-white/10 text-zinc-300 hover:text-white font-serif font-bold text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-1 active:scale-95"
                        >
                          <Maximize2 className="w-3 h-3 text-amber-400" />
                          <span>Examinar</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-amber-900/40 flex items-center justify-between shrink-0">
              <span className="text-[11px] font-mono text-zinc-400">
                Total: 60 evidências carregadas no Códice
              </span>
              <button
                type="button"
                onClick={() => setShowAll60EvidencesModal(false)}
                className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-600 text-white font-serif font-bold text-xs uppercase tracking-wider transition-all"
              >
                Fechar Catálogo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 4: LARGE EVIDENCE MARKER PLACEMENT MODAL */}
      {/* ==================================================== */}
      {placementEvidence && (
        <EvidenceMarkerPlacementModal
          evidence={
            room.evidencesOnTable.find((e) => e.id === placementEvidence.id) ||
            placementEvidence
          }
          initialColor={selectedColor}
          onSaveMark={(evidenceId, optionIdx, color, coords) => {
            onMarkOption(evidenceId, optionIdx, color, coords);
            setPlacementEvidence(null);
          }}
          onRemoveMark={(evidenceId) => {
            onMarkOption(evidenceId, -1, 'dourado');
            setPlacementEvidence(null);
          }}
          onClose={() => setPlacementEvidence(null)}
        />
      )}
    </div>
  );
};
