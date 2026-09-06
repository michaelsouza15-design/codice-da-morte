import React, { useState, useRef, useEffect } from 'react';
import { CardEvidence, MarkerColor } from '../types/game';
import { MARKER_INFOS } from '../data/gameData';
import { GothicWaxSeal } from './GothicWaxSeal';
import { useCustomCardArt, useDoubleTapUpload } from '../utils/customCardArt';
import { EVIDENCE_CARD_SLOTS, EvidenceIllustration } from './GothicCard';
import { soundEngine } from '../utils/soundEngine';
import {
  X,
  Check,
  RotateCcw,
  Sparkles,
  Search,
  Move,
  CheckCircle2,
  Info,
  Maximize2,
} from 'lucide-react';

interface EvidenceMarkerPlacementModalProps {
  evidence: CardEvidence;
  initialColor?: MarkerColor;
  onSaveMark: (
    evidenceId: string,
    optionIndex: number,
    color: MarkerColor,
    coords?: { x: number; y: number }
  ) => void;
  onRemoveMark?: (evidenceId: string) => void;
  onClose: () => void;
}

export const EvidenceMarkerPlacementModal: React.FC<EvidenceMarkerPlacementModalProps> = ({
  evidence,
  initialColor = 'dourado',
  onSaveMark,
  onRemoveMark,
  onClose,
}) => {
  const [selectedColor, setSelectedColor] = useState<MarkerColor>(
    evidence.markedColor || initialColor
  );
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number>(
    evidence.markedOptionIndex !== undefined ? evidence.markedOptionIndex : 0
  );

  // Position coordinates in percentage (0 to 100)
  const defaultSlot =
    EVIDENCE_CARD_SLOTS[
      evidence.markedOptionIndex !== undefined ? evidence.markedOptionIndex : 0
    ] || EVIDENCE_CARD_SLOTS[0];

  const initialX =
    evidence.markerX !== undefined
      ? evidence.markerX
      : parseFloat(defaultSlot.circleX.replace('%', ''));
  const initialY =
    evidence.markerY !== undefined
      ? evidence.markerY
      : parseFloat(defaultSlot.circleY.replace('%', ''));

  const [coords, setCoords] = useState<{ x: number; y: number }>({
    x: initialX,
    y: initialY,
  });

  const [isDragging, setIsDragging] = useState(false);
  const [isSavedFeedback, setIsSavedFeedback] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const lookupIds = [
    evidence.id,
    `evidencia_${evidence.id}`,
    `evidence_${evidence.id}`,
    `evidencia_${evidence.id.toLowerCase()}`,
    evidence.id.toLowerCase(),
    `evidencia_${evidence.title.toLowerCase().replace(/\s+/g, '_')}`,
  ];
  const customArt = useCustomCardArt(lookupIds);
  const doubleTap = useDoubleTapUpload(
    evidence.id,
    `Evidência ${evidence.id} - ${evidence.title}`,
    lookupIds
  );

  const colors: MarkerColor[] = ['dourado', 'vermelho', 'azul', 'cinza', 'preto'];

  // Helper to determine nearest option based on Y and X coordinate
  const findNearestOptionIndex = (x: number, y: number): number => {
    let nearestIdx = 0;
    let minDistance = Infinity;

    EVIDENCE_CARD_SLOTS.forEach((slot, idx) => {
      const slotX = parseFloat(slot.circleX.replace('%', ''));
      const slotY = parseFloat(slot.circleY.replace('%', ''));
      const dist = Math.hypot(x - slotX, y - slotY);
      if (dist < minDistance) {
        minDistance = dist;
        nearestIdx = idx;
      }
    });

    return nearestIdx;
  };

  // Update coordinates from pointer/mouse position on the card
  const handleCardInteraction = (
    clientX: number,
    clientY: number,
    shouldUpdateOption = true
  ) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    let x = ((clientX - rect.left) / rect.width) * 100;
    let y = ((clientY - rect.top) / rect.height) * 100;

    // Constrain inside card bounds
    x = Math.max(5, Math.min(95, x));
    y = Math.max(5, Math.min(95, y));

    setCoords({ x, y });

    if (shouldUpdateOption) {
      const nearest = findNearestOptionIndex(x, y);
      setSelectedOptionIndex(nearest);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    handleCardInteraction(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    handleCardInteraction(e.clientX, e.clientY);
  };

  const handlePointerUp = () => {
    if (isDragging) {
      setIsDragging(false);
      soundEngine.playMarkerChime();
    }
  };

  // Select pre-set option socket
  const handleSelectSlot = (idx: number) => {
    soundEngine.playClick();
    setSelectedOptionIndex(idx);
    const slot = EVIDENCE_CARD_SLOTS[idx] || EVIDENCE_CARD_SLOTS[0];
    const x = parseFloat(slot.circleX.replace('%', ''));
    const y = parseFloat(slot.circleY.replace('%', ''));
    setCoords({ x, y });
  };

  const handleConfirmSave = () => {
    soundEngine.playGavelStrike();
    setIsSavedFeedback(true);
    onSaveMark(evidence.id, selectedOptionIndex, selectedColor, coords);
    setTimeout(() => {
      onClose();
    }, 400);
  };

  const handleClearMark = () => {
    soundEngine.playClick();
    if (onRemoveMark) {
      onRemoveMark(evidence.id);
    } else {
      onSaveMark(evidence.id, -1, 'dourado');
    }
    onClose();
  };

  const currentOptionText =
    evidence.options[selectedOptionIndex] || `Opção ${selectedOptionIndex + 1}`;
  const markerInfo = MARKER_INFOS[selectedColor];

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-2 sm:p-4 animate-fade-in text-[#e8dfd8] overflow-y-auto select-none">
      {/* Top Bar */}
      <div className="w-full max-w-4xl flex items-center justify-between px-3 py-2 bg-[#180a06] border-b border-amber-500/40 rounded-2xl shadow-xl">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-amber-950/80 border border-amber-500/60 flex items-center justify-center shadow">
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block font-bold">
              ORÁCULO • ALOCAÇÃO DE MARCADOR
            </span>
            <h2 className="text-xs sm:text-sm font-serif font-black text-white uppercase tracking-wider">
              {evidence.id} • {evidence.title}
            </h2>
          </div>
        </div>

        <button
          onClick={() => {
            soundEngine.playClick();
            onClose();
          }}
          className="p-1.5 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-500/50 text-red-200 hover:text-white transition-all active:scale-95"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content: Card Large View + Control Panel */}
      <div className="w-full max-w-4xl flex-1 flex flex-col md:flex-row items-center justify-center gap-4 sm:gap-8 my-3">
        {/* LEFT / CENTER: THE BIG EVIDENCE CARD (Click / Drag to Place Marker) */}
        <div className="flex flex-col items-center gap-2">
          <div className="text-center">
            <span className="text-[11px] font-serif text-amber-300 flex items-center justify-center gap-1.5 font-bold uppercase tracking-wider">
              <Move className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              Clique ou arraste o marcador para a posição exata da carta
            </span>
          </div>

          <div
            ref={cardRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onDoubleClick={doubleTap.onDoubleClick}
            onTouchEnd={doubleTap.onTouchEnd}
            style={{ touchAction: 'none' }}
            className={`relative rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.95)] border-3 border-amber-500/70 cursor-crosshair select-none w-[280px] sm:w-[320px] md:w-[360px] aspect-[2/3] transition-all group ${
              isDragging ? 'ring-4 ring-amber-400/80 scale-[1.01]' : 'hover:border-amber-400'
            }`}
          >
            {/* Card Background: Custom Uploaded PNG OR Procedural Gothic Card */}
            {customArt ? (
              <img
                src={customArt}
                alt={evidence.title}
                className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-b from-[#0e1626] via-[#070d18] to-[#040810] flex flex-col justify-between p-4 z-0 pointer-events-none">
                {/* Header */}
                <div className="flex items-center justify-between pb-2 border-b border-sky-500/30">
                  <span className="text-xs font-mono font-bold text-sky-400 tracking-widest uppercase">
                    EVIDÊNCIA {evidence.id}
                  </span>
                  <h3 className="text-sm font-serif font-black text-amber-100 uppercase truncate">
                    {evidence.title}
                  </h3>
                </div>

                {/* Center Illustration */}
                <div className="flex-1 my-2 rounded-xl overflow-hidden border border-sky-500/30 bg-black/60 relative">
                  <EvidenceIllustration
                    id={evidence.id}
                    title={evidence.title}
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                </div>

                {/* 6 Options Grid */}
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  {evidence.options.map((opt, idx) => (
                    <div
                      key={idx}
                      className={`p-1.5 rounded-lg border text-center text-[10px] font-serif ${
                        selectedOptionIndex === idx
                          ? 'bg-amber-950/80 border-amber-400 text-amber-200 font-bold'
                          : 'bg-black/60 border-white/10 text-zinc-300'
                      }`}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Corner Decorative Brass Accents */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-400 pointer-events-none z-20" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-400 pointer-events-none z-20" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-400 pointer-events-none z-20" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-400 pointer-events-none z-20" />

            {/* 6 Interactive Sockets Overlay for Guidance */}
            {evidence.options.map((opt, idx) => {
              const slot = EVIDENCE_CARD_SLOTS[idx] || EVIDENCE_CARD_SLOTS[0];
              const isSelected = selectedOptionIndex === idx;

              return (
                <div
                  key={idx}
                  style={{
                    position: 'absolute',
                    left: slot.left,
                    top: slot.top,
                    width: slot.width,
                    height: slot.height,
                  }}
                  className={`pointer-events-none rounded-xl border transition-all z-10 flex flex-col justify-end items-center pb-1 ${
                    isSelected
                      ? 'border-amber-400/80 bg-amber-500/15 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                      : 'border-white/10 group-hover:border-white/20'
                  }`}
                >
                  <span className="text-[7.5px] sm:text-[8.5px] font-serif font-black uppercase text-center px-1 text-white bg-black/80 rounded-sm drop-shadow line-clamp-1">
                    {opt}
                  </span>
                </div>
              );
            })}

            {/* THE DRAGGABLE / PLACED WAX SEAL (Follows Coords exactly) */}
            <div
              style={{
                position: 'absolute',
                left: `${coords.x}%`,
                top: `${coords.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className="z-30 w-[14%] aspect-square pointer-events-none drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] animate-scale-up"
            >
              <GothicWaxSeal
                color={selectedColor}
                size="custom"
                glow={true}
                pulse={isDragging}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-400">
            <span>Posição X: {coords.x.toFixed(1)}%</span>
            <span>•</span>
            <span>Posição Y: {coords.y.toFixed(1)}%</span>
          </div>
        </div>

        {/* RIGHT: CONTROL PANEL (COLOR SELECTOR + OPTION QUICK-BUTTONS + ACTIONS) */}
        <div className="w-full md:w-80 flex flex-col gap-3 bg-[#120704] border border-amber-500/40 rounded-2xl p-4 shadow-2xl">
          {/* 1. Selected Option Info Banner */}
          <div className="p-3 rounded-xl bg-black/60 border border-amber-500/30 space-y-1">
            <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider block">
              OPÇÃO ESCOLHIDA NA CARTA:
            </span>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse shrink-0" />
              <span className="text-sm font-serif font-black text-white uppercase tracking-wide">
                {currentOptionText}
              </span>
            </div>
            <span className="text-[10px] text-zinc-400 font-serif italic block">
              Selo selecionado: {markerInfo.name} ({markerInfo.meaning})
            </span>
          </div>

          {/* 2. Wax Seal Color Selection */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-serif font-bold text-amber-300 uppercase tracking-widest block">
              COR DO SELO DO ORÁCULO:
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {colors.map((c) => {
                const info = MARKER_INFOS[c];
                const isSelected = selectedColor === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setSelectedColor(c);
                    }}
                    className={`p-1.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                      isSelected
                        ? 'bg-amber-950/90 border-amber-400 text-amber-100 ring-2 ring-amber-400 scale-105 shadow-lg'
                        : 'bg-black/60 border-white/10 text-zinc-400 hover:text-white'
                    }`}
                    title={info.meaning}
                  >
                    <div className="w-6 h-6">
                      <GothicWaxSeal color={c} size="custom" glow={isSelected} />
                    </div>
                    <span className="text-[8px] font-serif font-bold uppercase truncate max-w-full">
                      {info.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Quick Option Target Buttons (0 to 5) */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-serif font-bold text-amber-300 uppercase tracking-widest block">
              ALINHAR AO SLOT AUTOMÁTICO:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {evidence.options.map((opt, idx) => {
                const isSelected = selectedOptionIndex === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSlot(idx)}
                    className={`py-1.5 px-2 rounded-xl text-[10px] font-serif font-bold transition-all border text-left truncate flex items-center justify-between ${
                      isSelected
                        ? 'bg-gradient-to-r from-red-900 to-amber-900 border-amber-400 text-white shadow-md'
                        : 'bg-black/60 border-white/10 text-zinc-300 hover:text-white hover:border-white/30'
                    }`}
                  >
                    <span className="truncate">{opt}</span>
                    {isSelected && <Check className="w-3 h-3 text-amber-300 shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Action Buttons */}
          <div className="pt-2 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleConfirmSave}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-700 via-amber-600 to-red-700 hover:from-red-600 hover:to-amber-500 text-white font-serif font-black text-xs uppercase tracking-[0.2em] shadow-xl border border-amber-300 transition-all flex items-center justify-center gap-2 active:scale-95 group"
            >
              <CheckCircle2 className="w-4 h-4 text-amber-200 group-hover:scale-110 transition-transform" />
              <span>CONFIRMAR & SALVAR MARCADOR</span>
            </button>

            {evidence.markedOptionIndex !== undefined && (
              <button
                type="button"
                onClick={handleClearMark}
                className="w-full py-2 px-3 rounded-xl bg-zinc-900 hover:bg-red-950 border border-zinc-700 hover:border-red-500/50 text-zinc-400 hover:text-red-200 font-serif text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5 text-red-400" />
                <span>REMOVER MARCADOR DESTA CARTA</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
