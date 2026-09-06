import React, { useState, useEffect } from 'react';
import { CHARACTERS, getCharacterById } from '../data/gameData';
import { GothicAvatar } from './GothicAvatar';
import { soundEngine } from '../utils/soundEngine';
import {
  loadProgression,
  getXpRequiredForLevel,
  PlayerProgression,
} from '../utils/progression';
import codiceMorteLivroImg from '../assets/images/codice_morte_livro_1787918785943.jpg';
import codiceEmblemaCaveiraImg from '../assets/images/codice_emblema_caveira_1787918811337.jpg';
import {
  Skull,
  Play,
  Users,
  Zap,
  BookOpen,
  Sparkles,
  Layers,
  ShoppingBag,
  Bell,
  Gift,
  Settings,
  Home,
  User,
  Sword,
  Shield,
  Sun,
  Moon,
  ChevronRight,
} from 'lucide-react';

interface HomeScreenProps {
  playerName: string;
  setPlayerName: (name: string) => void;
  selectedCharId: string;
  setSelectedCharId: (id: string) => void;
  onQuickPlaySolo: () => void;
  onOpenCreateRoom: () => void;
  onOpenJoinRoom: () => void;
  onOpenPassAndPlay: () => void;
  onOpenCharacters: () => void;
  onOpenGrimoire: () => void;
  onOpenCollection: () => void;
  onOpenShop: () => void;
  onOpenProfile: () => void;
  onOpenNotifications: () => void;
  onOpenSettings: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  playerName,
  selectedCharId,
  onQuickPlaySolo,
  onOpenCreateRoom,
  onOpenJoinRoom,
  onOpenPassAndPlay,
  onOpenCharacters,
  onOpenGrimoire,
  onOpenCollection,
  onOpenShop,
  onOpenProfile,
  onOpenNotifications,
  onOpenSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'lobby' | 'colecao' | 'grimorio' | 'perfil' | 'loja'>('lobby');
  const [progression, setProgression] = useState<PlayerProgression>(() => loadProgression());
  const currentChar = getCharacterById(selectedCharId);

