import React, { useState, useEffect, useRef } from 'react';
import { CardMethod, CardObject, CardEvidence, CardEvent, CardAbility, MarkerColor } from '../types/game';
import { MARKER_INFOS, SecretRoleData } from '../data/gameData';
import { Skull, Eye, Search, Sparkles, AlertTriangle, Shield, Check, Feather, Key, Book, Flame, FlaskRound as Flask, Disc, Sparkle, ShieldAlert, Zap, Upload, EyeOff } from 'lucide-react';
import { GothicWaxSeal } from './GothicWaxSeal';
import {
  MethodIllustration,
  ObjectIllustration,
  EvidenceIllustration,
  EventIllustration,
  AbilityIllustration,
  CharacterRoleIllustration,
} from './CardIllustrations';
export {
  MethodIllustration,
  ObjectIllustration,
  EvidenceIllustration,
  EventIllustration,
  AbilityIllustration,
  CharacterRoleIllustration,
};
import { getActiveCardFrame, CardFrameDefinition } from '../utils/progression';
import { useCustomCardArt, promptCardArtUpload, markCardArtFailed } from '../utils/customCardArt';
import { GothicCardFrameOverlay } from './GothicCardFrameOverlay';

export function useDoubleTapUpload(cardId: string, cardName?: string, aliases?: string[]) {
  const lastTapRef = useRef<number>(0);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    promptCardArtUpload(cardId, { name: cardName || cardId, aliases });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const now = Date.now();
    if (now - lastTapRef.current < 350) {
      e.stopPropagation();
      promptCardArtUpload(cardId, { name: cardName || cardId, aliases });
    }
    lastTapRef.current = now;
  };

  return { onDoubleClick: handleDoubleClick, onTouchEnd: handleTouchEnd };
}

/* =========================================================================
   CARD FRAME HOOK
   ========================================================================= */

function useCardFrame(customFrameId?: string): CardFrameDefinition {
  const [frame, setFrame] = useState<CardFrameDefinition>(() => getActiveCardFrame());

  useEffect(() => {
    const handleUpdate = () => {
      setFrame(getActiveCardFrame());
    };
    window.addEventListener('codice_progression_updated', handleUpdate);
    return () => window.removeEventListener('codice_progression_updated', handleUpdate);
  }, []);

  return frame;
}

/* =========================================================================
   CATEGORY ICONS & EMBLEMS HELPER
   ========================================================================= */

const getCategoryIcon = (category: string, isObject: boolean = false) => {
  const cat = category.toLowerCase();
  if (isObject) {
    if (cat.includes('decor') || cat.includes('arte')) return <Feather className="w-3 h-3 text-sky-400" />;
    if (cat.includes('instrum') || cat.includes('ferram')) return <Key className="w-3 h-3 text-amber-400" />;
    if (cat.includes('docum') || cat.includes('livro')) return <Book className="w-3 h-3 text-amber-300" />;
    if (cat.includes('ilum') || cat.includes('vela')) return <Flame className="w-3 h-3 text-orange-400" />;
    if (cat.includes('recip') || cat.includes('frasco')) return <Flask className="w-3 h-3 text-cyan-400" />;
    if (cat.includes('têxt') || cat.includes('corda')) return <Disc className="w-3 h-3 text-rose-400" />;
    return <Sparkle className="w-3 h-3 text-amber-400" />;
  } else {
    if (cat.includes('ambien')) return <span className="text-[10px]">🍃</span>;
    if (cat.includes('quím')) return <Flask className="w-3 h-3 text-rose-400" />;
    if (cat.includes('físic')) return <span className="text-[10px]">🗡️</span>;
    if (cat.includes('mecân')) return <span className="text-[10px]">⚡</span>;
    if (cat.includes('psicol')) return <Eye className="w-3 h-3 text-purple-400" />;
    return <Skull className="w-3 h-3 text-rose-400" />;
  }
};

/* =========================================================================
   1. METHOD CARD COMPONENT (FAITHFUL TO M22 CHOQUE TÉRMICO IMAGE)
   ========================================================================= */

