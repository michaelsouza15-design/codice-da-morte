import React from 'react';
import {
  X,
  Settings,
  LogOut,
  BookOpen,
  Volume2,
  VolumeX,
  ShieldAlert,
  Smartphone,
  Sparkles,
  Maximize2,
  RefreshCw,
  Zap,
  ChevronDown,
  ChevronUp,
  History,
  FileText,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

interface InGameQuickMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
  onOpenRules: () => void;
  onOpenHistory: () => void;
  onOpenStory: () => void;
  onOpenMobileGuide?: () => void;
  onLeaveRoom: () => void;
  isHost?: boolean;
  onRestartGame?: () => void;
  roomCode?: string;
}

export const InGameQuickMenuModal: React.FC<InGameQuickMenuModalProps> = ({
  isOpen,
  onClose,
  onOpenSettings,
  onOpenRules,
  onOpenHistory,
  onOpenStory,
  onOpenMobileGuide,
  onLeaveRoom,
  isHost,
  onRestartGame,
  roomCode,
}) => {
  const [confirmLeave, setConfirmLeave] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(() => soundEngine.getSettings().isMuted);
  const [isSubmenuOpen, setIsSubmenuOpen] = React.useState(false);

  if (!isOpen) return null;

  const toggleMute = () => {
    const next = soundEngine.toggleMute();
    setIsMuted(next);
  };

  const toggleFullscreen = () => {
    soundEngine.playClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleQuickHistory = () => {
    soundEngine.playClick();
    onClose();
    onOpenHistory();
  };

  const handleQuickRules = () => {
    soundEngine.playClick();
    onClose();
    onOpenRules();
  };

  const handleQuickStory = () => {
    soundEngine.playClick();
    onClose();
    onOpenStory();
  };

  const handleQuickSettings = () => {
    soundEngine.playClick();
    onClose();
    onOpenSettings();
  };

  return (
    <div
      id="in-game-menu-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          soundEngine.playClick();
          onClose();
        }
      }}
    >
      <div
        id="in-game-menu-card"
        className="w-full max-w-md rounded-3xl border-2 border-[#b88c3a] bg-gradient-to-b from-[#180b06] via-[#100502] to-[#080201] text-[#f7e4ba] p-5 flex flex-col gap-3.5 shadow-[0_0_60px_rgba(0,0,0,0.95)] relative overflow-hidden max-h-[92vh] overflow-y-auto"
      >
        {/* Filigranas douradas nos 4 cantos */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#e5b358] pointer-events-none" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#e5b358] pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#e5b358] pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#e5b358] pointer-events-none" />

        {/* Top Ornament Bar */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-800 via-[#e5b358] to-red-800" />

        {/* 1. Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-[#a67c32]/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#241708] border border-[#b88c3a]/50 flex items-center justify-center shadow-inner">
              <Sparkles className="w-4 h-4 text-[#e5b358]" />
            </div>
            <div>
              <h2 className="font-serif text-sm sm:text-base font-black text-[#f7e4ba] uppercase tracking-[0.2em] leading-tight">
                MENU DA PARTIDA
              </h2>
              <span className="text-[10px] font-mono text-[#c9a75e]">
                {roomCode ? `SALA ATIVA: ${roomCode}` : 'OPÇÕES & ATALHOS'}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="p-1.5 rounded-xl bg-[#120c08] border border-[#a67c32]/40 hover:border-[#e5b358] text-[#a89070] hover:text-white transition-all active:scale-95 cursor-pointer"
            title="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Submenu Suspenso Interativo (Navegação Rápida Direta) */}
        <div className="rounded-2xl bg-black/70 border border-amber-500/30 p-2 shadow-inner">
          <button
            onClick={() => {
              soundEngine.playClick();
              setIsSubmenuOpen((prev) => !prev);
            }}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-950/50 via-black/80 to-amber-950/50 hover:from-amber-900/60 hover:to-amber-900/60 border border-amber-500/30 text-left transition-all group active:scale-[0.99] cursor-pointer"
            title="Alternar Submenu Suspenso de Acesso Rápido"
          >
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="text-xs font-serif font-black uppercase tracking-wider text-amber-200">
                Submenu Suspenso de Navegação
              </span>
            </div>
            <div className="flex items-center gap-1 text-amber-400 text-[10px] font-mono">
              <span className="hidden sm:inline">{isSubmenuOpen ? 'Ocultar' : 'Acessar'}</span>
              {isSubmenuOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </div>
          </button>

          {isSubmenuOpen && (
            <div className="mt-2 pt-2 border-t border-amber-900/40 grid grid-cols-1 gap-1.5 animate-fade-in">
              <button
                onClick={handleQuickHistory}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-red-950/60 hover:bg-red-900/70 border border-red-500/40 text-red-200 text-xs font-serif transition-all active:scale-[0.99] group text-left cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span className="font-bold">Histórico de Acusações (Vereditos & Suspeitos)</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-red-400/70 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </button>

              <button
                onClick={handleQuickRules}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-amber-950/60 hover:bg-amber-900/70 border border-amber-500/40 text-amber-200 text-xs font-serif transition-all active:scale-[0.99] group text-left cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="font-bold">Regras do Jogo & Guia Completo</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-amber-400/70 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </button>

              <button
                onClick={handleQuickStory}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-black/60 hover:bg-zinc-900 border border-white/10 text-zinc-300 text-xs font-serif transition-all active:scale-[0.99] group text-left cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span>Diário do Crime & Narrativa do Oráculo</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </button>

              <button
                onClick={handleQuickSettings}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-black/60 hover:bg-zinc-900 border border-white/10 text-zinc-300 text-xs font-serif transition-all active:scale-[0.99] group text-left cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Settings className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span>Configurações & Áudio da Partida</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </button>
            </div>
          )}
        </div>

        {/* 3. GRADE DE ATALHOS RÁPIDOS EM DESTAQUE (1 TOQUE: HISTÓRICO & REGRAS) */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-serif font-black uppercase tracking-widest text-amber-400/90 flex items-center gap-1.5">
              <Flame className="w-3 h-3 text-amber-400" />
              Grade de Atalhos Rápidos
            </span>
            <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
              1 Toque Direto
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* ATALHO 1: HISTÓRICO DE ACUSAÇÕES (1 Toque) */}
            <button
              onClick={handleQuickHistory}
              className="p-3 rounded-2xl bg-gradient-to-br from-red-950/80 via-[#1f0907] to-black border-2 border-red-500/60 hover:border-red-400 text-left transition-all group flex flex-col justify-between gap-2 shadow-lg shadow-red-950/50 hover:shadow-[0_0_18px_rgba(239,68,68,0.35)] active:scale-[0.98] cursor-pointer"
              title="Acesso Direto com 1 Toque ao Histórico de Acusações"
            >
              <div className="flex items-center justify-between w-full">
                <div className="w-8 h-8 rounded-xl bg-red-950 border border-red-400/60 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                  <ShieldAlert className="w-4 h-4 text-red-300" />
                </div>
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-red-900/60 text-red-200 border border-red-500/40">
                  1 Toque
                </span>
              </div>
              <div>
                <span className="text-xs font-serif font-black text-red-100 group-hover:text-amber-200 block leading-tight">
                  Histórico de Acusações
                </span>
                <span className="text-[9.5px] font-sans text-red-300/80 block leading-tight mt-0.5">
                  Suspeitos, pistas e vereditos
                </span>
              </div>
            </button>

            {/* ATALHO 2: REGRAS DO JOGO (1 Toque) */}
            <button
              onClick={handleQuickRules}
              className="p-3 rounded-2xl bg-gradient-to-br from-amber-950/80 via-[#211204] to-black border-2 border-amber-500/60 hover:border-amber-400 text-left transition-all group flex flex-col justify-between gap-2 shadow-lg shadow-amber-950/50 hover:shadow-[0_0_18px_rgba(245,158,11,0.35)] active:scale-[0.98] cursor-pointer"
              title="Acesso Direto com 1 Toque às Regras e Guia de Papéis"
            >
              <div className="flex items-center justify-between w-full">
                <div className="w-8 h-8 rounded-xl bg-amber-950 border border-amber-400/60 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                  <BookOpen className="w-4 h-4 text-amber-300" />
                </div>
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-amber-900/60 text-amber-200 border border-amber-500/40">
                  1 Toque
                </span>
              </div>
              <div>
                <span className="text-xs font-serif font-black text-amber-100 group-hover:text-amber-200 block leading-tight">
                  Regras & Guia
                </span>
                <span className="text-[9.5px] font-sans text-amber-300/80 block leading-tight mt-0.5">
                  Como jogar, funções e marcadores
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* 4. OPÇÕES SECUNDÁRIAS (DIÁRIO DO CRIME & CONFIGURAÇÕES) */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* CRÔNICA / DIÁRIO DO CRIME */}
          <button
            onClick={handleQuickStory}
            className="p-3 rounded-2xl bg-black/55 hover:bg-amber-950/40 border border-white/10 hover:border-amber-500/50 text-left transition-all group flex flex-col justify-between gap-2 active:scale-[0.98] cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-950/80 border border-amber-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <span className="text-xs font-serif font-bold text-zinc-100 group-hover:text-amber-300 block leading-tight">
                Diário do Crime
              </span>
              <span className="text-[9.5px] font-sans text-zinc-400 block leading-tight mt-0.5">
                Narrativa e anotações do Oráculo
              </span>
            </div>
          </button>

          {/* CONFIGURAÇÕES DE ÁUDIO & JOGO */}
          <button
            onClick={handleQuickSettings}
            className="p-3 rounded-2xl bg-black/55 hover:bg-amber-950/40 border border-white/10 hover:border-amber-500/50 text-left transition-all group flex flex-col justify-between gap-2 active:scale-[0.98] cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-950/80 border border-amber-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Settings className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <span className="text-xs font-serif font-bold text-zinc-100 group-hover:text-amber-300 block leading-tight">
                Configurações
              </span>
              <span className="text-[9.5px] font-sans text-zinc-400 block leading-tight mt-0.5">
                Músicas, efeitos sonoros e volume
              </span>
            </div>
          </button>
        </div>

        {/* 5. Quick Toggles Row (Audio Mute, Fullscreen, Mobile App Guide) */}
        <div className="p-2.5 rounded-2xl bg-black/60 border border-amber-900/30 flex items-center justify-around gap-2">
          {/* Mute toggle */}
          <button
            onClick={toggleMute}
            className={`flex-1 flex flex-col items-center gap-1 p-2 rounded-xl border transition-all active:scale-95 cursor-pointer ${
              isMuted
                ? 'bg-red-950/50 border-red-500/40 text-red-300'
                : 'bg-black/40 border-white/10 text-amber-300 hover:border-amber-500/40'
            }`}
            title={isMuted ? 'Ativar Som' : 'Silenciar Som'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
            <span className="text-[9px] font-mono uppercase font-bold">{isMuted ? 'Mudo' : 'Som Ligado'}</span>
          </button>

          {/* Fullscreen toggle */}
          <button
            onClick={toggleFullscreen}
            className="flex-1 flex flex-col items-center gap-1 p-2 rounded-xl bg-black/40 border border-white/10 text-zinc-300 hover:text-white hover:border-amber-500/40 transition-all active:scale-95 cursor-pointer"
            title="Alternar Tela Cheia"
          >
            <Maximize2 className="w-4 h-4 text-amber-400" />
            <span className="text-[9px] font-mono uppercase font-bold">Tela Cheia</span>
          </button>

          {/* App / PWA guide */}
          {onOpenMobileGuide && (
            <button
              onClick={() => {
                soundEngine.playClick();
                onClose();
                onOpenMobileGuide();
              }}
              className="flex-1 flex flex-col items-center gap-1 p-2 rounded-xl bg-black/40 border border-white/10 text-zinc-300 hover:text-white hover:border-amber-500/40 transition-all active:scale-95 cursor-pointer"
              title="Guia do App Mobile"
            >
              <Smartphone className="w-4 h-4 text-amber-400" />
              <span className="text-[9px] font-mono uppercase font-bold">App</span>
            </button>
          )}
        </div>

        {/* 6. Restart Game (Host Only) */}
        {isHost && onRestartGame && (
          <button
            onClick={() => {
              soundEngine.playClick();
              if (window.confirm('Deseja reiniciar a partida para a fase de preparação?')) {
                onClose();
                onRestartGame();
              }
            }}
            className="w-full py-2.5 px-3 rounded-2xl bg-amber-950/70 hover:bg-amber-900 border border-amber-500/40 text-amber-200 text-xs font-serif font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span>Reiniciar Esta Partida (Anfitrião)</span>
          </button>
        )}

        {/* 7. Exit Room Section with Confirmation */}
        <div className="pt-2 border-t border-amber-900/40">
          {!confirmLeave ? (
            <button
              onClick={() => {
                soundEngine.playClick();
                setConfirmLeave(true);
              }}
              className="w-full py-2.5 px-4 rounded-2xl bg-red-950/70 hover:bg-red-900/90 border border-red-500/50 text-red-100 text-xs font-serif font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 group cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-red-400 group-hover:-translate-x-0.5 transition-transform" />
              <span>SAIR DA SALA / PARTIDA</span>
            </button>
          ) : (
            <div className="p-3 rounded-2xl bg-red-950/95 border-2 border-red-500 flex flex-col gap-2.5 animate-fade-in text-center">
              <span className="text-xs font-serif font-bold text-red-100 uppercase tracking-wider">
                Tem certeza de que deseja abandonar a partida?
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    onClose();
                    onLeaveRoom();
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-red-700 hover:bg-red-600 text-white text-xs font-serif font-bold uppercase tracking-wider shadow-md active:scale-95 cursor-pointer"
                >
                  Sim, Sair Agora
                </button>
                <button
                  onClick={() => setConfirmLeave(false)}
                  className="flex-1 py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-serif font-bold uppercase tracking-wider active:scale-95 cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
