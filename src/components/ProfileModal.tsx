import React, { useState, useEffect } from 'react';
import {
  User,
  X,
  Shield,
  Trophy,
  Award,
  Flame,
  Skull,
  Sparkles,
  CheckCircle2,
  Coins,
  Crown,
  ChevronRight,
  TrendingUp,
  Percent,
  Compass,
  Edit3,
  Check,
  BadgeCheck,
} from 'lucide-react';
import { CHARACTERS, getCharacterById } from '../data/gameData';
import { GothicAvatar } from './GothicAvatar';
import { soundEngine } from '../utils/soundEngine';
import {
  loadProgression,
  getXpRequiredForLevel,
  PlayerProgression,
  getActiveCardFrame,
} from '../utils/progression';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerName: string;
  setPlayerName: (name: string) => void;
  selectedCharId: string;
  onOpenCharacterSelect: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  playerName,
  setPlayerName,
  selectedCharId,
  onOpenCharacterSelect,
}) => {
  const [progression, setProgression] = useState<PlayerProgression>(() => loadProgression());
  const [savedFeedback, setSavedFeedback] = useState<boolean>(false);

  useEffect(() => {
    const handleUpdate = () => {
      setProgression(loadProgression());
    };
    window.addEventListener('codice_progression_updated', handleUpdate);
    return () => window.removeEventListener('codice_progression_updated', handleUpdate);
  }, []);

  if (!isOpen) return null;

  const currentChar = getCharacterById(selectedCharId);
  const reqXp = getXpRequiredForLevel(progression.level);
  const xpPercent = Math.min(100, Math.round((progression.xp / reqXp) * 100));
  const activeFrame = getActiveCardFrame();

  const winRate =
    progression.totalGamesPlayed > 0
      ? Math.round((progression.victories / progression.totalGamesPlayed) * 100)
      : 0;

  // Detective title calculation based on level
  const getDetectiveTitle = (lvl: number) => {
    if (lvl >= 20) return 'Arquivista Supremo do Códice';
    if (lvl >= 15) return 'Mestre Supremo da Dedução';
    if (lvl >= 10) return 'Grão-Detetive Noturno';
    if (lvl >= 5) return 'Investigador Sênior';
    if (lvl >= 3) return 'Perito Criminal';
    return 'Recruta Forense';
  };

  const handleNameChange = (val: string) => {
    setPlayerName(val);
    localStorage.setItem('codice_player_name', val);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-4 animate-fade-in text-[#e8dfd8] overflow-hidden">
      <div className="bg-gradient-to-b from-[#180b06] via-[#100502] to-[#080201] border-2 border-[#b88c3a] rounded-2xl sm:rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-[0_0_60px_rgba(0,0,0,0.95)] overflow-hidden relative text-[#f7e4ba]">
        {/* Filigranas douradas nos 4 cantos */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#e5b358] pointer-events-none" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#e5b358] pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#e5b358] pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#e5b358] pointer-events-none" />

        {/* Modal Header - Fixed */}
        <div className="shrink-0 flex items-center justify-between p-3.5 sm:p-5 border-b border-[#a67c32]/40 bg-[#120c08]/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#241708] border border-[#b88c3a]/60 flex items-center justify-center text-[#e5b358] shadow-md shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-serif font-black text-[#f7e4ba] uppercase tracking-widest flex items-center gap-2">
                <span>PERFIL DO INVESTIGADOR</span>
              </h2>
              <p className="text-[10px] sm:text-xs text-[#c9a75e] font-serif">
                Dossiê pessoal, progressão arcana e histórico de casos
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-[#120c08] text-[#a89070] hover:text-white border border-[#a67c32]/40 hover:border-[#e5b358] transition-colors active:scale-95 shrink-0 cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Smooth Scrollable Container */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-3.5 sm:p-5 space-y-4 scrollbar-none">
          {/* Card 1: Insígnia do Investigador & Dossiê Hero Card */}
          <div className="shrink-0 p-4 rounded-2xl bg-gradient-to-br from-black/90 via-zinc-950/80 to-[#1c0b06]/60 border border-amber-500/40 relative overflow-hidden shadow-xl">
            {/* Subtle background insignia watermark */}
            <div className="absolute -right-6 -bottom-6 opacity-5 pointer-events-none">
              <Skull className="w-48 h-48 text-amber-300" />
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 relative z-10">
              {/* Official Investigator Insignia Badge & Avatar */}
              <div className="flex flex-col items-center shrink-0">
                <div
                  onClick={() => {
                    soundEngine.playClick();
                    onOpenCharacterSelect();
                  }}
                  className="relative group cursor-pointer"
                  title="Clique para trocar o personagem/insígnia"
                >
                  {/* Ornate Medallion Frame */}
                  <div className="p-1 rounded-full bg-gradient-to-b from-amber-400 via-amber-700 to-amber-950 shadow-[0_0_20px_rgba(245,158,11,0.35)] ring-2 ring-amber-400/60">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-black flex items-center justify-center">
                      <GothicAvatar
                        characterId={currentChar.id}
                        avatarSeed={currentChar.avatarSeed}
                        name={currentChar.name}
                        size="2xl"
                        border={false}
                        glow={true}
                        allowDoubleClickUpload={false}
                      />
                    </div>
                  </div>

                  {/* Overlaid Insignia Star Seal */}
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-700 border-2 border-black flex items-center justify-center text-black shadow-lg">
                    <Shield className="w-3.5 h-3.5 fill-black text-black" />
                  </div>
                </div>

                <button
                  onClick={() => {
                    soundEngine.playClick();
                    onOpenCharacterSelect();
                  }}
                  className="mt-2 text-[11px] font-mono font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 underline underline-offset-2 active:scale-95"
                >
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>Trocar Insígnia</span>
                </button>
              </div>

              {/* Identity Details & Title */}
              <div className="flex-1 w-full min-w-0 space-y-2 text-center sm:text-left">
                {/* Detective Rank Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-amber-950 via-[#260e06] to-black border border-amber-500/50 text-amber-200 text-xs sm:text-sm font-serif font-bold shadow-md">
                  <Crown className="w-4 h-4 text-yellow-400 shrink-0" />
                  <span>{getDetectiveTitle(progression.level)}</span>
                </div>

                {/* Character Name & Specialty */}
                <div className="text-xs text-amber-300/90 font-serif">
                  Brasão Atual:{' '}
                  <strong className="text-amber-100 font-bold tracking-wide">
                    {currentChar.name}
                  </strong>{' '}
                  <span className="text-zinc-400 font-sans text-[11px]">({currentChar.title})</span>
                </div>

                {/* Level & XP Bar */}
                <div className="space-y-1.5 pt-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-yellow-400 font-black uppercase tracking-wider flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                      NÍVEL {progression.level}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-400 font-bold">
                      {progression.xp} / {reqXp} XP ({xpPercent}%)
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-zinc-950 border border-amber-500/30 overflow-hidden p-0.5 shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-600 via-amber-500 to-yellow-300 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]"
                      style={{ width: `${xpPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Dedicated Player Name Editor (Crucial for Mobile!) */}
          <div className="shrink-0 p-3.5 sm:p-4 rounded-2xl bg-black/80 border border-amber-500/50 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono text-amber-300 uppercase tracking-wider font-bold flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                Nome / Codinome do Investigador
              </label>
              {savedFeedback && (
                <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 font-bold animate-pulse">
                  <Check className="w-3.5 h-3.5" /> Salvo!
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={playerName}
                  maxLength={24}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Digite seu nome..."
                  className="w-full h-11 bg-zinc-900/95 border border-amber-500/60 focus:border-amber-400 rounded-xl px-3.5 text-sm sm:text-base text-amber-100 font-serif font-bold placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 shadow-inner transition-all"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  handleNameChange(playerName.trim() || 'Investigador');
                }}
                className="h-11 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 active:scale-95 text-white font-serif font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all shrink-0"
                title="Salvar nome"
              >
                <Check className="w-4 h-4" />
                <span className="hidden sm:inline">Salvar</span>
              </button>
            </div>
            <p className="text-[10px] sm:text-xs text-zinc-400 mt-1.5 font-sans">
              Este nome será visível nas salas multiplayer, nas acusações e no dossiê de caso.
            </p>
          </div>

          {/* Card 3: Wealth & Equipped Frame Card */}
          <div className="shrink-0 grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-950/40 to-black/60 border border-amber-500/30 flex items-center gap-3 shadow-md">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0 shadow-md">
                <Coins className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <span className="text-base font-mono font-black text-yellow-300 block">
                  {progression.coins}
                </span>
                <span className="text-[9px] sm:text-[10px] text-zinc-400 uppercase tracking-wider block font-sans">
                  Moedas de Ouro
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-black/60 border border-white/10 flex items-center gap-3 shadow-md">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300 shrink-0">
                <Sparkles className="w-5 h-5 text-purple-300" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-serif font-bold text-zinc-100 block truncate">
                  {activeFrame.name}
                </span>
                <span className="text-[9px] sm:text-[10px] text-purple-300/80 uppercase tracking-wider block font-sans">
                  Moldura Ativa
                </span>
              </div>
            </div>
          </div>

          {/* Card 4: Historical Statistics Grid */}
          <div className="shrink-0 grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-3 rounded-2xl bg-black/60 border border-white/10 flex flex-col items-center justify-center text-center shadow">
              <Trophy className="w-4 h-4 text-amber-400 mb-1" />
              <span className="text-base font-mono font-black text-amber-200">
                {progression.victories}
              </span>
              <span className="text-[9px] text-zinc-400 uppercase tracking-wider font-sans">
                Vitórias Totais
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-black/60 border border-white/10 flex flex-col items-center justify-center text-center shadow">
              <Skull className="w-4 h-4 text-red-400 mb-1" />
              <span className="text-base font-mono font-black text-red-300">
                {progression.killerVictories}
              </span>
              <span className="text-[9px] text-zinc-400 uppercase tracking-wider font-sans">
                Como Assassino
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-black/60 border border-white/10 flex flex-col items-center justify-center text-center shadow">
              <Compass className="w-4 h-4 text-cyan-400 mb-1" />
              <span className="text-base font-mono font-black text-cyan-300">
                {progression.totalGamesPlayed}
              </span>
              <span className="text-[9px] text-zinc-400 uppercase tracking-wider font-sans">
                Partidas Totais
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-black/60 border border-white/10 flex flex-col items-center justify-center text-center shadow">
              <Percent className="w-4 h-4 text-emerald-400 mb-1" />
              <span className="text-base font-mono font-black text-emerald-300">{winRate}%</span>
              <span className="text-[9px] text-zinc-400 uppercase tracking-wider font-sans">
                Taxa de Vitória
              </span>
            </div>
          </div>

          {/* Card 5: Change Main Character / Insignia Button */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenCharacterSelect();
            }}
            className="shrink-0 w-full py-3 px-4 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-amber-500/40 hover:border-amber-400 text-amber-200 font-serif font-bold text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow active:scale-95"
          >
            <BadgeCheck className="w-4 h-4 text-amber-400" />
            <span>Trocar Personagem Principal ({currentChar.name})</span>
          </button>
        </div>

        {/* Modal Footer - Fixed */}
        <div className="shrink-0 p-3 sm:p-4 border-t border-amber-500/20 bg-black/60 flex items-center justify-between gap-3">
          <div className="text-[11px] text-zinc-400 font-serif truncate">
            Investigador: <strong className="text-amber-200">{playerName || 'Investigador'}</strong>
          </div>
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-serif font-bold text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95 shrink-0"
          >
            Salvar & Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