  useEffect(() => {
    const handleUpdate = () => {
      setProgression(loadProgression());
    };
    window.addEventListener('codice_progression_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('codice_progression_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const reqXp = getXpRequiredForLevel(progression.level);
  const xpPercent = Math.min(100, Math.max(0, Math.round((progression.xp / reqXp) * 100)));

  const handleTabClick = (tab: 'lobby' | 'colecao' | 'grimorio' | 'perfil' | 'loja') => {
    soundEngine.playClick();
    setActiveTab(tab);
    if (tab === 'colecao') onOpenCollection();
    else if (tab === 'grimorio') onOpenGrimoire();
    else if (tab === 'perfil') onOpenProfile();
    else if (tab === 'loja') onOpenShop();
  };

  return (
    <div className="relative h-screen max-h-screen w-full flex flex-col justify-between items-center text-[#e8dfd8] overflow-hidden select-none px-2 py-1.5 sm:py-2">
      {/* Background: O Códice da Morte (Livro Ancestral e Caveira na Biblioteca) */}
      <div className="fixed inset-0 z-0 bg-[#070404] overflow-hidden pointer-events-none">
        <img
          src={codiceMorteLivroImg}
          alt="O Códice da Morte - Livro Ancestral e Caveira"
          className="absolute inset-0 w-full h-full object-cover object-center scale-105 filter brightness-85 contrast-110"
          referrerPolicy="no-referrer"
        />
        {/* Cinematic Vignette Overlay */}
        <div className="absolute inset-0 bg-radial-gradient from-amber-950/20 via-black/50 to-black/80 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-black/60 z-10" />

        {/* Ambient floating flame particles */}
        <div className="absolute inset-0 pointer-events-none opacity-60 z-10">
          <div className="absolute bottom-10 left-1/4 w-72 h-72 rounded-full bg-amber-600/15 blur-3xl animate-pulse" />
          <div className="absolute top-20 right-1/4 w-80 h-80 rounded-full bg-red-950/25 blur-3xl" />
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TOP STATUS BAR */}
      {/* ------------------------------------------------------------- */}
      <header className="relative z-30 w-full max-w-md sm:max-w-xl px-3 sm:px-6 pt-3 sm:pt-4 flex items-center justify-between shrink-0">
        {/* Profile Pill (Left) */}
        <button
          onClick={() => {
            soundEngine.playClick();
            onOpenProfile();
          }}
          className="flex items-center gap-3 group transition-transform active:scale-95 text-left"
        >
          {/* Ornate Gold Avatar Ring */}
          <div className="relative">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full p-[3px] bg-gradient-to-b from-[#e5b358] via-[#855e24] to-[#2c1d07] shadow-[0_0_15px_rgba(212,160,51,0.35)] flex items-center justify-center">
              <div className="w-full h-full rounded-full overflow-hidden bg-black ring-1 ring-[#f3ce7b]/50 flex items-center justify-center">
                <GothicAvatar
                  characterId={selectedCharId}
                  avatarSeed={currentChar.avatarSeed}
                  name={currentChar.name}
                  size="full"
                  className="w-full h-full"
                  border={false}
                  glow={false}
                />
              </div>
            </div>
            <div className="absolute -bottom-1 -right-0.5 w-4 h-4 rounded-full bg-gradient-to-b from-[#d4a033] to-[#805315] border border-black flex items-center justify-center text-[8px] font-bold text-black font-mono shadow">
              ★
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <span className="text-sm sm:text-base font-serif font-bold text-[#f5e7c8] group-hover:text-amber-200 transition-colors tracking-wide leading-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
              {playerName || 'Investigador 1'}
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[9px] sm:text-[10px] font-serif tracking-[0.2em] text-[#d4af37] font-semibold uppercase">
                NÍVEL {progression.level}
              </span>
              <div className="w-16 sm:w-20 h-1.5 rounded-full bg-black/80 border border-[#8a6828]/60 overflow-hidden p-[1px]">
                <div
                  className="h-full bg-gradient-to-r from-[#b37c22] via-[#e5b358] to-[#f7d98d] rounded-full transition-all duration-300 shadow-[0_0_6px_rgba(229,179,88,0.6)]"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
            </div>
          </div>
        </button>

        {/* Top Right Quick Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Notification Bell */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenNotifications();
            }}
            className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-b from-[#1a1410] to-[#0d0a08] border border-[#a67c32]/60 hover:border-[#e5b358] flex items-center justify-center text-[#d4af37] hover:text-amber-100 transition-all shadow-[0_4px_10px_rgba(0,0,0,0.8)] active:scale-95 group"
            title="Novidades e Notificações"
          >
            <Bell className="w-4 h-4 text-[#d4af37] group-hover:scale-110 transition-transform" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-600 border border-black animate-pulse" />
          </button>

          {/* Rewards / Gift */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenShop();
            }}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-b from-[#1a1410] to-[#0d0a08] border border-[#a67c32]/60 hover:border-[#e5b358] flex items-center justify-center text-[#d4af37] hover:text-amber-100 transition-all shadow-[0_4px_10px_rgba(0,0,0,0.8)] active:scale-95 group"
            title="Recompensas Diárias"
          >
            <Gift className="w-4 h-4 text-[#d4af37] group-hover:scale-110 transition-transform" />
          </button>

          {/* Settings */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenSettings();
            }}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-b from-[#1a1410] to-[#0d0a08] border border-[#a67c32]/60 hover:border-[#e5b358] flex items-center justify-center text-[#d4af37] hover:text-amber-100 transition-all shadow-[0_4px_10px_rgba(0,0,0,0.8)] active:scale-95 group"
            title="Configurações & Áudio"
          >
            <Settings className="w-4 h-4 text-[#d4af37] group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </header>

      {/* Atmospheric Gothic Side Quotes (Desktop / Wide screens) */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-4 sm:px-8 pointer-events-none hidden md:flex justify-between items-center text-[#a88a55]/60 text-[10px] tracking-[0.25em] font-serif select-none z-10">
        <div className="flex flex-col gap-12 max-w-[140px] text-left">
          <p className="leading-relaxed drop-shadow">
            “ALGUMAS VERDADES NUNCA DEVEM SER REVELADAS..”
          </p>
          <div className="space-y-1">
            <span className="block font-bold text-[#c9a75e]/80">VERITAS IN TENEBRIS</span>
            <p className="text-[9px] text-[#8a7246]/70">O PASSADO SEMPRE DEIXA PISTAS.</p>
          </div>
        </div>
        <div className="flex flex-col gap-12 max-w-[140px] text-right">
          <div className="space-y-1">
            <p className="tracking-[0.3em]">OBSERVE</p>
            <p className="tracking-[0.3em]">ANALISE</p>
            <p className="tracking-[0.3em]">DESCUBRA</p>
            <p className="tracking-[0.3em]">SOBREVIVA</p>
          </div>
          <p className="text-[9px] text-[#8a7246]/70 leading-relaxed">
            O ORÁCULO SEMPRE OBSERVA.
          </p>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* CENTER LOGO & GOTHIC SEAL (O CÓDICE DA MORTE) */}
      {/* ------------------------------------------------------------- */}
      <div className="relative z-20 flex flex-col items-center justify-center my-auto shrink-0 py-1 sm:py-2">
        <div className="relative flex flex-col items-center justify-center">
          {/* Amber mystical glow halo */}
          <div className="absolute w-56 h-56 sm:w-72 sm:h-72 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

          {/* Grimoire Cover Emblem */}
          <div className="relative flex flex-col items-center justify-center group cursor-default">
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden p-[2px] bg-gradient-to-b from-[#e5b358] via-[#6e4e1d] to-[#1a1205] shadow-[0_0_35px_rgba(229,179,88,0.25)] transition-transform duration-500 hover:scale-105">
              <div className="w-full h-full rounded-2xl overflow-hidden bg-black flex items-center justify-center">
                <img
                  src={codiceEmblemaCaveiraImg}
                  alt="CÓDICE DA MORTE - Grimório e Caveira"
                  className="w-full h-full object-cover filter contrast-125 brightness-95"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            <div className="mt-2.5 sm:mt-3 text-center">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-black tracking-[0.25em] text-[#f7e4ba] uppercase drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
                CÓDICE DA MORTE
              </h1>
              <div className="mt-0.5 flex items-center justify-center gap-2">
                <div className="w-6 h-[1px] bg-gradient-to-r from-transparent to-[#c99738]" />
                <span className="text-[9px] sm:text-[10px] font-serif tracking-[0.3em] text-[#d4af37] uppercase font-semibold">
                  MISTÉRIO DO ORÁCULO
                </span>
                <div className="w-6 h-[1px] bg-gradient-to-l from-transparent to-[#c99738]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* FLOATING VERTICAL MENU BUTTONS (MATCHING REFERENCE IMAGE) */}
      {/* ------------------------------------------------------------- */}
      <main className="relative z-20 w-full max-w-xs sm:max-w-sm px-2 flex flex-col gap-1.5 sm:gap-2 shrink-0 mb-auto">
        {/* 1. JOGAR (Primary Highlighted Ruby/Crimson Button with Gold Edges) */}
        <button
          onClick={() => {
            soundEngine.playClick();
            onQuickPlaySolo();
          }}
          className="group relative w-full py-2.5 sm:py-3 px-4 rounded-xl sm:rounded-2xl bg-gradient-to-b from-[#6e1010] via-[#480909] to-[#200404] hover:from-[#871616] hover:to-[#2e0505] border border-[#d4af37]/80 hover:border-[#f3ce7b] shadow-[0_4px_18px_rgba(110,16,16,0.6)] text-[#fff8ec] transition-all transform hover:scale-[1.01] active:scale-[0.98] overflow-hidden flex items-center justify-center gap-2.5"
        >
          {/* Subtle gold filigree corner brackets */}
          <div className="absolute top-1 left-1.5 w-1.5 h-1.5 border-t border-l border-[#f5d07a]/80 pointer-events-none" />
          <div className="absolute top-1 right-1.5 w-1.5 h-1.5 border-t border-r border-[#f5d07a]/80 pointer-events-none" />
          <div className="absolute bottom-1 left-1.5 w-1.5 h-1.5 border-b border-l border-[#f5d07a]/80 pointer-events-none" />
          <div className="absolute bottom-1 right-1.5 w-1.5 h-1.5 border-b border-r border-[#f5d07a]/80 pointer-events-none" />

          <Play className="w-3.5 h-3.5 text-[#f5d07a] fill-[#f5d07a]" />
          <div className="flex flex-col items-center">
            <span className="font-serif font-black text-xs sm:text-sm tracking-[0.25em] uppercase text-[#fff5df] leading-tight">
              JOGAR
            </span>
            <span className="text-[7.5px] sm:text-[8px] font-serif tracking-[0.2em] text-[#e0a845] uppercase">
              ENTRE NO MISTÉRIO
            </span>
          </div>
        </button>

        {/* 2. CRIAR SALA */}
        <button
          onClick={() => {
            soundEngine.playClick();
            onOpenCreateRoom();
          }}
          className="group relative w-full py-2 sm:py-2.5 px-4 rounded-xl sm:rounded-2xl bg-gradient-to-b from-[#171310] via-[#0f0c0a] to-[#080605] hover:bg-[#201a15] border border-[#a67c32]/50 hover:border-[#e5b358] shadow-[0_3px_10px_rgba(0,0,0,0.8)] text-[#edd7b2] transition-all transform hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2.5"
        >
          <Users className="w-4 h-4 text-[#d4af37] group-hover:text-amber-200 transition-colors" />
          <div className="flex flex-col items-center">
            <span className="font-serif font-bold text-xs tracking-[0.2em] uppercase text-[#f2e2c4] leading-tight">
              CRIAR SALA
            </span>
            <span className="text-[7.5px] sm:text-[8px] font-serif tracking-[0.2em] text-[#b8954f] uppercase">
              REÚNA OS INVESTIGADORES
            </span>
          </div>
        </button>

        {/* 3. PARTIDA RÁPIDA */}
        <button
          onClick={() => {
            soundEngine.playClick();
            onOpenJoinRoom();
          }}
          className="group relative w-full py-2 sm:py-2.5 px-4 rounded-xl sm:rounded-2xl bg-gradient-to-b from-[#171310] via-[#0f0c0a] to-[#080605] hover:bg-[#201a15] border border-[#a67c32]/50 hover:border-[#e5b358] shadow-[0_3px_10px_rgba(0,0,0,0.8)] text-[#edd7b2] transition-all transform hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2.5"
        >
          <Zap className="w-4 h-4 text-[#d4af37] group-hover:text-amber-200 transition-colors" />
          <div className="flex flex-col items-center">
            <span className="font-serif font-bold text-xs tracking-[0.2em] uppercase text-[#f2e2c4] leading-tight">
              PARTIDA RÁPIDA
            </span>
            <span className="text-[7.5px] sm:text-[8px] font-serif tracking-[0.2em] text-[#b8954f] uppercase">
              ENTRE EM UMA SALA ALEATÓRIA
            </span>
          </div>
        </button>

        {/* 4. PERSONAGENS */}
        <button
          id="btn-home-characters"
          onClick={() => {
            soundEngine.playClick();
            onOpenCharacters();
          }}
          className="group relative w-full py-2 sm:py-2.5 px-4 rounded-xl sm:rounded-2xl bg-gradient-to-b from-[#171310] via-[#0f0c0a] to-[#080605] hover:bg-[#201a15] border border-[#a67c32]/50 hover:border-[#e5b358] shadow-[0_3px_10px_rgba(0,0,0,0.8)] text-[#edd7b2] transition-all transform hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2.5"
        >
          <User className="w-4 h-4 text-[#d4af37] group-hover:text-amber-200 transition-colors" />
          <div className="flex flex-col items-center">
            <span className="font-serif font-bold text-xs tracking-[0.2em] uppercase text-[#f2e2c4] leading-tight">
              PERSONAGENS
            </span>
            <span className="text-[7.5px] sm:text-[8px] font-serif tracking-[0.2em] text-[#b8954f] uppercase">
              INVESTIGADORES & ARTE
            </span>
          </div>
        </button>

        {/* 5. GRIMÓRIO */}
        <button
          onClick={() => {
            soundEngine.playClick();
            onOpenGrimoire();
          }}
          className="group relative w-full py-2 sm:py-2.5 px-4 rounded-xl sm:rounded-2xl bg-gradient-to-b from-[#171310] via-[#0f0c0a] to-[#080605] hover:bg-[#201a15] border border-[#a67c32]/50 hover:border-[#e5b358] shadow-[0_3px_10px_rgba(0,0,0,0.8)] text-[#edd7b2] transition-all transform hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2.5"
        >
          <BookOpen className="w-4 h-4 text-[#d4af37] group-hover:text-amber-200 transition-colors" />
          <div className="flex flex-col items-center">
            <span className="font-serif font-bold text-xs tracking-[0.2em] uppercase text-[#f2e2c4] leading-tight">
              GRIMÓRIO
            </span>
            <span className="text-[7.5px] sm:text-[8px] font-serif tracking-[0.2em] text-[#b8954f] uppercase">
              HISTÓRIAS DO DRÁCULA
            </span>
          </div>
        </button>

        {/* 6. COLEÇÃO */}
        <button
          onClick={() => {
            soundEngine.playClick();
            onOpenCollection();
          }}
          className="group relative w-full py-2 sm:py-2.5 px-4 rounded-xl sm:rounded-2xl bg-gradient-to-b from-[#171310] via-[#0f0c0a] to-[#080605] hover:bg-[#201a15] border border-[#a67c32]/50 hover:border-[#e5b358] shadow-[0_3px_10px_rgba(0,0,0,0.8)] text-[#edd7b2] transition-all transform hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2.5"
        >
          <Layers className="w-4 h-4 text-[#d4af37] group-hover:text-amber-200 transition-colors" />
          <div className="flex flex-col items-center">
            <span className="font-serif font-bold text-xs tracking-[0.2em] uppercase text-[#f2e2c4] leading-tight">
              COLEÇÃO
            </span>
            <span className="text-[7.5px] sm:text-[8px] font-serif tracking-[0.2em] text-[#b8954f] uppercase">
              CARTAS E ITENS
            </span>
          </div>
        </button>
      </main>

      {/* ------------------------------------------------------------- */}
      {/* BOTTOM FLOATING DOCK (NAVIGATION BAR MATCHING REFERENCE) */}
      {/* ------------------------------------------------------------- */}
      <nav className="relative z-30 w-full max-w-xs sm:max-w-md shrink-0 mb-2 px-1">
        <div className="p-1 rounded-2xl bg-[#0d0a08]/90 backdrop-blur-md border border-[#8a6828]/50 shadow-[0_8px_25px_rgba(0,0,0,0.9)] flex items-center justify-around">
          {/* LOBBY */}
          <button
            onClick={() => handleTabClick('lobby')}
            className={`flex-1 py-1.5 px-1 rounded-xl flex flex-col items-center justify-center transition-all ${
              activeTab === 'lobby'
                ? 'border border-[#d4af37]/80 bg-[#241a0e]/90 text-[#f5e7c8] shadow-[0_0_10px_rgba(212,175,55,0.2)]'
                : 'text-[#9c8464] hover:text-[#f5e7c8]'
            }`}
          >
            <Home className="w-3.5 h-3.5 text-[#d4af37]" />
            <span className="text-[8.5px] font-serif font-bold tracking-widest uppercase mt-0.5">
              LOBBY
            </span>
          </button>

          <div className="w-[1px] h-5 bg-[#5e4722]/40" />

          {/* COLEÇÃO */}
          <button
            onClick={() => handleTabClick('colecao')}
            className={`flex-1 py-1.5 px-1 rounded-xl flex flex-col items-center justify-center transition-all ${
              activeTab === 'colecao'
                ? 'border border-[#d4af37]/80 bg-[#241a0e]/90 text-[#f5e7c8] shadow-[0_0_10px_rgba(212,175,55,0.2)]'
                : 'text-[#9c8464] hover:text-[#f5e7c8]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="text-[8.5px] font-serif font-bold tracking-widest uppercase mt-0.5">
              COLEÇÃO
            </span>
          </button>

          <div className="w-[1px] h-5 bg-[#5e4722]/40" />

          {/* GRIMÓRIO */}
          <button
            onClick={() => handleTabClick('grimorio')}
            className={`flex-1 py-1.5 px-1 rounded-xl flex flex-col items-center justify-center transition-all ${
              activeTab === 'grimorio'
                ? 'border border-[#d4af37]/80 bg-[#241a0e]/90 text-[#f5e7c8] shadow-[0_0_10px_rgba(212,175,55,0.2)]'
                : 'text-[#9c8464] hover:text-[#f5e7c8]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="text-[8.5px] font-serif font-bold tracking-widest uppercase mt-0.5">
              GRIMÓRIO
            </span>
          </button>

          <div className="w-[1px] h-5 bg-[#5e4722]/40" />

          {/* PERFIL */}
          <button
            onClick={() => handleTabClick('perfil')}
            className={`flex-1 py-1.5 px-1 rounded-xl flex flex-col items-center justify-center transition-all ${
              activeTab === 'perfil'
                ? 'border border-[#d4af37]/80 bg-[#241a0e]/90 text-[#f5e7c8] shadow-[0_0_10px_rgba(212,175,55,0.2)]'
                : 'text-[#9c8464] hover:text-[#f5e7c8]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span className="text-[8.5px] font-serif font-bold tracking-widest uppercase mt-0.5">
              PERFIL
            </span>
          </button>

          <div className="w-[1px] h-5 bg-[#5e4722]/40" />

          {/* LOJA */}
          <button
            onClick={() => handleTabClick('loja')}
            className={`flex-1 py-1.5 px-1 rounded-xl flex flex-col items-center justify-center transition-all ${
              activeTab === 'loja'
                ? 'border border-[#d4af37]/80 bg-[#241a0e]/90 text-[#f5e7c8] shadow-[0_0_10px_rgba(212,175,55,0.2)]'
                : 'text-[#9c8464] hover:text-[#f5e7c8]'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="text-[8.5px] font-serif font-bold tracking-widest uppercase mt-0.5">
              LOJA
            </span>
          </button>
        </div>
      </nav>
    </div>
  );
};
