import React, { useState, useRef } from 'react';
import { useGameZoom } from '../context/GameZoomContext';
import { ZoomIn, ZoomOut, RotateCcw, Search } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

export const GameZoomHUD: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { zoom, zoomIn, zoomOut, resetZoom, isZoomActive } = useGameZoom();
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const percentage = Math.round(zoom * 100);

  return (
    <div
      className={`relative inline-flex items-center z-40 select-none ${className}`}
      onMouseEnter={() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsOpen(true);
      }}
      onMouseLeave={() => {
        timeoutRef.current = setTimeout(() => setIsOpen(false), 800);
      }}
    >
      {/* Zoom HUD Bar */}
      <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-black/80 backdrop-blur-md border border-amber-500/40 shadow-lg text-amber-200">
        <button
          onClick={() => {
            soundEngine.playClick();
            zoomOut();
          }}
          disabled={zoom <= 0.65}
          className="w-5 h-5 flex items-center justify-center rounded text-amber-300 hover:text-white hover:bg-amber-950/80 disabled:opacity-40 transition-all font-mono font-bold text-xs"
          title="Diminuir Zoom Geral (Ctrl + Scroll para baixo)"
        >
          -
        </button>

        <button
          onClick={() => {
            soundEngine.playClick();
            resetZoom();
          }}
          className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
            isZoomActive
              ? 'text-amber-300 bg-amber-950/60 border border-amber-500/40'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
          title="Clique para redefinir o zoom para 100% (Ctrl + 0)"
        >
          {percentage}%
        </button>

        <button
          onClick={() => {
            soundEngine.playClick();
            zoomIn();
          }}
          disabled={zoom >= 2.2}
          className="w-5 h-5 flex items-center justify-center rounded text-amber-300 hover:text-white hover:bg-amber-950/80 disabled:opacity-40 transition-all font-mono font-bold text-xs"
          title="Aumentar Zoom Geral (Ctrl + Scroll para cima)"
        >
          +
        </button>
      </div>
    </div>
  );
};
