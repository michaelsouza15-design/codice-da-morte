import React, { useState } from 'react';
import { X, Shield, Sparkles } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';
import codiceMorteLivroImg from '../assets/images/codice_morte_livro_1787918785943.jpg';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmCreate: (config: {
    roomName: string;
    gameMode: 'CASUAL' | 'COMPETITIVO' | 'HISTÓRIA' | 'PERSONALIZADO';
    maxPlayers: number;
    roundDuration: number;
    maxRounds: number;
    difficulty: 'FÁCIL' | 'NORMAL' | 'DIFÍCIL' | 'ESPECIALISTA';
    botAccuracy: number;
    oracleSelection: 'random' | 'host' | 'custom';
    hasAccomplice: boolean;
    hasSaboteur: boolean;
    allowEvents?: boolean;
    allowAbilities?: boolean;
    includeBots?: boolean;
  }) => void;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  isOpen,
  onClose,
  onConfirmCreate,
}) => {
  const [roomName, setRoomName] = useState('Investigação Sombria');
  const [gameMode, setGameMode] = useState<'CASUAL' | 'COMPETITIVO' | 'HISTÓRIA' | 'PERSONALIZADO'>('CASUAL');
  const [playerCount, setPlayerCount] = useState<number>(10);
  const [roundDuration, setRoundDuration] = useState<number>(60);
  const [roundsCount, setRoundsCount] = useState<number>(3);
  const [difficulty, setDifficulty] = useState<'FÁCIL' | 'NORMAL' | 'DIFÍCIL' | 'ESPECIALISTA'>('NORMAL');
  const [botAccuracy, setBotAccuracy] = useState<number>(20);
  const [oracleSelection, setOracleSelection] = useState<'random' | 'host' | 'custom'>('random');
  const [hasAccomplice, setHasAccomplice] = useState<boolean>(true);
  const [hasSaboteur, setHasSaboteur] = useState<boolean>(false);
  const [allowEvents, setAllowEvents] = useState<boolean>(true);
  const [allowAbilities, setAllowAbilities] = useState<boolean>(true);
  const [includeBots, setIncludeBots] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCreate = () => {
    soundEngine.playVictory();
    onConfirmCreate({
      roomName: roomName.trim() || 'Investigação Sombria',
      gameMode,
      maxPlayers: playerCount,
      roundDuration,
      maxRounds: roundsCount,
      difficulty,
      botAccuracy,
      oracleSelection,
      hasAccomplice,
      hasSaboteur,
      allowEvents,
      allowAbilities,
      includeBots,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fade-in text-[#e8dfd8] overflow-hidden select-none">
      {/* Modal Container with Custom Gothic Background Artwork */}
      <div 
        className="relative w-full max-w-sm sm:max-w-md rounded-2xl sm:rounded-3xl border-2 border-[#b88c3a] shadow-[0_0_50px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col max-h-[96vh] bg-[#0c0907]"
        style={{
          backgroundImage: `url(${codiceMorteLivroImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dark Vignette Overlay to ensure perfect contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/80 to-black/95 pointer-events-none z-0" />
        
        {/* Gold filigree corner accents */}
        <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-[#e5b358] pointer-events-none z-20" />
        <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-[#e5b358] pointer-events-none z-20" />
        <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-[#e5b358] pointer-events-none z-20" />
        <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-[#e5b358] pointer-events-none z-20" />

        {/* Header matching reference */}
        <div className="relative z-10 pt-3.5 pb-2 px-4 border-b border-[#a67c32]/30 flex flex-col items-center justify-center">
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-[#1c1510] text-[#c9a75e] hover:text-white border border-[#a67c32]/50 hover:border-[#e5b358] transition-all"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>

          <h2 className="text-base sm:text-lg font-serif font-black text-[#f7e4ba] uppercase tracking-[0.25em] drop-shadow">
            CRIAR SALA
          </h2>
          <span className="text-[9px] sm:text-[10px] font-serif tracking-[0.25em] text-[#c9a75e] uppercase">
            CONFIGURAÇÕES DA PARTIDA
          </span>
        </div>

        {/* Content Body */}
        <div className="relative z-10 p-3.5 sm:p-5 flex flex-col space-y-2 sm:space-y-2.5 overflow-y-auto max-h-[85vh] custom-scrollbar">
          {/* 1. NOME DA SALA */}
          <div className="space-y-1">
            <label className="text-[10px] sm:text-xs font-serif font-bold uppercase tracking-[0.18em] text-[#e0b769] block">
              NOME DA SALA
            </label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Nome da sala..."
              maxLength={26}
              className="w-full bg-[#0d0a08]/95 border border-[#8a6828]/60 rounded-xl px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-serif text-[#f7e4ba] placeholder-[#6e5833] focus:outline-none focus:border-[#e5b358] focus:ring-1 focus:ring-[#e5b358]/40 shadow-inner tracking-wider"
            />
          </div>

          {/* 2. MODO DE JOGO */}
          <div className="space-y-1">
            <label className="text-[10px] sm:text-xs font-serif font-bold uppercase tracking-[0.18em] text-[#e0b769] block">
              MODO DE JOGO
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['CASUAL', 'COMPETITIVO', 'HISTÓRIA'] as const).map((mode) => {
                const isSelected = gameMode === mode;
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setGameMode(mode);
                    }}
                    className={`py-1.5 px-1 rounded-xl text-[10px] sm:text-xs font-serif font-bold tracking-wider uppercase transition-all border ${
                      isSelected
                        ? 'bg-gradient-to-b from-[#6e1010] to-[#3a0808] border-[#e5b358] text-[#f7e4ba] shadow-[0_0_12px_rgba(220,38,38,0.5)]'
                        : 'bg-[#120d09]/80 border-[#5e4722]/50 text-[#9c8464] hover:text-[#f7e4ba] hover:border-[#a67c32]'
                    }`}
                  >
                    {mode}
                  </button>
                );
              })}
            </div>
            <div className="grid grid-cols-1 mt-1">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setGameMode('PERSONALIZADO');
                }}
                className={`py-1.5 px-2 rounded-xl text-[10px] sm:text-xs font-serif font-bold tracking-widest uppercase transition-all border ${
                  gameMode === 'PERSONALIZADO'
                    ? 'bg-gradient-to-b from-[#6e1010] to-[#3a0808] border-[#e5b358] text-[#f7e4ba] shadow-[0_0_12px_rgba(220,38,38,0.5)]'
                    : 'bg-[#120d09]/80 border-[#5e4722]/50 text-[#9c8464] hover:text-[#f7e4ba] hover:border-[#a67c32]'
                }`}
              >
                PERSONALIZADO
              </button>
            </div>
          </div>

          {/* 3. Nº DE JOGADORES */}
          <div className="space-y-1">
            <label className="text-[10px] sm:text-xs font-serif font-bold uppercase tracking-[0.18em] text-[#e0b769] block">
              Nº DE JOGADORES (CAPACIDADE MÁXIMA)
            </label>
            <div className="grid grid-cols-7 gap-1">
              {[4, 5, 6, 7, 8, 9, 10].map((num) => {
                const isSelected = playerCount === num;
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setPlayerCount(num);
                    }}
                    className={`py-1.5 rounded-xl text-xs sm:text-sm font-mono font-bold transition-all border ${
                      isSelected
                        ? 'bg-gradient-to-b from-[#6e1010] to-[#3a0808] border-[#e5b358] text-[#f7e4ba] shadow-[0_0_10px_rgba(220,38,38,0.5)]'
                        : 'bg-[#120d09]/80 border-[#5e4722]/50 text-[#9c8464] hover:text-[#f7e4ba] hover:border-[#a67c32]'
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3.1 INCLUIR BOTS IA NA SALA */}
          <div className="p-2.5 rounded-2xl bg-[#140b07]/90 border border-[#8a6529]/50 space-y-1.5 shadow-md">
            <div className="flex items-center justify-between">
              <label className="text-[10px] sm:text-xs font-serif font-bold uppercase tracking-[0.18em] text-[#e0b769] block">
                INCLUIR BOTS (IA) AUTOMATICAMENTE?
              </label>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/60 border border-amber-600/40 text-[#c9a75e]">
                {includeBots ? 'SIM (Com Bots)' : 'NÃO (Só o Host)'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setIncludeBots(false);
                }}
                className={`py-2 px-2 rounded-xl text-[10px] sm:text-xs font-serif font-bold tracking-wider uppercase transition-all border text-center ${
                  !includeBots
                    ? 'bg-gradient-to-b from-[#6e1010] to-[#3a0808] border-[#e5b358] text-[#f7e4ba] shadow-[0_0_10px_rgba(220,38,38,0.5)]'
                    : 'bg-[#120d09]/80 border-[#5e4722]/50 text-[#9c8464] hover:text-[#f7e4ba] hover:border-[#a67c32]'
                }`}
              >
                NÃO (Apenas Eu como Host)
              </button>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setIncludeBots(true);
                }}
                className={`py-2 px-2 rounded-xl text-[10px] sm:text-xs font-serif font-bold tracking-wider uppercase transition-all border text-center ${
                  includeBots
                    ? 'bg-gradient-to-b from-[#6e1010] to-[#3a0808] border-[#e5b358] text-[#f7e4ba] shadow-[0_0_10px_rgba(220,38,38,0.5)]'
                    : 'bg-[#120d09]/80 border-[#5e4722]/50 text-[#9c8464] hover:text-[#f7e4ba] hover:border-[#a67c32]'
                }`}
              >
                SIM (Preencher com Bots)
              </button>
            </div>
            <p className="text-[9.5px] text-[#a89070] font-sans leading-tight">
              {!includeBots
                ? '✓ Você iniciará sozinho na sala. Compartilhe o QR Code ou link para amigos entrarem. Se quiser bots, adicione pelos botões no lobby.'
                : '✓ A sala será preenchida imediatamente com bots de inteligência artificial.'}
            </p>
          </div>

          {/* 4. DURAÇÃO DA RODADA */}
          <div className="space-y-1">
            <label className="text-[10px] sm:text-xs font-serif font-bold uppercase tracking-[0.18em] text-[#e0b769] block">
              DURAÇÃO DA RODADA
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[30, 60, 90, 120].map((dur) => {
                const isSelected = roundDuration === dur;
                return (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setRoundDuration(dur);
                    }}
                    className={`py-1.5 rounded-xl text-[11px] sm:text-xs font-mono font-bold transition-all border ${
                      isSelected
                        ? 'bg-gradient-to-b from-[#6e1010] to-[#3a0808] border-[#e5b358] text-[#f7e4ba] shadow-[0_0_10px_rgba(220,38,38,0.5)]'
                        : 'bg-[#120d09]/80 border-[#5e4722]/50 text-[#9c8464] hover:text-[#f7e4ba] hover:border-[#a67c32]'
                    }`}
                  >
                    {dur}s
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. NÚMERO DE RODADAS */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] sm:text-xs font-serif font-bold uppercase tracking-[0.18em] text-[#e0b769] block">
                NÚMERO DE RODADAS
              </label>
              <span className="text-[9px] font-mono text-[#c9a75e]">
                {roundsCount} {roundsCount === 1 ? 'Rodada' : 'Rodadas'}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1">
              {[1, 2, 3, 4, 5].map((r) => {
                const isSelected = roundsCount === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setRoundsCount(r);
                    }}
                    className={`py-1 rounded-xl text-[10px] sm:text-xs font-mono font-bold transition-all border ${
                      isSelected
                        ? 'bg-gradient-to-b from-[#6e1010] to-[#3a0808] border-[#e5b358] text-[#f7e4ba] shadow-[0_0_10px_rgba(220,38,38,0.5)]'
                        : 'bg-[#120d09]/80 border-[#5e4722]/50 text-[#9c8464] hover:text-[#f7e4ba] hover:border-[#a67c32]'
                    }`}
                  >
                    {r} {r === 1 ? 'R' : 'Rds'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6. DIFICULDADE (IA) */}
          <div className="space-y-1">
            <label className="text-[10px] sm:text-xs font-serif font-bold uppercase tracking-[0.18em] text-[#e0b769] block">
              DIFICULDADE (IA)
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['FÁCIL', 'NORMAL', 'DIFÍCIL', 'ESPECIALISTA'] as const).map((dif) => {
                const isSelected = difficulty === dif;
                return (
                  <button
                    key={dif}
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setDifficulty(dif);
                    }}
                    className={`py-1.5 px-0.5 rounded-xl text-[9px] sm:text-[11px] font-serif font-bold tracking-wider uppercase transition-all border truncate ${
                      isSelected
                        ? 'bg-gradient-to-b from-[#6e1010] to-[#3a0808] border-[#e5b358] text-[#f7e4ba] shadow-[0_0_10px_rgba(220,38,38,0.5)]'
                        : 'bg-[#120d09]/80 border-[#5e4722]/50 text-[#9c8464] hover:text-[#f7e4ba] hover:border-[#a67c32]'
                    }`}
                  >
                    {dif}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 7. PRECISÃO DE ACERTO DOS BOTS */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] sm:text-xs font-serif font-bold uppercase tracking-[0.18em] text-[#e0b769] block">
                TAXA DE ACERTO DOS BOTS
              </label>
              <span className="text-[9px] font-mono text-[#c9a75e]">
                {botAccuracy}% de chance
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { val: 10, label: '10% (Baixa)' },
                { val: 20, label: '20% (Padrão)' },
                { val: 35, label: '35% (Média)' },
                { val: 50, label: '50% (Alta)' },
              ].map((opt) => {
                const isSelected = botAccuracy === opt.val;
                return (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setBotAccuracy(opt.val);
                    }}
                    className={`py-1.5 px-0.5 rounded-xl text-[9px] sm:text-[11px] font-mono font-bold tracking-wider uppercase transition-all border truncate ${
                      isSelected
                        ? 'bg-gradient-to-b from-[#6e1010] to-[#3a0808] border-[#e5b358] text-[#f7e4ba] shadow-[0_0_10px_rgba(220,38,38,0.5)]'
                        : 'bg-[#120d09]/80 border-[#5e4722]/50 text-[#9c8464] hover:text-[#f7e4ba] hover:border-[#a67c32]'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 8. PAPEL DO ORÁCULO / NARRADOR */}
          <div className="space-y-1">
            <label className="text-[10px] sm:text-xs font-serif font-bold uppercase tracking-[0.18em] text-[#e0b769] flex items-center justify-between">
              <span>ORÁCULO / NARRADOR</span>
              <span className="text-[9px] font-mono text-[#c9a75e] font-normal">
                {oracleSelection === 'random' ? 'Sorteio aleatório' : oracleSelection === 'host' ? 'Você será o Oráculo' : 'Escolher no Lobby'}
              </span>
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'random', label: '🎲 ALEATÓRIO' },
                { id: 'host', label: '👑 EU (HOST)' },
                { id: 'custom', label: '🎯 NO LOBBY' },
              ].map((opt) => {
                const isSelected = oracleSelection === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setOracleSelection(opt.id as any);
                    }}
                    className={`py-1.5 px-1 rounded-xl text-[9px] sm:text-[11px] font-serif font-bold tracking-wider uppercase transition-all border truncate ${
                      isSelected
                        ? 'bg-gradient-to-b from-[#6e1010] to-[#3a0808] border-[#e5b358] text-[#f7e4ba] shadow-[0_0_10px_rgba(220,38,38,0.5)]'
                        : 'bg-[#120d09]/80 border-[#5e4722]/50 text-[#9c8464] hover:text-[#f7e4ba] hover:border-[#a67c32]'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 9. PAPÉIS ESPECIAIS & REGRAS (4 SWITCHES LADO A LADO COMO NA REFERÊNCIA) */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            {/* Cúmplice Toggle */}
            <div className="p-2 rounded-xl bg-[#140b18]/80 border border-purple-500/40 space-y-1">
              <label className="text-[9px] sm:text-[10px] font-serif font-bold uppercase tracking-wider text-purple-300 flex items-center justify-between">
                <span>CÚMPLICE</span>
                <span className="text-[8px] font-mono text-purple-400">{hasAccomplice ? 'ATIVO' : 'DESLIGADO'}</span>
              </label>
              <div className="grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setHasAccomplice(true);
                  }}
                  className={`py-1 rounded-lg text-[9px] sm:text-[10px] font-serif font-bold tracking-wider transition-all border ${
                    hasAccomplice
                      ? 'bg-gradient-to-b from-purple-800 to-purple-950 border-purple-300 text-purple-100 shadow-sm'
                      : 'bg-black/60 border-white/10 text-zinc-500 hover:text-white'
                  }`}
                >
                  SIM
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setHasAccomplice(false);
                  }}
                  className={`py-1 rounded-lg text-[9px] sm:text-[10px] font-serif font-bold tracking-wider transition-all border ${
                    !hasAccomplice
                      ? 'bg-zinc-800 border-zinc-500 text-zinc-200 shadow-sm'
                      : 'bg-black/60 border-white/10 text-zinc-500 hover:text-white'
                  }`}
                >
                  NÃO
                </button>
              </div>
            </div>

            {/* Sabotador Toggle */}
            <div className="p-2 rounded-xl bg-[#1c1507]/80 border border-amber-500/40 space-y-1">
              <label className="text-[9px] sm:text-[10px] font-serif font-bold uppercase tracking-wider text-amber-300 flex items-center justify-between">
                <span>SABOTADOR</span>
                <span className="text-[8px] font-mono text-amber-400">{hasSaboteur ? 'ATIVO' : 'DESLIGADO'}</span>
              </label>
              <div className="grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setHasSaboteur(true);
                  }}
                  className={`py-1 rounded-lg text-[9px] sm:text-[10px] font-serif font-bold tracking-wider transition-all border ${
                    hasSaboteur
                      ? 'bg-gradient-to-b from-amber-700 to-amber-950 border-amber-300 text-amber-100 shadow-sm'
                      : 'bg-black/60 border-white/10 text-zinc-500 hover:text-white'
                  }`}
                >
                  SIM
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setHasSaboteur(false);
                  }}
                  className={`py-1 rounded-lg text-[9px] sm:text-[10px] font-serif font-bold tracking-wider transition-all border ${
                    !hasSaboteur
                      ? 'bg-zinc-800 border-zinc-500 text-zinc-200 shadow-sm'
                      : 'bg-black/60 border-white/10 text-zinc-500 hover:text-white'
                  }`}
                >
                  NÃO
                </button>
              </div>
            </div>

            {/* Eventos Toggle */}
            <div className="p-2 rounded-xl bg-[#1c0c07]/80 border border-orange-500/40 space-y-1">
              <label className="text-[9px] sm:text-[10px] font-serif font-bold uppercase tracking-wider text-orange-300 flex items-center justify-between">
                <span>EVENTOS</span>
                <span className="text-[8px] font-mono text-orange-400">{allowEvents ? 'ATIVO' : 'DESLIGADO'}</span>
              </label>
              <div className="grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setAllowEvents(true);
                  }}
                  className={`py-1 rounded-lg text-[9px] sm:text-[10px] font-serif font-bold tracking-wider transition-all border ${
                    allowEvents
                      ? 'bg-gradient-to-b from-orange-700 to-orange-950 border-orange-300 text-orange-100 shadow-sm'
                      : 'bg-black/60 border-white/10 text-zinc-500 hover:text-white'
                  }`}
                >
                  SIM
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setAllowEvents(false);
                  }}
                  className={`py-1 rounded-lg text-[9px] sm:text-[10px] font-serif font-bold tracking-wider transition-all border ${
                    !allowEvents
                      ? 'bg-zinc-800 border-zinc-500 text-zinc-200 shadow-sm'
                      : 'bg-black/60 border-white/10 text-zinc-500 hover:text-white'
                  }`}
                >
                  NÃO
                </button>
              </div>
            </div>

            {/* Habilidades Toggle */}
            <div className="p-2 rounded-xl bg-[#081717]/80 border border-teal-500/40 space-y-1">
              <label className="text-[9px] sm:text-[10px] font-serif font-bold uppercase tracking-wider text-teal-300 flex items-center justify-between">
                <span>HABILIDADES</span>
                <span className="text-[8px] font-mono text-teal-400">{allowAbilities ? 'ATIVO' : 'DESLIGADO'}</span>
              </label>
              <div className="grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setAllowAbilities(true);
                  }}
                  className={`py-1 rounded-lg text-[9px] sm:text-[10px] font-serif font-bold tracking-wider transition-all border ${
                    allowAbilities
                      ? 'bg-gradient-to-b from-teal-700 to-teal-950 border-teal-300 text-teal-100 shadow-sm'
                      : 'bg-black/60 border-white/10 text-zinc-500 hover:text-white'
                  }`}
                >
                  SIM
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setAllowAbilities(false);
                  }}
                  className={`py-1 rounded-lg text-[9px] sm:text-[10px] font-serif font-bold tracking-wider transition-all border ${
                    !allowAbilities
                      ? 'bg-zinc-800 border-zinc-500 text-zinc-200 shadow-sm'
                      : 'bg-black/60 border-white/10 text-zinc-500 hover:text-white'
                  }`}
                >
                  NÃO
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Action: CRIAR SALA */}
          <div className="pt-2 sm:pt-3">
            <button
              onClick={handleCreate}
              className="w-full py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-b from-[#6e1010] via-[#480909] to-[#200404] hover:from-[#871616] hover:to-[#2e0505] border-2 border-[#e5b358] text-[#f7e4ba] font-serif font-black text-sm sm:text-base uppercase tracking-[0.25em] shadow-[0_4px_25px_rgba(110,16,16,0.8)] transition-all transform hover:scale-[1.01] active:scale-[0.98]"
            >
              CRIAR SALA
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