interface MethodCardProps {
  method: CardMethod;
  isSelected?: boolean;
  isSolution?: boolean;
  onClick?: () => void;
  badge?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const MethodCard: React.FC<MethodCardProps> = ({
  method,
  isSelected,
  isSolution,
  onClick,
  badge,
  size = 'md',
}) => {
  const frame = useCardFrame();
  const customArt = useCustomCardArt(method.id);
  const doubleTap = useDoubleTapUpload(method.id, `Método ${method.id} - ${method.name}`);

  // If custom PNG is uploaded/linked, render the FULL CARD DIV with the custom PNG
  if (customArt) {
    return (
      <div
        onClick={onClick}
        onDoubleClick={doubleTap.onDoubleClick}
        onTouchEnd={doubleTap.onTouchEnd}
        title="Duplo clique para vincular nova imagem"
        className={`relative group cursor-pointer transition-all duration-300 select-none rounded-xl overflow-hidden shadow-2xl flex flex-col justify-between ${
          size === 'sm'
            ? 'w-28 sm:w-32 aspect-[2/3.1]'
            : size === 'lg'
            ? 'w-[280px] sm:w-[320px] md:w-[360px] aspect-[2/3.1]'
            : 'w-full max-w-[240px] sm:max-w-[260px] aspect-[2/3.1]'
        } ${
          isSelected
            ? 'ring-4 ring-red-400 scale-[1.02] border-2 border-red-400 shadow-[0_0_24px_rgba(239,68,68,0.85)]'
            : isSolution
            ? 'ring-4 ring-amber-400 scale-[1.02] border-2 border-amber-300 shadow-[0_0_24px_rgba(245,158,11,0.85)]'
            : `border-2 hover:border-red-400/80 shadow-black/90 ${frame.themeClass}`
        }`}
        style={!isSelected && !isSolution ? { borderColor: frame.borderColor } : undefined}
      >
        {/* Full Card Custom PNG occupying 100% of the div */}
        <img
          src={customArt}
          alt={method.name}
          onError={() => markCardArtFailed(method.id)}
          className="absolute inset-0 w-full h-full object-cover object-center rounded-xl z-0"
        />

        {/* Ornate Gothic Card Frame Overlay (Transparent Center) */}
        <GothicCardFrameOverlay frameId={frame.id} borderColor={!isSelected && !isSolution ? frame.borderColor : undefined} />

        {badge && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
            <span className="text-[8px] font-mono font-bold text-amber-300 bg-black/90 backdrop-blur-xs px-2 py-0.5 rounded border border-amber-500/60 shadow-lg whitespace-nowrap">
              {badge}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      onDoubleClick={doubleTap.onDoubleClick}
      onTouchEnd={doubleTap.onTouchEnd}
      title="Duplo clique para vincular nova imagem"
      className={`relative group cursor-pointer transition-all duration-300 select-none rounded-xl flex flex-col justify-between overflow-hidden shadow-2xl bg-black/95 ${
        size === 'sm'
          ? 'w-28 sm:w-32 aspect-[2/3.1] p-1.5'
          : size === 'lg'
          ? 'w-[280px] sm:w-[320px] md:w-[360px] aspect-[2/3.1] p-3.5 sm:p-4'
          : 'w-full max-w-[240px] sm:max-w-[260px] aspect-[2/3.1] p-2.5 sm:p-3'
      } ${
        isSelected
          ? 'ring-3 ring-red-400 scale-[1.02] border border-red-400 shadow-[0_0_24px_rgba(239,68,68,0.7)]'
          : isSolution
          ? 'ring-3 ring-amber-400 scale-[1.02] border border-amber-300 shadow-[0_0_24px_rgba(245,158,11,0.7)]'
          : `border hover:border-red-400/80 shadow-black/90 ${frame.themeClass}`
      }`}
      style={!isSelected && !isSolution ? { borderColor: frame.borderColor } : undefined}
    >
      {/* Ornate Gothic Card Frame Overlay (Transparent Center) */}
      <GothicCardFrameOverlay frameId={frame.id} borderColor={!isSelected && !isSolution ? frame.borderColor : undefined} />

      {/* TOP HEADER SECTION */}
      <div className="relative z-10 flex flex-col gap-0.5 shrink-0">
        {/* Top Category Crest */}
        <div className="flex items-center justify-between px-0.5">
          {/* Category Medallion & Label Pill */}
          <div className="flex items-center gap-1 bg-black/70 px-1.5 py-0.5 rounded-full border border-emerald-500/40 shadow-inner">
            <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-b from-emerald-700 to-black flex items-center justify-center border border-emerald-400/70 shrink-0">
              {getCategoryIcon(method.category, false)}
            </div>
            <span className="text-[7.5px] font-serif font-black text-emerald-300 uppercase tracking-wider truncate max-w-[90px]">
              {method.category}
            </span>
          </div>
        </div>

        {/* Title */}
        <div className="text-center px-0.5 pt-0.5">
          <h3 className="text-[10px] sm:text-xs font-serif font-black text-[#f3e5d3] uppercase tracking-wider leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] truncate group-hover:text-red-200 transition-colors">
            {method.name}
          </h3>
        </div>
      </div>

      {/* CENTRAL GOTHIC ARTWORK CONTAINER */}
      <div className="relative z-10 flex-1 my-1 rounded-md overflow-hidden border border-amber-500/40 bg-black/90 shadow-inner flex items-center justify-center min-h-0">
        {/* Try to load default image from public folder first, fallback to SVG illustration */}
        <img
          src={`/metodos/${method.id}.jpg`}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-100"
          onError={(e) => {
            // If .jpg fails, try .png (some files are png in your public folder)
            const target = e.target as HTMLImageElement;
            if (target.src.endsWith('.jpg')) {
              target.src = `/metodos/${method.id}.png`;
            } else {
              target.style.display = 'none';
            }
          }}
        />
        <MethodIllustration id={method.id} category={method.category} name={method.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />
        <div className="absolute inset-0 border border-white/10 rounded-md pointer-events-none" />
      </div>

      {/* BOTTOM SECTION: ORNATE CARTOUCHE PLAQUE ("MÉTODO") & RUBY JEWEL */}
      <div className="relative z-10 flex flex-col items-center pt-0.5 shrink-0">
        <div className={`w-full py-0.5 px-2 rounded bg-gradient-to-r ${frame.badgeBg} border border-amber-500/60 shadow-md flex items-center justify-center relative`}>
          <div className="absolute left-1 w-1 h-1 rotate-45 bg-amber-400" />
          <div className="absolute right-1 w-1 h-1 rotate-45 bg-amber-400" />
          <span className="text-[8.5px] font-serif font-black tracking-[0.25em] text-[#eedec5] uppercase drop-shadow">
            MÉTODO
          </span>
        </div>

        {/* Ruby Jewel at Bottom Center */}
        <div className={`-mt-1 w-2.5 h-2.5 rotate-45 rounded-xs bg-gradient-to-br ${frame.jewelGradient} border border-amber-300 shadow-[0_0_6px_#ef4444] z-20`} />

        {badge && (
          <span className="mt-0.5 text-[7px] font-mono font-bold text-amber-300 bg-black/80 px-1.5 py-0.2 rounded border border-amber-500/40">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
};

/* =========================================================================
   2. OBJECT CARD COMPONENT (FAITHFUL TO REFERENCE OBJECT CARD)
   ========================================================================= */

interface ObjectCardProps {
  object: CardObject;
  isSelected?: boolean;
  isSolution?: boolean;
  onClick?: () => void;
  badge?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ObjectCard: React.FC<ObjectCardProps> = ({
  object,
  isSelected,
  isSolution,
  onClick,
  badge,
  size = 'md',
}) => {
  const frame = useCardFrame();
  const customArt = useCustomCardArt(object.id);
  const doubleTap = useDoubleTapUpload(object.id, `Objeto ${object.id} - ${object.name}`);

  // If custom PNG is uploaded/linked, render the FULL CARD DIV with the custom PNG
  if (customArt) {
    return (
      <div
        onClick={onClick}
        onDoubleClick={doubleTap.onDoubleClick}
        onTouchEnd={doubleTap.onTouchEnd}
        title="Duplo clique para vincular nova imagem"
        className={`relative group cursor-pointer transition-all duration-300 select-none rounded-xl overflow-hidden shadow-2xl flex flex-col justify-between ${
          size === 'sm'
            ? 'w-28 sm:w-32 aspect-[2/3.1]'
            : size === 'lg'
            ? 'w-[280px] sm:w-[320px] md:w-[360px] aspect-[2/3.1]'
            : 'w-full max-w-[240px] sm:max-w-[260px] aspect-[2/3.1]'
        } ${
          isSelected
            ? 'ring-4 ring-sky-400 scale-[1.02] border-2 border-sky-400 shadow-[0_0_24px_rgba(56,189,248,0.85)]'
            : isSolution
            ? 'ring-4 ring-amber-400 scale-[1.02] border-2 border-amber-300 shadow-[0_0_24px_rgba(245,158,11,0.85)]'
            : `border-2 hover:border-amber-400/80 shadow-black/90 ${frame.themeClass}`
        }`}
        style={!isSelected && !isSolution ? { borderColor: frame.borderColor } : undefined}
      >
        {/* Full Card Custom PNG occupying 100% of the div */}
        <img
          src={customArt}
          alt={object.name}
          onError={() => markCardArtFailed(object.id)}
          className="absolute inset-0 w-full h-full object-cover object-center rounded-xl z-0"
        />

        {/* Ornate Gothic Card Frame Overlay (Transparent Center) */}
        <GothicCardFrameOverlay frameId={frame.id} borderColor={!isSelected && !isSolution ? frame.borderColor : undefined} />

        {badge && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
            <span className="text-[8px] font-mono font-bold text-amber-300 bg-black/90 backdrop-blur-xs px-2 py-0.5 rounded border border-amber-500/60 shadow-lg whitespace-nowrap">
              {badge}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      onDoubleClick={doubleTap.onDoubleClick}
      onTouchEnd={doubleTap.onTouchEnd}
      title="Duplo clique para vincular nova imagem"
      className={`relative group cursor-pointer transition-all duration-300 select-none rounded-xl flex flex-col justify-between overflow-hidden shadow-2xl bg-black/95 ${
        size === 'sm'
          ? 'w-28 sm:w-32 aspect-[2/3.1] p-1.5'
          : size === 'lg'
          ? 'w-[280px] sm:w-[320px] md:w-[360px] aspect-[2/3.1] p-3.5 sm:p-4'
          : 'w-full max-w-[240px] sm:max-w-[260px] aspect-[2/3.1] p-2.5 sm:p-3'
      } ${
        isSelected
          ? 'ring-3 ring-sky-400 scale-[1.02] border border-sky-400 shadow-[0_0_24px_rgba(56,189,248,0.7)]'
          : isSolution
          ? 'ring-3 ring-amber-400 scale-[1.02] border border-amber-300 shadow-[0_0_24px_rgba(245,158,11,0.7)]'
          : `border hover:border-amber-400/80 shadow-black/90 ${frame.themeClass}`
      }`}
      style={!isSelected && !isSolution ? { borderColor: frame.borderColor } : undefined}
    >
      {/* Ornate Gothic Card Frame Overlay (Transparent Center) */}
      <GothicCardFrameOverlay frameId={frame.id} borderColor={!isSelected && !isSolution ? frame.borderColor : undefined} />

      {/* TOP HEADER SECTION */}
      <div className="relative z-10 flex flex-col gap-0.5 shrink-0">
        {/* Top Category Crest */}
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-1 bg-black/70 px-1.5 py-0.5 rounded-full border border-sky-500/40 shadow-inner">
            <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-b from-sky-700 to-black flex items-center justify-center border border-sky-400/70 shrink-0">
              {getCategoryIcon(object.category, true)}
            </div>
            <span className="text-[7.5px] font-serif font-black text-amber-200 uppercase tracking-wider truncate max-w-[90px]">
              {object.category}
            </span>
          </div>
        </div>

        {/* Title */}
        <div className="text-center px-0.5 pt-0.5">
          <h3 className="text-[10px] sm:text-xs font-serif font-black text-[#f3e5d3] uppercase tracking-wider leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] truncate group-hover:text-amber-200 transition-colors">
            {object.name}
          </h3>
        </div>
      </div>

      {/* CENTRAL GOTHIC ARTWORK CONTAINER */}
      <div className="relative z-10 flex-1 my-1 rounded-md overflow-hidden border border-amber-500/40 bg-black/90 shadow-inner flex items-center justify-center min-h-0">
        <img
          src={`/objetos/${object.id}.jpg`}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-100"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (target.src.endsWith('.jpg')) {
              target.src = `/objetos/${object.id}.png`;
            } else {
              target.style.display = 'none';
            }
          }}
        />
        <ObjectIllustration id={object.id} category={object.category} name={object.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />
        <div className="absolute inset-0 border border-white/10 rounded-md pointer-events-none" />
      </div>

      {/* BOTTOM SECTION: ORNATE CARTOUCHE PLAQUE ("OBJETO") & SKULL CREST */}
      <div className="relative z-10 flex flex-col items-center pt-0.5 shrink-0">
        <div className={`w-full py-0.5 px-2 rounded bg-gradient-to-r ${frame.badgeBg} border border-amber-500/60 shadow-md flex items-center justify-center relative`}>
          <div className="absolute left-1 w-1 h-1 rotate-45 bg-amber-400" />
          <div className="absolute right-1 w-1 h-1 rotate-45 bg-amber-400" />
          <span className="text-[8.5px] font-serif font-black tracking-[0.25em] text-[#eedec5] uppercase drop-shadow flex items-center gap-1">
            <Skull className="w-2.5 h-2.5 text-amber-300" />
            OBJETO
          </span>
        </div>

        {/* Amber Gemstone at Bottom Center */}
        <div className={`-mt-1 w-2.5 h-2.5 rotate-45 rounded-xs bg-gradient-to-br ${frame.jewelGradient} border border-amber-200 shadow-[0_0_6px_#f59e0b] z-20`} />

        {badge && (
          <span className="mt-0.5 text-[7px] font-mono font-bold text-amber-300 bg-black/80 px-1.5 py-0.2 rounded border border-amber-500/40">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
};


/* =========================================================================
   3. EVIDENCE CARD COMPONENT
   ========================================================================= */

interface EvidenceCardProps {
  evidence: CardEvidence;
  isOracleInteractive?: boolean;
  selectedColor?: MarkerColor;
  onOptionClick?: (optionIdx: number) => void;
  onDoubleClickCard?: () => void;
  isDiscarded?: boolean;
}

// Geometric coordinates for the 6 option slots and circular marker rings on the Evidence card PNG
export const EVIDENCE_CARD_SLOTS = [
  // Row 0: Top row (options 0, 1, 2) - Text at top (59-66%), Circle socket center at 73.0%
  { left: '6.0%', top: '58.0%', width: '28.8%', height: '17.2%', circleX: '20.4%', circleY: '73.0%' },
  { left: '35.6%', top: '58.0%', width: '28.8%', height: '17.2%', circleX: '50.0%', circleY: '73.0%' },
  { left: '65.2%', top: '58.0%', width: '28.8%', height: '17.2%', circleX: '79.6%', circleY: '73.0%' },
  // Row 1: Bottom row (options 3, 4, 5) - Text at top (77-84%), Circle socket center at 90.2%
  { left: '6.0%', top: '76.0%', width: '28.8%', height: '17.2%', circleX: '20.4%', circleY: '90.2%' },
  { left: '35.6%', top: '76.0%', width: '28.8%', height: '17.2%', circleX: '50.0%', circleY: '90.2%' },
  { left: '65.2%', top: '76.0%', width: '28.8%', height: '17.2%', circleX: '79.6%', circleY: '90.2%' },
];

export const EvidenceCard: React.FC<EvidenceCardProps> = ({
  evidence,
  isOracleInteractive,
  onOptionClick,
  onDoubleClickCard,
  isDiscarded,
}) => {
  const isConcealed = Boolean(evidence.isConcealed);
  const isCardMarked = evidence.markedOptionIndex !== undefined && evidence.markedColor !== undefined;
  const showVisualMarkers = isCardMarked && !isConcealed;
  const activeMarkerInfo = showVisualMarkers && evidence.markedColor ? MARKER_INFOS[evidence.markedColor] : null;
  const lookupIds = [
    evidence.id,
    `evidencia_${evidence.id}`,
    `evidence_${evidence.id}`,
    `evidencia_${evidence.id.toLowerCase()}`,
    evidence.id.toLowerCase(),
    `evidencia_${evidence.title.toLowerCase().replace(/\s+/g, '_')}`,
  ];
  const customArt = useCustomCardArt(lookupIds);
  const doubleTap = useDoubleTapUpload(evidence.id, `Evidência ${evidence.id} - ${evidence.title}`, lookupIds);
  const lastTouchRef = useRef<number>(0);

  const handleCardDoubleClick = (e: React.MouseEvent) => {
    if (onDoubleClickCard) {
      e.stopPropagation();
      onDoubleClickCard();
      return;
    }
    if (isOracleInteractive && onOptionClick) {
      e.stopPropagation();
      onOptionClick(evidence.markedOptionIndex !== undefined ? evidence.markedOptionIndex : 0);
      return;
    }
    doubleTap.onDoubleClick(e);
  };

  const handleCardTouchEnd = (e: React.TouchEvent) => {
    const now = Date.now();
    if (now - lastTouchRef.current < 350) {
      if (onDoubleClickCard) {
        e.stopPropagation();
        onDoubleClickCard();
        return;
      }
      if (isOracleInteractive && onOptionClick) {
        e.stopPropagation();
        onOptionClick(evidence.markedOptionIndex !== undefined ? evidence.markedOptionIndex : 0);
        return;
      }
    }
    lastTouchRef.current = now;
    doubleTap.onTouchEnd(e);
  };

  // If custom PNG is linked/uploaded, render full-bleed card div with pixel-perfect clickable sockets
  if (customArt) {
    return (
      <div
        onDoubleClick={handleCardDoubleClick}
        onTouchEnd={handleCardTouchEnd}
        title={
          isOracleInteractive
            ? 'Toque duplo para alocar selo do Oráculo nesta evidência'
            : isConcealed
            ? 'Evidência Ocultada - Marcadores desabilitados temporariamente pelo Evento'
            : 'Evidência'
        }
        className={`relative group transition-all duration-300 select-none rounded-2xl overflow-hidden shadow-2xl w-full max-w-[280px] mx-auto aspect-[2/3] ${
          isConcealed
            ? 'border-2 border-purple-900/80 ring-2 ring-purple-900/40 shadow-[0_0_24px_rgba(0,0,0,0.95)] opacity-95'
            : showVisualMarkers
            ? evidence.markedColor === 'vermelho'
              ? 'ring-3 ring-red-500/80 border-2 border-red-500 shadow-[0_0_24px_rgba(239,68,68,0.7)]'
              : evidence.markedColor === 'azul'
              ? 'ring-3 ring-sky-500/80 border-2 border-sky-400 shadow-[0_0_24px_rgba(56,189,248,0.7)]'
              : evidence.markedColor === 'dourado'
              ? 'ring-3 ring-amber-400/80 border-2 border-amber-300 shadow-[0_0_24px_rgba(245,158,11,0.7)]'
              : evidence.markedColor === 'cinza'
              ? 'ring-2 ring-gray-400/80 border border-gray-300 shadow-[0_0_16px_rgba(156,163,175,0.5)]'
              : 'ring-2 ring-zinc-200/80 border border-white shadow-[0_0_16px_rgba(255,255,255,0.4)]'
            : 'border-2 border-[#1a3150] hover:border-sky-400/80 shadow-black/90'
        }`}
      >
        {/* Full Card Custom PNG occupying 100% of the div with exact 2:3 aspect ratio */}
        <img
          src={customArt}
          alt={evidence.title}
          onError={() => markCardArtFailed(evidence.id)}
          className="absolute inset-0 w-full h-full object-cover object-center rounded-2xl z-0 pointer-events-none"
        />

        {/* Ornate Gothic Card Frame Overlay (Transparent Center) */}
        <GothicCardFrameOverlay frameId="frame_azul_petroleo" borderColor="#0284c7" />

        {/* DARK CONCEALMENT SHROUD OVERLAY WHEN CONCEALED */}
        {isConcealed && (
          <div className="absolute inset-0 z-15 bg-black/75 backdrop-blur-[1.5px] flex flex-col items-center justify-center p-3 text-center pointer-events-none select-none">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-purple-950/90 border border-purple-500/70 flex items-center justify-center mb-1.5 shadow-[0_0_16px_rgba(168,85,247,0.6)] animate-pulse">
              <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 text-purple-300" />
            </div>
            <span className="text-[9px] sm:text-[10px] font-serif font-black text-purple-200 uppercase tracking-widest drop-shadow">
              EVIDÊNCIA OCULTADA
            </span>
            <span className="text-[7.5px] sm:text-[8px] font-mono text-zinc-400 mt-1 leading-tight max-w-[90%]">
              {evidence.concealedReason ? `Sob efeito do ${evidence.concealedReason}` : 'Marcadores desabilitados temporariamente'}
            </span>
          </div>
        )}

        {/* DISCARDED STAMP BADGE */}
        {isDiscarded && (
          <div className="absolute top-2.5 right-2.5 z-20 pointer-events-none">
            <span className="text-[8.5px] font-mono font-bold text-red-300 bg-red-950/95 px-2 py-0.5 rounded border border-red-500/70 shadow-lg tracking-wider">
              DESCARTADA
            </span>
          </div>
        )}

        {/* 6 PIXEL-PERFECT CLICKABLE OPTION ZONES */}
        {evidence.options.map((option, idx) => {
          const slot = EVIDENCE_CARD_SLOTS[idx] || EVIDENCE_CARD_SLOTS[0];
          const isMarked = showVisualMarkers && evidence.markedOptionIndex === idx;

          return (
            <button
              key={idx}
              type="button"
              disabled={isConcealed}
              onClick={(e) => {
                e.stopPropagation();
                if (!isConcealed && isOracleInteractive && onOptionClick) {
                  onOptionClick(idx);
                }
              }}
              title={
                isConcealed
                  ? 'Evidência Ocultada - Marcadores desabilitados temporariamente'
                  : isOracleInteractive
                  ? `${option}: Clique para posicionar o selo do Oráculo`
                  : option
              }
              style={{
                position: 'absolute',
                left: slot.left,
                top: slot.top,
                width: slot.width,
                height: slot.height,
              }}
              className={`z-10 rounded-lg transition-all duration-200 select-none group/slot flex items-center justify-center ${
                isConcealed
                  ? 'cursor-not-allowed'
                  : isOracleInteractive
                  ? 'cursor-pointer hover:bg-sky-400/10 active:scale-95'
                  : 'cursor-default'
              }`}
            >
              {/* Interactive Target Reticle on Hover in Oracle Mode */}
              {!isMarked && !isConcealed && isOracleInteractive && (
                <div className="absolute w-[44%] aspect-square rounded-full border border-sky-400/0 group-hover/slot:border-sky-400/80 group-hover/slot:bg-sky-400/20 group-hover/slot:shadow-[0_0_10px_rgba(56,189,248,0.6)] transition-all pointer-events-none top-[58%] -translate-y-1/2" />
              )}
            </button>
          );
        })}

        {/* GOTHIC WAX SEAL ORACULAR MARKER (Hidden dynamically during concealment events) */}
        {evidence.options.map((option, idx) => {
          const slot = EVIDENCE_CARD_SLOTS[idx] || EVIDENCE_CARD_SLOTS[0];
          const isMarked = evidence.markedOptionIndex === idx;
          if (!isMarked || !showVisualMarkers) return null;
          const color = evidence.markedColor || 'dourado';

          const posX = evidence.markerX !== undefined ? `${evidence.markerX}%` : slot.circleX;
          const posY = evidence.markerY !== undefined ? `${evidence.markerY}%` : slot.circleY;

          return (
            <div
              key={`marker-${idx}`}
              style={{
                position: 'absolute',
                left: posX,
                top: posY,
                transform: 'translate(-50%, -50%)',
              }}
              className="z-20 w-[12.5%] aspect-square pointer-events-none animate-scale-up drop-shadow-2xl"
            >
              <GothicWaxSeal color={color} size="custom" glow pulse />
            </div>
          );
        })}

        {/* ACTIVE MARKER CLUE LABEL PILL AT BOTTOM OR CONCEALMENT BADGE */}
        {showVisualMarkers && activeMarkerInfo && (
          <div className="absolute bottom-1.5 sm:bottom-2 inset-x-1.5 sm:inset-x-2 z-20 flex justify-center pointer-events-none">
            <span
              className={`text-[7px] sm:text-[8px] font-serif font-bold bg-black/95 backdrop-blur-xs px-2 sm:px-2.5 py-0.5 rounded-full border shadow-xl flex items-center gap-1 sm:gap-1.5 truncate max-w-[96%] ${
                evidence.markedColor === 'vermelho'
                  ? 'text-red-200 border-red-500/80 shadow-[0_0_12px_rgba(239,68,68,0.5)]'
                  : evidence.markedColor === 'azul'
                  ? 'text-sky-200 border-sky-400/80 shadow-[0_0_12px_rgba(56,189,248,0.5)]'
                  : evidence.markedColor === 'dourado'
                  ? 'text-amber-200 border-amber-400/80 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                  : evidence.markedColor === 'cinza'
                  ? 'text-gray-200 border-gray-400/80 shadow-[0_0_10px_rgba(156,163,175,0.4)]'
                  : 'text-zinc-200 border-zinc-400/80 shadow-[0_0_10px_rgba(255,255,255,0.25)]'
              }`}
            >
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0 shadow-sm"
                style={{ backgroundColor: activeMarkerInfo.hex }}
              />
              <span className="font-extrabold uppercase tracking-wide">
                {evidence.options[evidence.markedOptionIndex!]}
              </span>
              <span className="opacity-40 font-normal">•</span>
              <span className="font-semibold text-white">
                {activeMarkerInfo.name}
              </span>
              <span className="text-[6.5px] sm:text-[7.5px] font-sans font-normal opacity-90 text-amber-200/90">
                ({activeMarkerInfo.shortRole || activeMarkerInfo.meaning})
              </span>
            </span>
          </div>
        )}

        {isConcealed && (
          <div className="absolute bottom-1.5 sm:bottom-2 inset-x-1.5 sm:inset-x-2 z-20 flex justify-center pointer-events-none">
            <span className="text-[7.5px] sm:text-[8px] font-serif font-black bg-black/95 px-2.5 py-0.5 rounded-full border border-purple-500/70 text-purple-300 shadow-[0_0_14px_rgba(168,85,247,0.5)] flex items-center gap-1.5 uppercase tracking-wider animate-pulse">
              <EyeOff className="w-3 h-3 text-purple-400 shrink-0" />
              <span className="truncate">Marcador Ocultado pelo Evento</span>
            </span>
          </div>
        )}
      </div>
    );
  }

  // Procedural Gothic Fallback when no custom PNG is uploaded
  return (
    <div
      onDoubleClick={handleCardDoubleClick}
      onTouchEnd={handleCardTouchEnd}
      title={
        isOracleInteractive
          ? 'Toque duplo para alocar selo do Oráculo nesta evidência'
          : isConcealed
          ? 'Evidência Ocultada - Marcadores desabilitados temporariamente pelo Evento'
          : 'Evidência'
      }
      className={`relative rounded-2xl p-2.5 sm:p-3 bg-gradient-to-b from-[#0c1320] via-[#050912] to-[#04070e] border-2 transition-all flex flex-col justify-between overflow-hidden w-full max-w-[280px] mx-auto aspect-[2/3] shadow-2xl ${
      isConcealed
        ? 'border-purple-900/80 ring-2 ring-purple-900/40 shadow-[0_0_24px_rgba(0,0,0,0.95)] opacity-95'
        : showVisualMarkers
        ? evidence.markedColor === 'vermelho'
          ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.45)]'
          : evidence.markedColor === 'azul'
          ? 'border-sky-500 shadow-[0_0_20px_rgba(56,189,248,0.45)]'
          : evidence.markedColor === 'dourado'
          ? 'border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.45)]'
          : evidence.markedColor === 'cinza'
          ? 'border-gray-400 shadow-[0_0_16px_rgba(156,163,175,0.35)]'
          : 'border-zinc-400 shadow-[0_0_16px_rgba(255,255,255,0.25)]'
        : 'border-[#1a3150] hover:border-sky-400/70 shadow-black/90'
    }`}>
      {/* Ornate Gothic Card Frame Overlay (Transparent Center) */}
      <GothicCardFrameOverlay frameId="frame_azul_petroleo" borderColor="#0284c7" />

      {/* TOP HEADER: MEDALLION & TITLE ARCH */}
      <div className="relative z-10 flex items-center justify-between pb-1 border-b border-sky-900/50">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-5 h-5 rounded-full bg-gradient-to-b from-[#1a3354] to-[#081220] border border-sky-400/70 flex items-center justify-center shadow-md shrink-0">
            {isConcealed ? <EyeOff className="w-2.5 h-2.5 text-purple-400" /> : <Search className="w-2.5 h-2.5 text-sky-300" />}
          </div>
          <div className="min-w-0">
            <span className="text-[7.5px] font-mono font-bold tracking-[0.18em] text-sky-400 uppercase block">
              {isConcealed ? 'EVIDÊNCIA OCULTADA' : 'EVIDÊNCIA'}
            </span>
            <h3 className="text-[10.5px] sm:text-[11.5px] font-serif font-black text-[#f3e5d3] uppercase tracking-wider leading-tight truncate">
              {evidence.title}
            </h3>
          </div>
        </div>

        {isDiscarded && (
          <span className="text-[7.5px] font-mono font-bold text-red-300 bg-red-950/90 px-1.5 py-0.2 rounded border border-red-500/60 shrink-0">
            DESCARTADA
          </span>
        )}
      </div>

      {/* CENTRAL SCENE ILLUSTRATION */}
      <div className="relative z-10 flex-1 my-1 rounded-lg overflow-hidden border border-sky-500/30 bg-black/80 shadow-inner flex items-center justify-center min-h-0">
        <EvidenceIllustration id={evidence.id} title={evidence.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
        {isConcealed && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-[1px] flex flex-col items-center justify-center p-2 text-center pointer-events-none select-none">
            <EyeOff className="w-6 h-6 text-purple-400 mb-1 animate-pulse" />
            <span className="text-[8px] font-serif font-bold text-purple-200 uppercase tracking-wider">
              {evidence.concealedReason || 'Ocultação de Evidência'}
            </span>
            <span className="text-[6.5px] font-mono text-zinc-400 mt-0.5">
              Marcadores Ocultos
            </span>
          </div>
        )}
      </div>

      {/* 6 SLOTS INTERACTIVE GRID */}
      <div className="relative z-10 grid grid-cols-3 gap-1 my-0.5 w-full shrink-0">
        {evidence.options.map((option, idx) => {
          const isMarked = showVisualMarkers && evidence.markedOptionIndex === idx;
          const color = showVisualMarkers ? evidence.markedColor : undefined;

          return (
            <button
              type="button"
              key={idx}
              disabled={isConcealed}
              onClick={() => !isConcealed && isOracleInteractive && onOptionClick && onOptionClick(idx)}
              className={`p-1 min-h-[38px] rounded-lg border flex flex-col items-center justify-between text-center transition-all select-none w-full ${
                isConcealed
                  ? 'cursor-not-allowed opacity-60 bg-black/50 border-zinc-800 text-zinc-500'
                  : isOracleInteractive
                  ? 'cursor-pointer hover:scale-[1.02] active:scale-95'
                  : 'cursor-default'
              } ${
                isMarked
                  ? color === 'vermelho'
                    ? 'bg-red-950/90 border-red-500 text-white shadow-md shadow-red-950 ring-1 ring-red-400'
                    : color === 'azul'
                    ? 'bg-blue-950/90 border-sky-400 text-white shadow-md shadow-blue-950 ring-1 ring-sky-300'
                    : color === 'dourado'
                    ? 'bg-amber-950/90 border-amber-400 text-white shadow-md shadow-amber-950 ring-1 ring-amber-300'
                    : color === 'cinza'
                    ? 'bg-zinc-800 border-gray-400 text-white shadow-md ring-1 ring-gray-300'
                    : 'bg-zinc-900 border-zinc-400 text-white shadow-md ring-1 ring-white'
                  : isConcealed
                  ? 'bg-black/50 border-zinc-800/80 text-zinc-500'
                  : 'bg-black/60 border-sky-950/80 text-zinc-200 hover:border-sky-500/50 hover:bg-black/80'
              }`}
            >
              <span className="text-[8px] sm:text-[8.5px] font-serif font-bold uppercase tracking-wide leading-tight text-center px-0.5 break-words line-clamp-2 w-full">
                {option}
              </span>

              {/* Gothic Wax Seal Marker */}
              <div className="mt-0.5 flex items-center justify-center shrink-0">
                {isMarked && color ? (
                  <GothicWaxSeal color={color} size="xs" glow pulse />
                ) : (
                  <div className="w-2.5 h-2.5 rounded-full border border-sky-500/40 bg-black/70" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* SAPPHIRE GEMSTONE AT BOTTOM CENTER / ACTIVE MARKER LABEL */}
      <div className="relative z-10 flex flex-col items-center pt-0.5 border-t border-sky-950/70 shrink-0">
        {showVisualMarkers && activeMarkerInfo ? (
          <span
            className={`text-[7px] sm:text-[7.5px] font-serif font-bold bg-black/90 px-2 py-0.5 rounded-full border shadow flex items-center gap-1 max-w-[95%] truncate ${
              evidence.markedColor === 'vermelho'
                ? 'text-red-200 border-red-500/70 shadow-[0_0_8px_rgba(239,68,68,0.4)]'
                : evidence.markedColor === 'azul'
                ? 'text-sky-200 border-sky-400/70 shadow-[0_0_8px_rgba(56,189,248,0.4)]'
                : evidence.markedColor === 'dourado'
                ? 'text-amber-200 border-amber-400/70 shadow-[0_0_8px_rgba(245,158,11,0.4)]'
                : evidence.markedColor === 'cinza'
                ? 'text-gray-200 border-gray-400/70 shadow-[0_0_6px_rgba(156,163,175,0.3)]'
                : 'text-zinc-200 border-zinc-400/70'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: activeMarkerInfo.hex }} />
            <span className="uppercase font-bold">{evidence.options[evidence.markedOptionIndex!]}</span>
            <span className="opacity-40">•</span>
            <span className="font-semibold">{activeMarkerInfo.name}</span>
            <span className="text-[6.5px] font-sans font-normal text-amber-200/90">
              ({activeMarkerInfo.shortRole || activeMarkerInfo.meaning})
            </span>
          </span>
        ) : isConcealed ? (
          <span className="text-[7px] font-serif font-bold text-purple-300 flex items-center gap-1">
            <EyeOff className="w-2.5 h-2.5 text-purple-400" />
            <span>Marcador Ocultado</span>
          </span>
        ) : (
          <div className="w-2 h-2 rotate-45 rounded-xs bg-gradient-to-br from-sky-400 via-sky-600 to-sky-950 border border-sky-200 shadow-[0_0_6px_#38bdf8]" />
        )}
      </div>
    </div>
  );
};

/* =========================================================================
   4. EVENT CARD COMPONENT
   ========================================================================= */

export const EventCard: React.FC<{
  event: CardEvent;
  onAcknowledge?: () => void;
}> = ({
  event,
  onAcknowledge,
}) => {
  const lookupIds = [
    event.id,
    `evento_${event.id}`,
    `event_${event.id}`,
    event.id.toLowerCase(),
    `evento_${event.id.toLowerCase()}`,
    `evento_${event.name.toLowerCase().replace(/\s+/g, '_')}`,
  ];
  const customArt = useCustomCardArt(lookupIds);
  const doubleTap = useDoubleTapUpload(event.id, `Evento ${event.id} - ${event.name}`, lookupIds);
  const [showInfoBack, setShowInfoBack] = useState<boolean>(false);

  // When custom PNG is uploaded, display the pure card graphic cleanly without obstructing texts (already on the physical card)
  if (customArt) {
    return (
      <div
        onDoubleClick={doubleTap.onDoubleClick}
        onTouchEnd={doubleTap.onTouchEnd}
        title={`Evento: ${event.name} — "${event.effect}" (Duplo clique para trocar imagem)`}
        className="relative group transition-all duration-300 select-none rounded-xl overflow-hidden shadow-2xl w-full max-w-[240px] sm:max-w-[260px] mx-auto aspect-[2/3.1] border-2 border-red-500/70 hover:border-red-400 bg-black/95 flex flex-col justify-between"
      >
        {/* Full Card Custom PNG occupying 100% with exact aspect ratio */}
        <img
          src={customArt}
          alt={event.name}
          onError={() => markCardArtFailed(event.id)}
          className="absolute inset-0 w-full h-full object-cover object-center rounded-xl z-0 pointer-events-none"
        />

        {/* Gothic Corner Accents */}
        <div className="absolute top-1.5 left-1.5 w-2.5 h-2.5 border-t border-l border-red-400/80 pointer-events-none z-20" />
        <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 border-t border-r border-red-400/80 pointer-events-none z-20" />
        <div className="absolute bottom-1.5 left-1.5 w-2.5 h-2.5 border-b border-l border-red-400/80 pointer-events-none z-20" />
        <div className="absolute bottom-1.5 right-1.5 w-2.5 h-2.5 border-b border-r border-red-400/80 pointer-events-none z-20" />

        {/* Hidden Semantic Memory & Accessibility (Keeps all rules, text & mechanics safe in DOM/memory) */}
        <div className="sr-only" aria-hidden="false">
          <h4>{event.name}</h4>
          <p>{event.effect}</p>
          {event.duration && <p>Duração: {event.duration} segundos</p>}
        </div>

        {/* Optional Flip-to-Back toggle badge */}
        <div className="relative z-20 p-2 flex justify-between items-start opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowInfoBack(!showInfoBack);
            }}
            className="p-1 rounded-md bg-black/85 text-red-300 hover:text-white border border-red-500/50 shadow-md text-[9px] flex items-center gap-1 font-mono backdrop-blur-xs"
            title="Ver texto explicativo no verso"
          >
            <Book className="w-3 h-3 text-red-400" />
            <span>Verso</span>
          </button>
        </div>

        {/* Info Back Sheet (Shown only if user clicks 'Verso') */}
        {showInfoBack && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              setShowInfoBack(false);
            }}
            className="absolute inset-0 z-30 bg-black/95 p-3 flex flex-col justify-between border-2 border-red-500/80 text-zinc-100 animate-fade-in backdrop-blur-md"
          >
            <div className="flex items-center justify-between border-b border-red-900/60 pb-1.5">
              <span className="text-[8px] font-mono font-bold text-red-400 uppercase tracking-wider">EVENTO #{event.id}</span>
              <button
                type="button"
                onClick={() => setShowInfoBack(false)}
                className="text-zinc-400 hover:text-white text-xs px-1"
              >
                ✕
              </button>
            </div>
            <div className="my-auto text-center px-1">
              <h4 className="text-xs font-serif font-black text-amber-200 uppercase mb-2">{event.name}</h4>
              <p className="text-[10px] font-serif italic text-zinc-200 leading-relaxed bg-red-950/40 p-2 rounded-lg border border-red-500/30">
                "{event.effect}"
              </p>
              {event.duration && (
                <p className="text-[9px] font-mono text-red-400 mt-2 font-bold">
                  Duração: {event.duration}s
                </p>
              )}
            </div>
            <div className="text-[8px] font-mono text-zinc-400 text-center">Toque para voltar à arte</div>
          </div>
        )}

        {/* Bottom Action Button if required */}
        {onAcknowledge && (
          <div className="relative z-20 p-2 pointer-events-auto">
            <button
              onClick={onAcknowledge}
              className="w-full py-1.5 rounded-lg bg-red-800/95 hover:bg-red-700 text-white font-serif font-bold text-[9.5px] uppercase tracking-wider transition-all border border-red-400 shadow-xl"
            >
              Compreendido
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      onDoubleClick={doubleTap.onDoubleClick}
      onTouchEnd={doubleTap.onTouchEnd}
      title="Duplo clique para vincular nova imagem"
      className="relative rounded-2xl p-2.5 sm:p-3 bg-gradient-to-b from-[#200606] via-[#0d0202] to-[#1a0505] border-2 border-red-500/60 text-zinc-100 max-w-sm w-full shadow-2xl flex flex-col justify-between"
    >
      {/* Gothic Filigree Corner Accents */}
      <div className="absolute top-1.5 left-1.5 w-2.5 h-2.5 border-t border-l border-red-400/70 pointer-events-none" />
      <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 border-t border-r border-red-400/70 pointer-events-none" />
      <div className="absolute bottom-1.5 left-1.5 w-2.5 h-2.5 border-b border-l border-red-400/70 pointer-events-none" />
      <div className="absolute bottom-1.5 right-1.5 w-2.5 h-2.5 border-b border-r border-red-400/70 pointer-events-none" />

      {/* TOP HEADER */}
      <div className="relative z-10 flex items-center justify-between pb-1.5 border-b border-red-900/50">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-full bg-gradient-to-b from-red-950 to-black border border-red-500/70 flex items-center justify-center shadow-md">
            <Skull className="w-3 h-3 text-red-400" />
          </div>
          <div>
            <span className="text-[8px] font-mono font-bold tracking-[0.18em] text-red-400 uppercase block">
              EVENTO
            </span>
            <h3 className="text-[11px] sm:text-xs font-serif font-black text-[#f3e5d3] uppercase tracking-wider leading-tight">
              {event.name}
            </h3>
          </div>
        </div>
      </div>

      {/* CENTRAL ARTWORK */}
      <div className="relative z-10 h-22 sm:h-24 my-1.5 rounded-lg overflow-hidden border border-red-500/30 bg-black/90 shadow-inner flex items-center justify-center">
        <img
          src={`/eventos/${event.id}_${event.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '_')}_v2.png`}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
        {customArt ? (
          <img src={customArt} alt={event.name} className="w-full h-full object-cover animate-fade-in" />
        ) : (
          <EventIllustration id={event.id} name={event.name} className="w-full h-full object-cover" />
        )}
      </div>

      {/* BOTTOM DESCRIPTION PLAQUE */}
      <div className="relative z-10 p-2 rounded-lg bg-gradient-to-b from-[#240808] to-[#0e0303] border border-red-500/40 shadow-inner">
        <p className="text-[9.5px] font-serif italic text-zinc-200 leading-relaxed text-center">
          "{event.effect}"
        </p>
        {event.duration && (
          <p className="text-[8px] font-mono text-red-400 text-center mt-0.5 font-bold">
            Duração: {event.duration}s
          </p>
        )}
      </div>

      {/* RUBY GEM AT BOTTOM */}
      <div className="relative z-10 flex flex-col items-center pt-1.5 shrink-0">
        <div className="w-2.5 h-2.5 rotate-45 rounded-xs bg-gradient-to-br from-red-400 via-red-600 to-red-950 border border-amber-300 shadow-[0_0_6px_#ef4444]" />
        {onAcknowledge && (
          <button
            onClick={onAcknowledge}
            className="mt-1.5 w-full py-1 rounded-md bg-red-700 hover:bg-red-600 text-white font-serif font-bold text-[9px] uppercase tracking-wider transition-all border border-red-400 shadow-md"
          >
            Compreendido
          </button>
        )}
      </div>
    </div>
  );
};

/* =========================================================================
   5. ABILITY CARD COMPONENT
   ========================================================================= */

export const AbilityCard: React.FC<{
  ability: CardAbility;
  isUsed?: boolean;
  onUse?: () => void;
  canUse?: boolean;
}> = ({ ability, isUsed, onUse, canUse }) => {
  const lookupIds = [
    ability.id,
    `habilidade_${ability.id}`,
    `ability_${ability.id}`,
    ability.id.toLowerCase(),
    `habilidade_${ability.id.toLowerCase()}`,
    `habilidade_${ability.name.toLowerCase().replace(/\s+/g, '_')}`,
  ];
  const customArt = useCustomCardArt(lookupIds);
  const doubleTap = useDoubleTapUpload(ability.id, `Habilidade ${ability.id} - ${ability.name}`, lookupIds);
  const [showInfoBack, setShowInfoBack] = useState<boolean>(false);

  // When custom PNG is uploaded, display the pure card graphic cleanly without obstructing texts (already on the physical card)
  if (customArt) {
    return (
      <div
        onDoubleClick={doubleTap.onDoubleClick}
        onTouchEnd={doubleTap.onTouchEnd}
        title={`Habilidade: ${ability.name} — "${ability.effect}" (Duplo clique para trocar imagem)`}
        className={`relative group transition-all duration-300 select-none rounded-xl overflow-hidden shadow-2xl w-full max-w-[240px] sm:max-w-[260px] mx-auto aspect-[2/3.1] border-2 border-emerald-500/70 hover:border-emerald-400 bg-black/95 flex flex-col justify-between ${
          isUsed ? 'opacity-45 grayscale' : ''
        }`}
      >
        {/* Full Card Custom PNG occupying 100% of the card face */}
        <img
          src={customArt}
          alt={ability.name}
          className="absolute inset-0 w-full h-full object-cover object-center rounded-xl z-0 pointer-events-none"
        />

        {/* Ornate Gothic Card Frame Overlay (Transparent Center) */}
        <GothicCardFrameOverlay frameId="frame_verde_musgo" borderColor="#10b981" />

        {/* Hidden Semantic Memory & Accessibility (Keeps all rules, text & mechanics safe in DOM/memory) */}
        <div className="sr-only" aria-hidden="false">
          <h4>{ability.name}</h4>
          <p>{ability.effect}</p>
        </div>

        {/* Optional Flip-to-Back toggle badge */}
        <div className="relative z-20 p-2 flex justify-between items-start opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowInfoBack(!showInfoBack);
            }}
            className="p-1 rounded-md bg-black/85 text-emerald-300 hover:text-white border border-emerald-500/50 shadow-md text-[9px] flex items-center gap-1 font-mono backdrop-blur-xs"
            title="Ver texto explicativo no verso"
          >
            <Book className="w-3 h-3 text-emerald-400" />
            <span>Verso</span>
          </button>
        </div>

        {/* Info Back Sheet (Shown only if user clicks 'Verso') */}
        {showInfoBack && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              setShowInfoBack(false);
            }}
            className="absolute inset-0 z-30 bg-black/95 p-3 flex flex-col justify-between border-2 border-emerald-500/80 text-zinc-100 animate-fade-in backdrop-blur-md"
          >
            <div className="flex items-center justify-between border-b border-emerald-900/60 pb-1.5">
              <span className="text-[8px] font-mono font-bold text-emerald-400 uppercase tracking-wider">HABILIDADE #{ability.id}</span>
              <button
                type="button"
                onClick={() => setShowInfoBack(false)}
                className="text-zinc-400 hover:text-white text-xs px-1"
              >
                ✕
              </button>
            </div>
            <div className="my-auto text-center px-1">
              <h4 className="text-xs font-serif font-black text-emerald-200 uppercase mb-2">{ability.name}</h4>
              <p className="text-[10px] font-serif italic text-zinc-200 leading-relaxed bg-emerald-950/40 p-2 rounded-lg border border-emerald-500/30">
                "{ability.effect}"
              </p>
            </div>
            <div className="text-[8px] font-mono text-zinc-400 text-center">Toque para voltar à arte</div>
          </div>
        )}

        {/* If used, show subtle wax stamp */}
        {isUsed && (
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
            <span className="text-[10px] font-serif font-black tracking-widest text-zinc-400 bg-black/85 px-3 py-1 rounded border border-zinc-700 shadow-xl uppercase -rotate-6">
              HABILIDADE UTILIZADA
            </span>
          </div>
        )}

        {/* Action Button at bottom */}
        {onUse && !isUsed && (
          <div className="relative z-20 p-2 pointer-events-auto">
            <button
              onClick={onUse}
              disabled={!canUse}
              className={`w-full py-1.5 rounded-lg font-serif font-bold text-[9.5px] uppercase tracking-wider transition-all border shadow-xl ${
                canUse
                  ? 'bg-emerald-800/95 hover:bg-emerald-700 text-white border-emerald-400'
                  : 'bg-zinc-900/95 text-zinc-500 border-zinc-800 cursor-not-allowed'
              }`}
            >
              Usar Habilidade
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      onDoubleClick={doubleTap.onDoubleClick}
      onTouchEnd={doubleTap.onTouchEnd}
      title="Duplo clique para vincular nova imagem"
      className={`relative rounded-2xl p-2.5 sm:p-3 bg-gradient-to-b from-[#031d10] via-[#020d06] to-[#03150b] border-2 border-emerald-500/60 text-zinc-100 max-w-sm w-full shadow-2xl flex flex-col justify-between ${
      isUsed ? 'opacity-40 grayscale' : ''
    }`}>
      {/* Gothic Filigree Corner Accents */}
      <div className="absolute top-1.5 left-1.5 w-2.5 h-2.5 border-t border-l border-emerald-400/70 pointer-events-none" />
      <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 border-t border-r border-emerald-400/70 pointer-events-none" />
      <div className="absolute bottom-1.5 left-1.5 w-2.5 h-2.5 border-b border-l border-emerald-400/70 pointer-events-none" />
      <div className="absolute bottom-1.5 right-1.5 w-2.5 h-2.5 border-b border-r border-emerald-400/70 pointer-events-none" />

      {/* TOP HEADER */}
      <div className="relative z-10 flex items-center justify-between pb-1.5 border-b border-emerald-900/50">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-full bg-gradient-to-b from-emerald-950 to-black border border-emerald-400/70 flex items-center justify-center shadow-md">
            <Eye className="w-3 h-3 text-emerald-400" />
          </div>
          <div>
            <span className="text-[8px] font-mono font-bold tracking-[0.18em] text-emerald-400 uppercase block">
              HABILIDADE
            </span>
            <h3 className="text-[11px] sm:text-xs font-serif font-black text-[#f3e5d3] uppercase tracking-wider leading-tight">
              {ability.name}
            </h3>
          </div>
        </div>
      </div>

      {/* CENTRAL MYSTICAL ARTWORK */}
      <div className="relative z-10 h-22 sm:h-24 my-1.5 rounded-lg overflow-hidden border border-emerald-500/30 bg-black/90 shadow-inner flex items-center justify-center">
        <img
          src={`/habilidades/${ability.id}_${ability.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '_')}.png`}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
        {customArt ? (
          <img src={customArt} alt={ability.name} className="w-full h-full object-cover animate-fade-in" />
        ) : (
          <AbilityIllustration id={ability.id} name={ability.name} className="w-full h-full object-cover" />
        )}
      </div>

      {/* BOTTOM DESCRIPTION PLAQUE */}
      <div className="relative z-10 p-2 rounded-lg bg-gradient-to-b from-[#052817] to-[#02130b] border border-emerald-500/40 shadow-inner">
        <p className="text-[9.5px] font-serif italic text-zinc-200 leading-relaxed text-center">
          "{ability.effect}"
        </p>
      </div>

      {/* EMERALD GEMSTONE AT BOTTOM */}
      <div className="relative z-10 flex flex-col items-center pt-1.5 shrink-0">
        <div className="w-2.5 h-2.5 rotate-45 rounded-xs bg-gradient-to-br from-emerald-300 via-emerald-500 to-emerald-950 border border-emerald-200 shadow-[0_0_6px_#10b981]" />
        {onUse && !isUsed && (
          <button
            onClick={onUse}
            disabled={!canUse}
            className={`mt-1.5 w-full py-1 rounded-md text-[9px] font-serif font-bold uppercase tracking-wider transition-all border ${
              canUse
                ? 'bg-emerald-700 hover:bg-emerald-600 text-white border-emerald-400 shadow-md'
                : 'bg-zinc-900 text-zinc-600 border-zinc-800 cursor-not-allowed'
            }`}
          >
            Usar Habilidade
          </button>
        )}
      </div>
    </div>
  );
};

/* =========================================================================
   6. CHARACTER CARD COMPONENT
   ========================================================================= */

interface CharacterRoleCardProps {
  id?: string;
  role: string;
  name?: string;
  description: string;
  avatarUrl?: string;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export const CharacterRoleCard: React.FC<CharacterRoleCardProps> = ({
  id,
  role,
  name,
  description,
  avatarUrl,
  onClick,
  size = 'md',
}) => {
  const lookupIds = [id, `char_card_${id}`, `char_${id}`, role, name].filter(Boolean) as string[];
  const customArt = useCustomCardArt(lookupIds);
  const doubleTap = useDoubleTapUpload(id || `char_card_${role}`, `Carta de Personagem: ${role}`, lookupIds);

  // Full-bleed custom card PNG if provided
  if (customArt) {
    return (
      <div
        onClick={onClick}
        onDoubleClick={doubleTap.onDoubleClick}
        onTouchEnd={doubleTap.onTouchEnd}
        title="Duplo clique para vincular nova imagem"
        className={`relative group cursor-pointer transition-all duration-300 select-none rounded-xl overflow-hidden shadow-2xl flex flex-col justify-between ${
          size === 'sm'
            ? 'w-24 sm:w-28 aspect-[2/3.1]'
            : 'w-full max-w-[240px] sm:max-w-[260px] aspect-[2/3.1]'
        } border-2 border-amber-700/60 hover:border-amber-400/90 shadow-black/80 hover:shadow-[0_0_18px_rgba(245,158,11,0.3)]`}
      >
        <img
          src={customArt}
          alt={name || role}
          className="absolute inset-0 w-full h-full object-cover object-center rounded-xl z-0"
        />
        {/* Ornate Gothic Card Frame Overlay (Transparent Center) */}
        <GothicCardFrameOverlay frameId="frame_negro_dourado" borderColor="#d4af37" />
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      onDoubleClick={doubleTap.onDoubleClick}
      onTouchEnd={doubleTap.onTouchEnd}
      title="Duplo clique para vincular nova imagem"
      className={`relative group cursor-pointer transition-all duration-300 select-none rounded-xl flex flex-col justify-between overflow-hidden shadow-2xl ${
        size === 'sm'
          ? 'w-28 sm:w-32 aspect-[2/3.1] p-1.5'
          : 'w-full max-w-[240px] sm:max-w-[260px] aspect-[2/3.1] p-2.5 sm:p-3'
      } border-2 border-amber-700/60 bg-gradient-to-b from-[#180f06] via-[#0c0702] to-[#160d05] hover:border-amber-400/90 shadow-black/80 hover:shadow-[0_0_18px_rgba(245,158,11,0.3)]`}
    >
      {/* Ornate Gothic Card Frame Overlay (Transparent Center) */}
      <GothicCardFrameOverlay frameId="frame_negro_dourado" borderColor="#d4af37" />

      {/* TOP HEADER: MEDALLION & ROLE TITLE */}
      <div className="relative z-10 flex flex-col gap-0.5 shrink-0">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-1 bg-black/70 px-1.5 py-0.5 rounded-full border border-amber-500/40 shadow-inner">
            <Skull className="w-3 h-3 text-amber-300" />
            <span className="text-[7.5px] font-serif font-black text-amber-200 uppercase tracking-widest">
              PERSONAGEM
            </span>
          </div>
        </div>

        <div className="text-center px-0.5 pt-0.5">
          <h3 className="text-[10px] sm:text-xs font-serif font-black text-[#f3e5d3] uppercase tracking-wider leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] truncate group-hover:text-amber-200 transition-colors">
            {role}
          </h3>
        </div>
      </div>

      {/* CENTRAL PORTRAIT CONTAINER */}
      <div className="relative z-10 flex-1 my-1 rounded-md overflow-hidden border border-amber-500/40 bg-black/90 shadow-inner flex items-center justify-center min-h-0">
        {customArt ? (
          <img src={customArt} alt={name || role} className="w-full h-full object-cover animate-fade-in" />
        ) : (
          <CharacterRoleIllustration role={role} avatarUrl={avatarUrl} className="w-full h-full object-cover" />
        )}
      </div>

      {/* BOTTOM DESCRIPTION PLAQUE */}
      <div className="relative z-10 p-1.5 rounded bg-gradient-to-b from-[#201406] to-[#0c0702] border border-amber-500/40 shadow-inner shrink-0">
        <p className="text-[8.5px] font-serif italic text-zinc-300 leading-tight text-center line-clamp-2">
          "{description}"
        </p>
      </div>

      {/* AMBER CREST AT BOTTOM CENTER */}
      <div className="relative z-10 flex flex-col items-center pt-0.5 shrink-0">
        <div className="w-2.5 h-2.5 rotate-45 rounded-xs bg-gradient-to-br from-amber-300 via-amber-500 to-amber-950 border border-amber-200 shadow-[0_0_6px_#f59e0b]" />
      </div>
    </div>
  );
};

/* =========================================================================
   7. SECRET ROLE CARD COMPONENT (ASSASSINO, ORÁCULO, INVESTIGADOR, CÚMPLICE, SABOTADOR)
   ========================================================================= */

interface SecretRoleCardProps {
  roleData: SecretRoleData;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export const SecretRoleCard: React.FC<SecretRoleCardProps> = ({
  roleData,
  onClick,
  size = 'md',
}) => {
  const customArt = useCustomCardArt([roleData.id, `role_${roleData.role}`, roleData.role]);
  const doubleTap = useDoubleTapUpload(roleData.id || `role_${roleData.role}`, `Papel Secreto: ${roleData.title}`, [`role_${roleData.role}`, roleData.role]);

  const getRoleTheme = () => {
    switch (roleData.role) {
      case 'assassino':
        return {
          border: 'border-red-500/80',
          hoverBorder: 'hover:border-red-400',
          badgeBg: 'from-red-950 to-black',
          badgeBorder: 'border-red-500/60',
          badgeText: 'text-red-300',
          jewel: 'from-red-400 via-red-600 to-red-950 border-red-300 shadow-[0_0_6px_#ef4444]',
          icon: <Skull className="w-3.5 h-3.5 text-red-400" />,
        };
      case 'oraculo':
        return {
          border: 'border-purple-500/80',
          hoverBorder: 'hover:border-purple-400',
          badgeBg: 'from-purple-950 to-black',
          badgeBorder: 'border-purple-500/60',
          badgeText: 'text-purple-300',
          jewel: 'from-purple-400 via-purple-600 to-purple-950 border-purple-300 shadow-[0_0_6px_#a855f7]',
          icon: <Eye className="w-3.5 h-3.5 text-purple-400" />,
        };
      case 'investigador':
        return {
          border: 'border-blue-500/80',
          hoverBorder: 'hover:border-blue-400',
          badgeBg: 'from-blue-950 to-black',
          badgeBorder: 'border-blue-500/60',
          badgeText: 'text-blue-300',
          jewel: 'from-blue-400 via-blue-600 to-blue-950 border-blue-300 shadow-[0_0_6px_#3b82f6]',
          icon: <Search className="w-3.5 h-3.5 text-blue-400" />,
        };
      case 'cumplice':
        return {
          border: 'border-emerald-500/80',
          hoverBorder: 'hover:border-emerald-400',
          badgeBg: 'from-emerald-950 to-black',
          badgeBorder: 'border-emerald-500/60',
          badgeText: 'text-emerald-300',
          jewel: 'from-emerald-400 via-emerald-600 to-emerald-950 border-emerald-300 shadow-[0_0_6px_#10b981]',
          icon: <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />,
        };
      case 'sabotador':
      default:
        return {
          border: 'border-amber-500/80',
          hoverBorder: 'hover:border-amber-400',
          badgeBg: 'from-amber-950 to-black',
          badgeBorder: 'border-amber-500/60',
          badgeText: 'text-amber-300',
          jewel: 'from-amber-400 via-amber-600 to-amber-950 border-amber-300 shadow-[0_0_6px_#f59e0b]',
          icon: <Zap className="w-3.5 h-3.5 text-amber-400" />,
        };
    }
  };

  const theme = getRoleTheme();

  // Full-bleed custom card PNG if provided
  if (customArt) {
    return (
      <div
        onClick={onClick}
        onDoubleClick={doubleTap.onDoubleClick}
        onTouchEnd={doubleTap.onTouchEnd}
        title="Duplo clique para vincular nova imagem"
        className={`relative group cursor-pointer transition-all duration-300 select-none rounded-xl overflow-hidden shadow-2xl flex flex-col justify-between ${
          size === 'sm'
            ? 'w-24 sm:w-28 aspect-[2/3.1]'
            : 'w-full max-w-[240px] sm:max-w-[260px] aspect-[2/3.1]'
        } border-2 ${theme.border} ${theme.hoverBorder} shadow-black/80`}
      >
        <img
          src={customArt}
          alt={roleData.title}
          onError={() => markCardArtFailed(roleData.id)}
          className="absolute inset-0 w-full h-full object-cover object-center rounded-xl z-0"
        />
        <div className="absolute top-1.5 left-1.5 w-2.5 h-2.5 border-t border-l border-amber-400/80 pointer-events-none z-20" />
        <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 border-t border-r border-amber-400/80 pointer-events-none z-20" />
        <div className="absolute bottom-1.5 left-1.5 w-2.5 h-2.5 border-b border-l border-amber-400/80 pointer-events-none z-20" />
        <div className="absolute bottom-1.5 right-1.5 w-2.5 h-2.5 border-b border-r border-amber-400/80 pointer-events-none z-20" />
        <div className="absolute top-2 left-2 z-20 pointer-events-none">
          <div className={`flex items-center gap-1 bg-gradient-to-r ${theme.badgeBg} px-2 py-0.5 rounded-full border ${theme.badgeBorder} shadow-inner`}>
            {theme.icon}
            <span className={`text-[7.5px] font-serif font-black ${theme.badgeText} uppercase tracking-widest`}>
              {roleData.title}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      onDoubleClick={doubleTap.onDoubleClick}
      onTouchEnd={doubleTap.onTouchEnd}
      title="Duplo clique para vincular nova imagem"
      className={`relative group cursor-pointer transition-all duration-300 select-none rounded-xl flex flex-col justify-between overflow-hidden shadow-2xl ${
        size === 'sm'
          ? 'w-24 sm:w-28 aspect-[2/3.1] p-1.5'
          : 'w-full max-w-[240px] sm:max-w-[260px] aspect-[2/3.1] p-2.5 sm:p-3'
      } border-2 ${theme.border} ${theme.hoverBorder} bg-gradient-to-b from-[#140b10] via-[#090408] to-[#12080f] shadow-black/80`}
    >
      {/* Texture Layer */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-700/10 via-transparent to-black/80 pointer-events-none" />
      <div className="absolute inset-1 rounded-lg border border-amber-500/20 pointer-events-none" />

      {/* Ornate Corner Accents */}
      <div className="absolute top-1.5 left-1.5 w-2.5 h-2.5 border-t border-l border-amber-400/80 pointer-events-none" />
      <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 border-t border-r border-amber-400/80 pointer-events-none" />
      <div className="absolute bottom-1.5 left-1.5 w-2.5 h-2.5 border-b border-l border-amber-400/80 pointer-events-none" />
      <div className="absolute bottom-1.5 right-1.5 w-2.5 h-2.5 border-b border-r border-amber-400/80 pointer-events-none" />

      {/* TOP HEADER */}
      <div className="relative z-10 flex flex-col gap-0.5 shrink-0">
        <div className="flex items-center justify-between px-0.5">
          <div className={`flex items-center gap-1 bg-gradient-to-r ${theme.badgeBg} px-2 py-0.5 rounded-full border ${theme.badgeBorder} shadow-inner`}>
            {theme.icon}
            <span className={`text-[7.5px] font-serif font-black ${theme.badgeText} uppercase tracking-widest`}>
              PAPEL SECRETO
            </span>
          </div>
        </div>

        <div className="text-center px-0.5 pt-1">
          <h3 className="text-[11px] sm:text-xs font-serif font-black text-[#f3e5d3] uppercase tracking-wider leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] truncate">
            {roleData.title}
          </h3>
        </div>
      </div>

      {/* CENTRAL ARTWORK */}
      <div className="relative z-10 flex-1 my-1.5 rounded-md overflow-hidden border border-amber-500/30 bg-black/90 shadow-inner flex items-center justify-center min-h-0">
        {customArt ? (
          <img src={customArt} alt={roleData.name} className="w-full h-full object-cover animate-fade-in" />
        ) : (
          <CharacterRoleIllustration role={roleData.role} className="w-full h-full object-cover" />
        )}
      </div>

      {/* BOTTOM DESCRIPTION PLAQUE */}
      <div className="relative z-10 p-1.5 rounded bg-black/70 border border-amber-500/30 shadow-inner shrink-0">
        <p className="text-[8px] font-serif italic text-zinc-300 leading-tight text-center line-clamp-2">
          "{roleData.description}"
        </p>
      </div>

      {/* JEWEL AT BOTTOM */}
      <div className="relative z-10 flex flex-col items-center pt-0.5 shrink-0">
        <div className={`w-2.5 h-2.5 rotate-45 rounded-xs bg-gradient-to-br ${theme.jewel}`} />
      </div>
    </div>
  );
};



