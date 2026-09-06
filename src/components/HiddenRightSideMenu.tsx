import React, { useState, useRef, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Flame,
  Shield,
  MessageSquare,
  Layers,
  HelpCircle,
  Book,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X,
} from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

export interface HiddenRightSideMenuProps {
  onOpenNarrative: () => void;
  onOpenEvidence: () => void;
  onOpenEvents: () => void;
  onOpenAbilities: () => void;
  onOpenChat: () => void;
  onOpenCards: () => void;
  onOpenQuestions: () => void;
  onOpenRules: () => void;
  hasActiveEvent?: boolean;
  hasActiveAbility?: boolean;
  hasUnreadNarrative?: boolean;
  hasUnreadChat?: boolean;
}

export const HiddenRightSideMenu: React.FC<HiddenRightSideMenuProps> = ({
  onOpenNarrative,
  onOpenEvidence,
  onOpenEvents,
  onOpenAbilities,
  onOpenChat,
  onOpenCards,
  onOpenQuestions,
  onOpenRules,
  hasActiveEvent,
  hasActiveAbility,
  hasUnreadNarrative,
  hasUnreadChat,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    hideTimerRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 450);
  };

  const handleTouchToggle = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`fixed right-0 top-1/2 -translate-y-1/2 z-40 flex items-center transition-transform duration-300 ease-out select-none ${
        isOpen ? 'translate-x-0' : 'translate-x-[calc(100%-32px)] sm:translate-x-[calc(100%-36px)]'
      }`}
    >
      {/* 1. DOCKED VERTICAL TAB HANDLE (Always visible peeking on the right edge) */}
      <button
        type="button"
        onTouchEnd={handleTouchToggle}
        onClick={() => {
          soundEngine.playClick();
          setIsOpen(!isOpen);
        }}
        className={`flex flex-col items-center justify-center py-3.5 px-1 sm:px-1.5 rounded-l-2xl border-y-2 border-l-2 transition-all shadow-2xl cursor-pointer ${
          isOpen
            ? 'bg-gradient-to-b from-amber-600 via-amber-500 to-amber-700 border-amber-300 text-black shadow-amber-500/50'
            : 'bg-gradient-to-b from-[#240e06] via-[#120502] to-[#240e06] hover:from-[#3a180b] hover:to-[#1a0703] border-amber-500/70 text-amber-200 shadow-black'
        }`}
        title="Menu Oculto de Painéis (Passe o mouse ou toque para expandir)"
      >
        {/* Glow indicator dot */}
        <div className="relative mb-1">
          <Sparkles className={`w-3.5 h-3.5 ${isOpen ? 'text-black' : 'text-amber-300 animate-pulse'}`} />
          {(hasActiveEvent || hasActiveAbility || hasUnreadNarrative || hasUnreadChat) && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-ping" />
          )}
        </div>

        {/* Vertical Text "PAINÉIS" */}
        <div className="flex flex-col items-center gap-0.5 text-[8.5px] sm:text-[9.5px] font-serif font-black tracking-widest uppercase my-0.5">
          <span>P</span>
          <span>A</span>
          <span>I</span>
          <span>N</span>
          <span>É</span>
          <span>I</span>
          <span>S</span>
        </div>

        <div className="mt-1">
          {isOpen ? (
            <ChevronRight className="w-3 h-3 text-black" />
          ) : (
            <ChevronLeft className="w-3 h-3 text-amber-300 animate-bounce" />
          )}
        </div>
      </button>

      {/* 2. EXPANDED DRAWER PANEL WITH GOTHIC BUTTONS */}
      <div
        className="p-2 sm:p-2.5 rounded-l-2xl bg-gradient-to-b from-[#140804]/98 via-[#0a0302]/98 to-[#0d0402]/98 backdrop-blur-xl border-y-2 border-l-2 border-amber-500/60 shadow-[0_0_35px_rgba(0,0,0,0.9)] flex flex-col gap-1.5 w-44 sm:w-48"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Title & Close Button */}
        <div className="flex items-center justify-between pb-1 mb-0.5 border-b border-amber-500/20 px-1">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="text-[10px] font-serif font-black text-amber-200 tracking-wider uppercase">
              PAINÉIS DE JOGO
            </span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-0.5 rounded text-zinc-400 hover:text-white"
            title="Fechar menu lateral"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 1. NARRATIVA */}
        <button
          onClick={() => {
            soundEngine.playCardFlip();
            onOpenNarrative();
            setIsOpen(false);
          }}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-[#2a0d05] to-[#120502] hover:from-[#421408] hover:to-[#1f0904] border border-red-500/50 text-amber-100 text-[11px] font-serif font-bold uppercase tracking-wider transition-all shadow-md group active:scale-95"
        >
          <BookOpen className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform shrink-0" />
          <span className="truncate">Narrativa</span>
          {hasUnreadNarrative && (
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse ml-auto shrink-0" />
          )}
        </button>

        {/* 2. EVIDÊNCIAS */}
        <button
          onClick={() => {
            soundEngine.playCardFlip();
            onOpenEvidence();
            setIsOpen(false);
          }}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-[#0a1824] to-[#040b12] hover:from-[#11273b] hover:to-[#0a1520] border border-sky-500/50 text-sky-100 text-[11px] font-serif font-bold uppercase tracking-wider transition-all shadow-md group active:scale-95"
        >
          <Search className="w-3.5 h-3.5 text-sky-300 group-hover:scale-110 transition-transform shrink-0" />
          <span className="truncate">Evidências</span>
        </button>

        {/* 3. EVENTOS */}
        <button
          onClick={() => {
            soundEngine.playCardFlip();
            onOpenEvents();
            setIsOpen(false);
          }}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-[#240808] to-[#100303] hover:from-[#3b0d0d] hover:to-[#1a0505] border border-orange-500/50 text-orange-100 text-[11px] font-serif font-bold uppercase tracking-wider transition-all shadow-md group active:scale-95"
        >
          <Flame className="w-3.5 h-3.5 text-orange-400 group-hover:scale-110 transition-transform shrink-0" />
          <span className="truncate">Eventos</span>
          {hasActiveEvent && (
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping ml-auto shrink-0" />
          )}
        </button>

        {/* 4. HABILIDADES */}
        <button
          onClick={() => {
            soundEngine.playCardFlip();
            onOpenAbilities();
            setIsOpen(false);
          }}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-[#061810] to-[#020b07] hover:from-[#0d2a1c] hover:to-[#05150e] border border-emerald-500/50 text-emerald-100 text-[11px] font-serif font-bold uppercase tracking-wider transition-all shadow-md group active:scale-95"
        >
          <Shield className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform shrink-0" />
          <span className="truncate">Habilidades</span>
          {hasActiveAbility && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping ml-auto shrink-0" />
          )}
        </button>

        {/* 5. CHAT & SUSSURROS */}
        <button
          onClick={() => {
            soundEngine.playCardFlip();
            onOpenChat();
            setIsOpen(false);
          }}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-[#1f0b24] to-[#0d0410] hover:from-[#301238] hover:to-[#16071c] border border-purple-500/50 text-purple-100 text-[11px] font-serif font-bold uppercase tracking-wider transition-all shadow-md group active:scale-95"
        >
          <MessageSquare className="w-3.5 h-3.5 text-purple-300 group-hover:scale-110 transition-transform shrink-0" />
          <span className="truncate">Chat & Sussurro</span>
          {hasUnreadChat && (
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse ml-auto shrink-0" />
          )}
        </button>

        {/* 6. CARTAS DOS JOGADORES */}
        <button
          onClick={() => {
            soundEngine.playCardFlip();
            onOpenCards();
            setIsOpen(false);
          }}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-[#241706] to-[#100a02] hover:from-[#3b260a] hover:to-[#1a1003] border border-amber-500/50 text-amber-100 text-[11px] font-serif font-bold uppercase tracking-wider transition-all shadow-md group active:scale-95"
        >
          <Layers className="w-3.5 h-3.5 text-amber-300 group-hover:scale-110 transition-transform shrink-0" />
          <span className="truncate">Cartas de Todos</span>
        </button>

        {/* Divider */}
        <div className="h-[1px] bg-amber-500/20 my-0.5" />

        {/* 7. GUIA DE PERGUNTAS */}
        <button
          onClick={() => {
            soundEngine.playClick();
            onOpenQuestions();
            setIsOpen(false);
          }}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-black/60 hover:bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white text-[10.5px] font-serif transition-all active:scale-95"
        >
          <HelpCircle className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
          <span className="truncate">Guia de Perguntas</span>
        </button>

        {/* 8. REGRAS & CÓDICE */}
        <button
          onClick={() => {
            soundEngine.playClick();
            onOpenRules();
            setIsOpen(false);
          }}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-black/60 hover:bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white text-[10.5px] font-serif transition-all active:scale-95"
        >
          <Book className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <span className="truncate">Regras do Jogo</span>
        </button>
      </div>
    </div>
  );
};
