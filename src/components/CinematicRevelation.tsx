import React, { useState, useEffect, useRef, useMemo } from 'react';
import { RoomState } from '../types/game';
import { METHODS, OBJECTS, CHARACTERS } from '../data/gameData';
import { MethodCard, ObjectCard, EvidenceCard } from './GothicCard';
import { GothicAvatar } from './GothicAvatar';
import confetti from 'canvas-confetti';
import oraculoVitoriaBg from '../assets/images/oraculo_vitoria_bg_1788105277229.jpg';
import oraculoDerrotaBg from '../assets/images/oraculo_derrota_bg_1788105291744.jpg';
import {
  Skull,
  Trophy,
  RotateCcw,
  Sparkles,
  Home,
  Flame,
  Hourglass,
  Disc,
  BookOpen,
  Eye,
  Shield,
  HelpCircle,
  ChevronRight,
  ArrowLeft,
  Layers,
  Coins,
} from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';
import { addProgressionRewards, loadProgression, getXpRequiredForLevel, PlayerProgression } from '../utils/progression';

interface CinematicRevelationProps {
  room: RoomState;
  myPlayerId?: string;
  onRestartGame: () => void;
  onReturnToMainMenu?: () => void;
}

export const CinematicRevelation: React.FC<CinematicRevelationProps> = ({
  room,
  myPlayerId,
  onRestartGame,
  onReturnToMainMenu,
}) => {
  const [showDetailedDossier, setShowDetailedDossier] = useState<boolean>(false);
  const [progressionResult, setProgressionResult] = useState<{
    xpGained: number;
    coinsGained: number;
    didLevelUp: boolean;
    newLevel: number;
    currentXp: number;
    requiredXp: number;
    totalCoins: number;
  } | null>(null);
  const rewardsGrantedRef = useRef<boolean>(false);

  const solution = room.secretSolution;
  const killerPlayer = room.players.find((p) => p.id === solution?.killerPlayerId);
  const killerChar = CHARACTERS.find((c) => c.id === killerPlayer?.characterId);
  const method = METHODS.find((m) => m.id === solution?.methodId);
  const object = OBJECTS.find((o) => o.id === solution?.objectId);

  // Player identity & Role-based Outcome determination
  const myPlayer = room.players.find((p) => p.id === myPlayerId);
  const myRole = myPlayer?.role;
  const isOracle = myRole === 'oraculo';
  const isEvilTeam = myRole === 'assassino' || myRole === 'cumplice' || myRole === 'sabotador';

  // Regras de Vitória e Derrota:
  // 1. Oráculo sempre irá ver o da Vitória.
  // 2. Investigadores ganham quando descobrem o assassino, método e objeto (room.winner === 'investigadores'):
  //    - Investigadores: VITÓRIA
  //    - Assassino, Cúmplice e Sabotador: DERROTA
  // 3. Lógica inversa quando os investigadores perdem (room.winner !== 'investigadores', ex: todos erram acusação ou rodadas esgotam):
  //    - Investigadores: DERROTA
  //    - Assassino, Cúmplice e Sabotador: VITÓRIA
  let isVictory = false;
  if (isOracle) {
    isVictory = true;
  } else if (room.winner === 'investigadores') {
    isVictory = !isEvilTeam;
  } else {
    // Assassino venceu / investigadores perderam
    isVictory = isEvilTeam;
  }

  // Se a combinação do crime é visível nos slots da acusação final
  const showSolutionSlots = isVictory || room.winner === 'investigadores' || isEvilTeam || isOracle;

  // Real Match Statistics calculation
  const totalRounds = room.roundsPlayed || room.round || 1;

  const totalMatchSeconds = useMemo(() => {
    if (typeof room.totalElapsedSeconds === 'number' && room.totalElapsedSeconds > 0) {
      return room.totalElapsedSeconds;
    }
    if (room.startedAt) {
      const end = room.endedAt || Date.now();
      return Math.max(1, Math.round((end - room.startedAt) / 1000));
    }
    // Fallback: estimate from logs if available
    if (room.logs && room.logs.length >= 2) {
      const first = room.logs[0]?.timestamp;
      const last = room.logs[room.logs.length - 1]?.timestamp;
      if (first && last && first !== last) {
        const [h1, m1] = first.split(':').map(Number);
        const [h2, m2] = last.split(':').map(Number);
        if (!isNaN(h1) && !isNaN(m1) && !isNaN(h2) && !isNaN(m2)) {
          const diffMin = (h2 * 60 + m2) - (h1 * 60 + m1);
          if (diffMin > 0 && diffMin < 720) {
            return diffMin * 60;
          }
        }
      }
    }
    return 0;
  }, [room.totalElapsedSeconds, room.startedAt, room.endedAt, room.logs]);

  const realDurationFormatted = useMemo(() => {
    if (totalMatchSeconds <= 0) return '01:20';
    const m = Math.floor(totalMatchSeconds / 60);
    const s = totalMatchSeconds % 60;
    const pad = (n: number) => String(n).padStart(2, '0');
    if (m >= 60) {
      const h = Math.floor(m / 60);
      const remM = m % 60;
      return `${pad(h)}:${pad(remM)}:${pad(s)}`;
    }
    return `${pad(m)}:${pad(s)}`;
  }, [totalMatchSeconds]);

  const presentedEvidencesCount = useMemo(() => {
    const ids = new Set<string>([
      ...(room.presentedEvidenceIds || []),
      ...(room.evidencesOnTable || []).map((e) => e.id),
      ...(room.discardedEvidences || []).map((e) => e.id),
    ]);
    return ids.size || (room.evidencesOnTable?.length || 6);
  }, [room.presentedEvidenceIds, room.evidencesOnTable, room.discardedEvidences]);

  const abilitiesUsedCount = useMemo(() => {
    if (typeof room.abilitiesUsedCount === 'number') {
      return room.abilitiesUsedCount;
    }
    const fromLogs = room.logs?.filter((l) => l.type === 'ability').length || 0;
    const fromPlayers = room.players.filter((p) => p.abilityUsed).length || 0;
    return Math.max(fromLogs, fromPlayers);
  }, [room.abilitiesUsedCount, room.logs, room.players]);

  const eventsActivatedCount = useMemo(() => {
    if (typeof room.eventsActivatedCount === 'number') {
      return room.eventsActivatedCount;
    }
    return (
      room.logs?.filter(
        (l) =>
          l.type === 'event' &&
          (l.text.includes('EVENTO') ||
            l.text.includes('INVOCADO') ||
            l.text.includes('DESENCADEADO') ||
            l.text.includes('invocou'))
      ).length || 0
    );
  }, [room.eventsActivatedCount, room.logs]);

  const getOutcomeSubtitle = () => {
    if (isVictory) {
      if (myRole === 'assassino') {
        return 'VOCÊ ESCAPOU IMPUNE! O CRIME PERMANECEU OCULTO.';
      }
      if (myRole === 'cumplice') {
        return 'O ASSASSINO ESCAPOU IMPUNE COM SUA AJUDA!';
      }
      if (myRole === 'sabotador') {
        return 'O CAOS PREVALECEU! OS INVESTIGADORES FALHARAM.';
      }
      if (myRole === 'oraculo') {
        return room.winner === 'investigadores'
          ? 'A VERDADE FOI REVELADA AOS MORTAIS.'
          : 'O DESTINO FOI CUMPRIDO NAS SOMBRAS.';
      }
      return 'A VERDADE FOI REVELADA. O ASSASSINO FOI CAPTURADO!';
    } else {
      if (myRole === 'assassino') {
        return 'SEU CRIME FOI DESVENDADO! VOCÊ FOI CAPTURADO.';
      }
      if (myRole === 'cumplice') {
        return 'O DISFARCE CAIU! O ASSASSINO FOI DESCOBERTO.';
      }
      if (myRole === 'sabotador') {
        return 'SUA TRAMA FALHOU! A VERDADE PREVALECEU.';
      }
      return 'O ASSASSINO PERMANECE EM LIBERDADE.';
    }
  };

  const getOracleQuote = () => {
    if (isVictory) {
      if (isEvilTeam) {
        return '“AS SOMBRAS DA ABADIA ENCOBRIRAM SEUS PASSOS COM PERFEIÇÃO.”';
      }
      return '“O CÓDICE REVELA, MAS SÓ A MENTE OBSERVADORA DESCOBRE.”';
    } else {
      if (isEvilTeam) {
        return '“NENHUM CRIME PERMANECE OCULTO PARA SEMPRE DIANTE DOS OLHOS DA VERDADE.”';
      }
      return '“NEM TODA INVESTIGAÇÃO ENCONTRA A VERDADE. ALGUMAS APENAS ALIMENTAM AS SOMBRAS.”';
    }
  };

  // Sound triggers & Level/Coin progression rewards on mount
  useEffect(() => {
    soundEngine.playCathedralBell();
    if (isVictory) {
      soundEngine.playFanfare?.();
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.4 },
        colors: ['#f59e0b', '#ef4444', '#10b981', '#ffffff', '#ffd700'],
      });
    } else {
      soundEngine.playDramaticSting?.();
    }

    if (!rewardsGrantedRef.current) {
      rewardsGrantedRef.current = true;
      const xp = isVictory ? 250 : 90;
      const coins = isVictory ? 120 : 45;
      const res = addProgressionRewards(xp, coins, isVictory, myRole || 'investigador');
      const reqXp = getXpRequiredForLevel(res.updated.level);
      setProgressionResult({
        xpGained: xp,
        coinsGained: coins,
        didLevelUp: res.didLevelUp,
        newLevel: res.updated.level,
        currentXp: res.updated.xp,
        requiredXp: reqXp,
        totalCoins: res.updated.coins,
      });
    }
  }, [isVictory, myRole]);

  return (
    <div
      id="cinematic-revelation-screen"
      className="fixed inset-0 z-50 overflow-y-auto bg-black text-[#eedec5] flex flex-col justify-between p-3 sm:p-6 animate-fade-in select-none"
    >
      {/* BACKGROUND IMAGE (ORACLE GLOWING ON VICTORY / DESPAIR ON DEFEAT) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <img
          src={isVictory ? oraculoVitoriaBg : oraculoDerrotaBg}
          alt={isVictory ? 'Oráculo Vitória' : 'Oráculo Derrota'}
          className="w-full h-full object-cover opacity-60 mix-blend-screen scale-105 transition-all duration-1000"
          referrerPolicy="no-referrer"
        />
        {/* Dark Vignette & Atmospheric Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/80" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_30%,_black_90%)]" />
      </div>

      {/* =========================================================================
          VIEW 1: FAITHFUL MATCH TO CHATGPT IMAGE 30 (VITÓRIA / DERROTA GRIMOIRE)
          ========================================================================= */}
      {!showDetailedDossier ? (
        <div className="relative z-10 max-w-lg mx-auto w-full flex flex-col items-center justify-between min-h-full py-2 space-y-4">
          {/* 1. TOP HEADER: CÓDICE DA MORTE & GRIMÓRIO DO ORÁCULO */}
          <div className="text-center space-y-1.5 pt-1">
            <div>
              <h1 className="text-base sm:text-lg font-serif font-black tracking-[0.3em] text-[#dc2626] uppercase drop-shadow-[0_2px_6px_rgba(220,38,38,0.8)]">
                CÓDICE DA MORTE
              </h1>
              <span className="text-[10px] sm:text-xs font-serif font-bold tracking-[0.25em] text-amber-300/80 uppercase block">
                — GRIMÓRIO DO ORÁCULO —
              </span>
            </div>

            {myPlayer && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 border border-amber-900/60 shadow-inner text-[10px] sm:text-xs font-serif">
                <span className="text-zinc-400 uppercase tracking-wider">Seu Papel:</span>
                <span
                  className={`font-black uppercase tracking-widest ${
                    myRole === 'assassino'
                      ? 'text-red-400'
                      : myRole === 'oraculo'
                      ? 'text-purple-400'
                      : myRole === 'cumplice'
                      ? 'text-rose-400'
                      : myRole === 'sabotador'
                      ? 'text-amber-400'
                      : 'text-blue-300'
                  }`}
                >
                  {myRole === 'assassino'
                    ? 'Assassino'
                    : myRole === 'oraculo'
                    ? 'Oráculo'
                    : myRole === 'cumplice'
                    ? 'Cúmplice'
                    : myRole === 'sabotador'
                    ? 'Sabotador'
                    : 'Investigador'}
                </span>
              </div>
            )}
          </div>

          {/* 2. MAIN TITLE WITH FILIGREE WINGS: ✦ VITÓRIA ✦ / ✦ DERROTA ✦ */}
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              <span className={`text-xs ${isVictory ? 'text-amber-400' : 'text-red-500'}`}>✦ ✦</span>
              <h2
                className={`text-2xl sm:text-4xl font-serif font-black uppercase tracking-[0.25em] drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] ${
                  isVictory
                    ? 'text-[#f59e0b] shadow-amber-500/50'
                    : 'text-[#ef4444] shadow-red-500/50'
                }`}
              >
                {isVictory ? 'VITÓRIA' : 'DERROTA'}
              </h2>
              <span className={`text-xs ${isVictory ? 'text-amber-400' : 'text-red-500'}`}>✦ ✦</span>
            </div>
            <p
              className={`text-[10px] sm:text-xs font-serif font-bold uppercase tracking-[0.2em] px-2 ${
                isVictory ? 'text-amber-200/90' : 'text-red-300/90'
              }`}
            >
              {getOutcomeSubtitle()}
            </p>
          </div>

          {/* 3. SECTION: — RESUMO DA INVESTIGAÇÃO — */}
          <div className="w-full space-y-2.5">
            <div className="flex items-center justify-center gap-2">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-700/50" />
              <span className="text-[10px] sm:text-xs font-serif font-black tracking-[0.2em] text-amber-300 uppercase">
                — RESUMO DA INVESTIGAÇÃO —
              </span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-700/50" />
            </div>

            {/* 5 Stat Badges Row matching Image 30 */}
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {/* Stat 1: Rodadas */}
              <div id="stat-box-rounds" className="flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl bg-black/70 border border-amber-900/60 shadow-inner text-center">
                <div className="w-6 h-6 rounded-full bg-amber-950/80 border border-amber-500/40 flex items-center justify-center mb-1">
                  <Disc className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <span className="text-[7.5px] sm:text-[8.5px] font-serif font-bold text-amber-200/80 uppercase tracking-wider leading-tight">
                  RODADAS
                </span>
                <span className="text-xs sm:text-sm font-mono font-black text-amber-300">
                  {totalRounds}
                </span>
              </div>

              {/* Stat 2: Tempo Total */}
              <div id="stat-box-tempo" className="flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl bg-black/70 border border-amber-900/60 shadow-inner text-center">
                <div className="w-6 h-6 rounded-full bg-amber-950/80 border border-amber-500/40 flex items-center justify-center mb-1">
                  <Hourglass className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <span className="text-[7.5px] sm:text-[8.5px] font-serif font-bold text-amber-200/80 uppercase tracking-wider leading-tight">
                  TEMPO
                </span>
                <span className="text-xs sm:text-sm font-mono font-black text-amber-300">
                  {realDurationFormatted}
                </span>
              </div>

              {/* Stat 3: Pistas Apresentadas */}
              <div id="stat-box-pistas" className="flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl bg-black/70 border border-amber-900/60 shadow-inner text-center">
                <div className="w-6 h-6 rounded-full bg-amber-950/80 border border-amber-500/40 flex items-center justify-center mb-1">
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <span className="text-[7.5px] sm:text-[8.5px] font-serif font-bold text-amber-200/80 uppercase tracking-wider leading-tight">
                  PISTAS
                </span>
                <span className="text-xs sm:text-sm font-mono font-black text-amber-300">
                  {presentedEvidencesCount}
                </span>
              </div>

              {/* Stat 4: Habilidades Usadas */}
              <div id="stat-box-habilidades" className="flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl bg-black/70 border border-amber-900/60 shadow-inner text-center">
                <div className="w-6 h-6 rounded-full bg-amber-950/80 border border-amber-500/40 flex items-center justify-center mb-1">
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <span className="text-[7.5px] sm:text-[8.5px] font-serif font-bold text-amber-200/80 uppercase tracking-wider leading-tight">
                  HABILID.
                </span>
                <span className="text-xs sm:text-sm font-mono font-black text-amber-300">
                  {abilitiesUsedCount}
                </span>
              </div>

              {/* Stat 5: Eventos Ativados */}
              <div id="stat-box-eventos" className="flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl bg-black/70 border border-amber-900/60 shadow-inner text-center">
                <div className="w-6 h-6 rounded-full bg-amber-950/80 border border-amber-500/40 flex items-center justify-center mb-1">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <span className="text-[7.5px] sm:text-[8.5px] font-serif font-bold text-amber-200/80 uppercase tracking-wider leading-tight">
                  EVENTOS
                </span>
                <span className="text-xs sm:text-sm font-mono font-black text-amber-300">
                  {eventsActivatedCount}
                </span>
              </div>
            </div>
          </div>

          {/* 4. SECTION: — ACUSAÇÃO FINAL — */}
          <div className="w-full space-y-2.5">
            <div className="flex items-center justify-center gap-2">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-700/50" />
              <span className="text-[10px] sm:text-xs font-serif font-black tracking-[0.2em] text-amber-300 uppercase">
                — ACUSAÇÃO FINAL —
              </span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-700/50" />
            </div>

            {/* 3 Circular Accusation Slots matching Image 30 */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {/* Slot 1: Assassino */}
              <div className="flex flex-col items-center text-center space-y-1.5 p-2 rounded-2xl bg-black/60 border border-amber-950/80 shadow-md">
                <span className="text-[9px] font-serif font-black tracking-wider text-amber-300 uppercase">
                  ASSASSINO
                </span>

                {showSolutionSlots ? (
                  <>
                    <div
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full p-0.5 ${
                        isVictory
                          ? 'bg-gradient-to-b from-amber-400 via-amber-600 to-amber-950 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                          : 'bg-gradient-to-b from-red-600 via-red-950 to-black shadow-[0_0_12px_rgba(239,68,68,0.5)]'
                      }`}
                    >
                      <div className="w-full h-full rounded-full overflow-hidden border border-black bg-black flex items-center justify-center">
                        <GothicAvatar
                          characterId={killerPlayer?.characterId || 'alchemist'}
                          name={killerPlayer?.name || 'Assassino'}
                          size="md"
                          glow={false}
                        />
                      </div>
                    </div>
                    <span
                      className={`text-[10px] sm:text-xs font-serif font-black drop-shadow truncate max-w-full ${
                        isVictory ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {killerPlayer?.name || 'Lívia Moretti'}
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full p-0.5 bg-gradient-to-b from-red-600 via-red-950 to-black shadow-[0_0_12px_rgba(239,68,68,0.4)]">
                      <div className="w-full h-full rounded-full overflow-hidden border border-black bg-black flex items-center justify-center">
                        <HelpCircle className="w-6 h-6 text-red-500/80" />
                      </div>
                    </div>
                    <span className="text-[10px] sm:text-xs font-serif font-bold text-red-500 tracking-wider truncate max-w-full">
                      DESCONHECIDO
                    </span>
                  </>
                )}
              </div>

              {/* Slot 2: Objeto */}
              <div className="flex flex-col items-center text-center space-y-1.5 p-2 rounded-2xl bg-black/60 border border-amber-950/80 shadow-md">
                <span className="text-[9px] font-serif font-black tracking-wider text-amber-300 uppercase">
                  OBJETO
                </span>

                {showSolutionSlots ? (
                  <>
                    <div
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full p-0.5 ${
                        isVictory
                          ? 'bg-gradient-to-b from-amber-400 via-amber-600 to-amber-950 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                          : 'bg-gradient-to-b from-red-600 via-red-950 to-black shadow-[0_0_12px_rgba(239,68,68,0.5)]'
                      }`}
                    >
                      <div className="w-full h-full rounded-full overflow-hidden border border-black bg-[#160c03] flex items-center justify-center p-1">
                        <span className="text-xl">🪔</span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] sm:text-xs font-serif font-black drop-shadow truncate max-w-full ${
                        isVictory ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {object?.name || 'Lâmpada de Óleo'}
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full p-0.5 bg-gradient-to-b from-red-600 via-red-950 to-black shadow-[0_0_12px_rgba(239,68,68,0.4)]">
                      <div className="w-full h-full rounded-full overflow-hidden border border-black bg-black flex items-center justify-center">
                        <HelpCircle className="w-6 h-6 text-red-500/80" />
                      </div>
                    </div>
                    <span className="text-[10px] sm:text-xs font-serif font-bold text-red-500 tracking-wider truncate max-w-full">
                      DESCONHECIDO
                    </span>
                  </>
                )}
              </div>

              {/* Slot 3: Método */}
              <div className="flex flex-col items-center text-center space-y-1.5 p-2 rounded-2xl bg-black/60 border border-amber-950/80 shadow-md">
                <span className="text-[9px] font-serif font-black tracking-wider text-amber-300 uppercase">
                  MÉTODO
                </span>

                {showSolutionSlots ? (
                  <>
                    <div
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full p-0.5 ${
                        isVictory
                          ? 'bg-gradient-to-b from-amber-400 via-amber-600 to-amber-950 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                          : 'bg-gradient-to-b from-red-600 via-red-950 to-black shadow-[0_0_12px_rgba(239,68,68,0.5)]'
                      }`}
                    >
                      <div className="w-full h-full rounded-full overflow-hidden border border-black bg-[#160604] flex items-center justify-center p-1">
                        <span className="text-xl">🗡️</span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] sm:text-xs font-serif font-black drop-shadow truncate max-w-full ${
                        isVictory ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {method?.name || 'Asfixia Silenciosa'}
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full p-0.5 bg-gradient-to-b from-red-600 via-red-950 to-black shadow-[0_0_12px_rgba(239,68,68,0.4)]">
                      <div className="w-full h-full rounded-full overflow-hidden border border-black bg-black flex items-center justify-center">
                        <HelpCircle className="w-6 h-6 text-red-500/80" />
                      </div>
                    </div>
                    <span className="text-[10px] sm:text-xs font-serif font-bold text-red-500 tracking-wider truncate max-w-full">
                      DESCONHECIDO
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* PROGRESSION & COINS REWARDS BOX */}
          {progressionResult && (
            <div className="w-full p-2.5 sm:p-3 rounded-2xl bg-gradient-to-r from-[#1c0e08] via-[#2a1309] to-[#1c0e08] border border-amber-500/50 shadow-xl space-y-2 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs font-serif font-black tracking-wider text-amber-300 uppercase flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  Recompensas da Partida
                </span>
                <span className="text-[10px] font-mono text-amber-400 font-bold bg-amber-950/80 px-2 py-0.5 rounded-lg border border-amber-500/40">
                  NÍVEL {progressionResult.newLevel}
                </span>
              </div>

              {/* XP and Coins Pills */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-xl bg-black/60 border border-amber-900/50 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="text-[9px] font-serif uppercase tracking-wider text-zinc-300">XP Ganho</span>
                  </div>
                  <span className="text-xs sm:text-sm font-mono font-black text-amber-300">
                    +{progressionResult.xpGained} XP
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-black/60 border border-amber-900/50 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-yellow-400" />
                    <span className="text-[9px] font-serif uppercase tracking-wider text-zinc-300">Moedas</span>
                  </div>
                  <span className="text-xs sm:text-sm font-mono font-black text-yellow-300">
                    +{progressionResult.coinsGained} 🪙
                  </span>
                </div>
              </div>

              {/* XP Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[8.5px] font-mono text-amber-200/80">
                  <span>Progresso para Nível {progressionResult.newLevel + 1}</span>
                  <span>{progressionResult.currentXp} / {progressionResult.requiredXp} XP</span>
                </div>
                <div className="h-1.5 w-full bg-black rounded-full overflow-hidden border border-amber-900/60">
                  <div
                    className="h-full bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-500 rounded-full transition-all duration-1000"
                    style={{
                      width: `${Math.min(100, Math.round((progressionResult.currentXp / progressionResult.requiredXp) * 100))}%`,
                    }}
                  />
                </div>
              </div>

              {progressionResult.didLevelUp && (
                <div className="p-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-500 text-black text-center font-serif font-black text-[10px] sm:text-xs uppercase tracking-widest animate-pulse shadow-lg">
                  🎉 SUBIU DE NÍVEL! NÍVEL {progressionResult.newLevel} ALCANÇADO (+150 MOEDAS BÔNUS)
                </div>
              )}
            </div>
          )}

          {/* 5. BIG ACTION BUTTON: CONTINUAR / NOVA PARTIDA */}
          <div className="w-full space-y-2 pt-1">
            <button
              id="revelation-continue-btn"
              onClick={() => {
                soundEngine.playClick();
                onRestartGame();
              }}
              className={`w-full py-3.5 rounded-2xl font-serif font-black text-xs sm:text-sm uppercase tracking-[0.25em] transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-2 border ${
                isVictory
                  ? 'bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-500 text-black border-amber-300 shadow-amber-950/90'
                  : 'bg-gradient-to-r from-red-950 via-red-900 to-red-950 hover:from-red-900 hover:to-red-800 text-amber-200 border-red-500/60 shadow-red-950/90'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              <span>CONTINUAR</span>
            </button>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setShowDetailedDossier(true);
                }}
                className="text-[11px] font-serif font-bold text-amber-300/90 hover:text-white uppercase tracking-wider underline underline-offset-4 flex items-center gap-1"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Ver Dossiê Completo de Papéis</span>
              </button>
              {onReturnToMainMenu && (
                <>
                  <span className="text-zinc-600">•</span>
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      onReturnToMainMenu();
                    }}
                    className="text-[11px] font-serif font-bold text-zinc-400 hover:text-white uppercase tracking-wider flex items-center gap-1"
                  >
                    <Home className="w-3.5 h-3.5" />
                    <span>Lobby</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* 6. ORACLE'S MYSTICAL QUOTE AT BOTTOM */}
          <div className="text-center px-4 pt-1 border-t border-amber-900/30 w-full">
            <p className="text-[9.5px] sm:text-[10.5px] font-serif italic text-zinc-300/90 max-w-md mx-auto leading-relaxed">
              {getOracleQuote()}
            </p>
            <span className="text-[8.5px] font-serif font-bold tracking-widest text-amber-400/80 uppercase block mt-0.5">
              — ORÁCULO
            </span>
          </div>
        </div>
      ) : (
        /* =========================================================================
           VIEW 2: DETAILED BREAKDOWN & PLAYER ROLES DOSSIER
           ========================================================================= */
        <div className="relative z-10 max-w-3xl mx-auto w-full space-y-4 py-3">
          {/* Top Bar with Back Button */}
          <div className="flex items-center justify-between border-b border-amber-950 pb-3">
            <button
              onClick={() => {
                soundEngine.playClick();
                setShowDetailedDossier(false);
              }}
              className="flex items-center gap-1 text-amber-300 hover:text-white text-xs font-serif uppercase tracking-wider"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao Resumo do Oráculo</span>
            </button>
            <span className="text-xs font-serif font-black text-amber-200 uppercase tracking-widest">
              DOSSIÊ COMPLETO DA ABADIA
            </span>
          </div>

          {/* Solution Cards */}
          <div className="p-4 rounded-2xl bg-black/70 border border-amber-500/40 space-y-3">
            <h3 className="text-xs font-serif font-black text-amber-300 uppercase tracking-widest text-center">
              COMBINAÇÃO SECRETA DO CRIME
            </h3>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {method && (
                <div className="w-full max-w-[200px] flex flex-col items-center">
                  <MethodCard method={method} isSolution={true} badge="MÉTODO DO CRIME" size="sm" />
                </div>
              )}
              {object && (
                <div className="w-full max-w-[200px] flex flex-col items-center">
                  <ObjectCard object={object} isSolution={true} badge="OBJETO DO CRIME" size="sm" />
                </div>
              )}
            </div>
          </div>

          {/* All Player Roles */}
          <div className="p-4 rounded-2xl bg-black/70 border border-amber-950 space-y-3">
            <h3 className="text-xs font-serif font-black text-amber-300 uppercase tracking-widest">
              PAPÉIS DE TODOS OS PARTICIPANTES
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {room.players.map((p) => {
                const c = CHARACTERS.find((ch) => ch.id === p.characterId);
                const isKiller = p.role === 'assassino';
                const isOracle = p.role === 'oraculo';

                const isAccomplice = p.role === 'cumplice';
                const isSaboteur = p.role === 'sabotador';

                return (
                  <div
                    key={p.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-serif ${
                      isKiller
                        ? 'bg-red-950/60 border-red-500/70 text-red-200'
                        : isOracle
                        ? 'bg-purple-950/60 border-purple-500/70 text-purple-200'
                        : isAccomplice
                        ? 'bg-rose-950/60 border-rose-500/70 text-rose-200'
                        : isSaboteur
                        ? 'bg-amber-950/60 border-amber-500/70 text-amber-200'
                        : 'bg-black/60 border-white/10 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <GothicAvatar
                        characterId={p.characterId}
                        name={p.name}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <span className="font-bold truncate block text-white">
                          {p.name}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400 block truncate">
                          {c?.name || 'Membro do Códice'}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-serif font-black uppercase px-2 py-0.5 rounded border ${
                        isKiller
                          ? 'bg-red-900 border-red-400 text-white'
                          : isOracle
                          ? 'bg-purple-900 border-purple-400 text-white'
                          : isAccomplice
                          ? 'bg-rose-900 border-rose-400 text-white'
                          : isSaboteur
                          ? 'bg-amber-900 border-amber-400 text-white'
                          : 'bg-zinc-900 border-zinc-700 text-zinc-300'
                      }`}
                    >
                      {isKiller
                        ? 'Assassino'
                        : isOracle
                        ? 'Oráculo'
                        : isAccomplice
                        ? 'Cúmplice'
                        : isSaboteur
                        ? 'Sabotador'
                        : 'Investigador'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                soundEngine.playClick();
                onRestartGame();
              }}
              className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-black font-serif font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Jogar Novamente</span>
            </button>
            <button
              onClick={() => setShowDetailedDossier(false)}
              className="px-6 py-2.5 rounded-xl glass-ui text-zinc-300 hover:text-white font-serif font-bold text-xs uppercase tracking-wider"
            >
              Voltar ao Resumo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

