import React, { useState } from 'react';
import { Play, X, Users, Smartphone, Globe, Sparkles, Key, Bot, Shield, ChevronRight } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

interface PlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartSoloGame: () => void;
  onStartPassAndPlay: () => void;
  onHostOnlineRoom: () => void;
  onJoinRoom: (code: string) => void;
  roomCodeInput: string;
  setRoomCodeInput: (code: string) => void;
  mode?: 'all' | 'create' | 'join';
}

export const PlayModal: React.FC<PlayModalProps> = ({
  isOpen,
  onClose,
  onStartSoloGame,
  onStartPassAndPlay,
  onHostOnlineRoom,
  onJoinRoom,
  roomCodeInput,
  setRoomCodeInput,
  mode = 'all',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in text-[#e8dfd8]">
      {/* Ornate Gothic Modal Window */}
      <div className="relative bg-gradient-to-b from-[#18120e] via-[#0d0a08] to-[#050403] border-2 border-[#b88c3a] rounded-3xl max-w-md w-full p-4 sm:p-6 shadow-[0_0_50px_rgba(0,0,0,0.95)] max-h-[95vh] flex flex-col space-y-4 overflow-hidden">
        {/* Gold filigree corner accents */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#e5b358] pointer-events-none" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#e5b358] pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#e5b358] pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#e5b358] pointer-events-none" />

        {/* Header with Gothic Ornament */}
        <div className="relative flex flex-col items-center justify-center pt-1 pb-2 border-b border-[#a67c32]/30">
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="absolute right-0 top-0 p-1.5 rounded-full bg-[#1c1510] text-[#c9a75e] hover:text-white border border-[#a67c32]/50 hover:border-[#e5b358] transition-colors"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-8 h-[1px] bg-gradient-to-r from-transparent via-[#e5b358] to-transparent mb-1" />
          <h2 className="text-base sm:text-xl font-serif font-black text-[#f7e4ba] uppercase tracking-[0.25em] drop-shadow">
            {mode === 'create' ? 'CRIAR SALA' : mode === 'join' ? 'PARTIDA RÁPIDA' : 'PARTIDA RÁPIDA'}
          </h2>
          <p className="text-[10px] sm:text-[11px] text-[#c9a75e] font-serif tracking-widest uppercase mt-0.5">
            COMO DESEJA DESVENDAR O CRIME?
          </p>
        </div>

        {/* Options Stack (Cards matching partida rapida.png) */}
        <div className="space-y-2.5 overflow-y-auto pr-0.5">
          {/* 1. Solo Bot Game (Gold / Mystic Hood Card) */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
              onStartSoloGame();
            }}
            className="w-full p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-[#1f1810] via-[#140f0a] to-[#0b0805] hover:from-[#2a2015] border border-[#a67c32]/60 hover:border-[#e5b358] transition-all flex items-center justify-between group shadow-[0_4px_15px_rgba(0,0,0,0.7)] text-left relative overflow-hidden"
          >
            <div className="flex items-center gap-3.5 z-10">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-b from-[#2e2113] to-[#120d08] border border-[#d4af37]/60 flex items-center justify-center text-[#f3ce7b] shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                <Bot className="w-6 h-6 text-[#e5b358]" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-serif font-bold text-[#f7e4ba] group-hover:text-white tracking-wider block">
                  JOGAR SOLO
                </span>
                <span className="text-[9px] sm:text-[10px] font-serif text-[#b89759] tracking-wide block uppercase">
                  TREINE CONTRA BOTS INTELIGENTES
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#8a6e38] group-hover:text-[#f3ce7b] transition-transform group-hover:translate-x-1 z-10" />
          </button>

          {/* 2. Pass and Play Local Mode (Crimson / Phone Card) */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
              onStartPassAndPlay();
            }}
            className="w-full p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-[#2c0a0a] via-[#1a0505] to-[#0d0303] hover:from-[#3d0f0f] border border-[#8f1d1d]/80 hover:border-[#c92a2a] transition-all flex items-center justify-between group shadow-[0_4px_15px_rgba(44,10,10,0.6)] text-left relative overflow-hidden"
          >
            <div className="flex items-center gap-3.5 z-10">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-b from-[#400d0d] to-[#170303] border border-[#b82323]/80 flex items-center justify-center text-[#ff9999] shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                <Smartphone className="w-6 h-6 text-[#ff6666]" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-serif font-bold text-[#ffdede] group-hover:text-white tracking-wider block">
                  PASSAR O CELULAR
                </span>
                <span className="text-[9px] sm:text-[10px] font-serif text-[#d67e7e] tracking-wide block uppercase">
                  PRESENCIAL COM 1 APARELHO
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#8f2d2d] group-hover:text-[#ff9999] transition-transform group-hover:translate-x-1 z-10" />
          </button>

          {/* 3. Online Private Room (Night Blue / Portal Card) */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
              onHostOnlineRoom();
            }}
            className="w-full p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-[#0d1726] via-[#070e1a] to-[#040810] hover:from-[#13233b] border border-[#2b4d7a]/80 hover:border-[#4d85cc] transition-all flex items-center justify-between group shadow-[0_4px_15px_rgba(13,23,38,0.7)] text-left relative overflow-hidden"
          >
            <div className="flex items-center gap-3.5 z-10">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-b from-[#142640] to-[#080f1a] border border-[#3b68a6]/80 flex items-center justify-center text-[#99c2ff] shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                <Globe className="w-6 h-6 text-[#66a3ff]" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-serif font-bold text-[#e1ecfa] group-hover:text-white tracking-wider block">
                  SALA PRIVADA
                </span>
                <span className="text-[9px] sm:text-[10px] font-serif text-[#7d9ec7] tracking-wide block uppercase">
                  CRIE OU CONVIDE COM CÓDIGO
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#355a8a] group-hover:text-[#99c2ff] transition-transform group-hover:translate-x-1 z-10" />
          </button>

          {/* 4. Join with Code Field */}
          <div className="p-3 rounded-2xl bg-[#0d0a08]/90 border border-[#a67c32]/40 space-y-2">
            <span className="text-[11px] font-serif font-bold text-[#f5e7c8] block tracking-wide uppercase">
              ENTRAR COM CÓDIGO DE SALA
            </span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                maxLength={5}
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                placeholder="EX: X7K9P"
                className="flex-1 bg-black/80 border border-[#8a6828]/60 text-xs text-[#f7e4ba] rounded-xl px-3 py-2 font-mono uppercase tracking-[0.25em] focus:outline-none focus:border-[#e5b358] placeholder-[#6b5530]"
              />
              <button
                onClick={() => {
                  soundEngine.playClick();
                  if (roomCodeInput.trim()) {
                    onClose();
                    onJoinRoom(roomCodeInput.trim().toUpperCase());
                  }
                }}
                disabled={!roomCodeInput.trim()}
                className="px-4 py-2 rounded-xl bg-gradient-to-b from-[#6e1010] to-[#360808] hover:from-[#8c1515] border border-[#b82323] disabled:opacity-40 text-[#f7e4ba] font-serif font-bold text-xs uppercase tracking-wider transition-all shadow"
              >
                ENTRAR
              </button>
            </div>
          </div>
        </div>

        {/* Footer Gothic Quote (as in partida rapida.png) */}
        <div className="pt-2 border-t border-[#a67c32]/20 text-center">
          <p className="text-[9px] sm:text-[9.5px] font-serif italic text-[#a3844d] tracking-widest">
            “JUNTOS, ATÉ O SILÊNCIO REVELA PISTAS — O ORÁCULO —”
          </p>
        </div>
      </div>
    </div>
  );
};
