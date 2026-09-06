import React, { useState } from 'react';
import { RoomState, Player, CardMethod, CardObject } from '../types/game';
import { MethodCard, ObjectCard, EvidenceCard } from './GothicCard';
import { GothicAvatar } from './GothicAvatar';
import { CHARACTERS, MARKER_INFOS } from '../data/gameData';
import { SuspectDossierModal } from './SuspectDossierModal';
import { InvestigationRoomView } from './InvestigationRoomView';
import {
  User,
  ShieldAlert,
  Sparkles,
  Search,
  Eye,
  Users,
  ChevronRight,
  Info,
  HelpCircle,
  FolderOpen,
  Layers,
  AlertCircle,
  LayoutGrid,
  Maximize2,
} from 'lucide-react';

interface Table2DProps {
  room: RoomState;
  myPlayerId: string;
  onSelectPlayerCard?: (player: Player, cardType: 'method' | 'object', card: CardMethod | CardObject) => void;
  onAccuseClick?: () => void;
  onAccuseSuspect?: (targetPlayer: Player) => void;
  onOpenChat?: () => void;
  onOpenHistory?: () => void;
  onOpenRules?: () => void;
  onOpenSettings?: () => void;
  onOpenMenu?: () => void;
  onAdjustTimer?: (seconds: number) => void;
}

export const Table2D: React.FC<Table2DProps> = ({
  room,
  myPlayerId,
  onSelectPlayerCard,
  onAccuseClick,
  onAccuseSuspect,
  onOpenChat,
  onOpenHistory,
  onOpenRules,
  onOpenSettings,
  onOpenMenu,
  onAdjustTimer,
}) => {
  const [viewMode, setViewMode] = useState<'room' | 'grid'>('room');
  const [dossierPlayer, setDossierPlayer] = useState<Player | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileTab, setMobileTab] = useState<'evidence' | 'suspects'>('suspects');

  const myPlayer = room.players.find((p) => p.id === myPlayerId);

  // Filter suspects for grid view
  const filteredPlayers = room.players.filter((p) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const char = CHARACTERS.find((c) => c.id === p.characterId);
    const hasInName = p.name.toLowerCase().includes(term) || (char && char.name.toLowerCase().includes(term));
    const hasInMethods = p.methods.some((m) => m.name.toLowerCase().includes(term) || m.category.toLowerCase().includes(term));
    const hasInObjects = p.objects.some((o) => o.name.toLowerCase().includes(term) || o.category.toLowerCase().includes(term));
    return hasInName || hasInMethods || hasInObjects;
  });

  return (
    <div className="w-full flex flex-col gap-4">
      {/* View Mode Toggle Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-serif font-bold text-amber-300 tracking-wider uppercase hidden sm:inline">
            Modo de Visualização:
          </span>
          <div className="flex items-center p-1 rounded-xl bg-black/60 border border-white/10 shadow-md">
            <button
              onClick={() => setViewMode('room')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-serif font-bold transition-all ${
                viewMode === 'room'
                  ? 'bg-amber-600 text-white shadow-sm border border-amber-400/50'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Salão 2D com Bonequinhos
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-serif font-bold transition-all ${
                viewMode === 'grid'
                  ? 'bg-amber-600 text-white shadow-sm border border-amber-400/50'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Mural Detalhado em Grade
            </button>
          </div>
        </div>
      </div>

      {/* 1. ROOM 2D VIEW (MATCHING THE SCREENSHOT WITH 2D BONEQUINHOS & FLOATING CONTROLS) */}
      {viewMode === 'room' ? (
        <InvestigationRoomView
          room={room}
          myPlayerId={myPlayerId}
          onSelectPlayerCard={onSelectPlayerCard}
          onAccuseClick={onAccuseClick}
          onAccuseSuspect={onAccuseSuspect}
          onOpenChat={onOpenChat}
          onOpenHistory={onOpenHistory}
          onOpenRules={onOpenRules}
          onOpenSettings={onOpenSettings}
          onOpenMenu={onOpenMenu}
          onAdjustTimer={onAdjustTimer}
        />
      ) : (
        /* 2. DETAILED GRID VIEW (ALTERNATIVE VIEW) */
        <div className="w-full flex flex-col gap-4 sm:gap-6">
          {/* Mobile Tab Switcher */}
          <div className="flex md:hidden items-center p-1 rounded-2xl bg-black/60 border border-white/10 shadow-lg">
            <button
              onClick={() => setMobileTab('suspects')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-serif font-bold uppercase tracking-wider transition-all ${
                mobileTab === 'suspects'
                  ? 'bg-amber-600/90 text-white border border-amber-400/60 shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Suspeitos ({room.players.length})
            </button>

            <button
              onClick={() => setMobileTab('evidence')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-serif font-bold uppercase tracking-wider transition-all ${
                mobileTab === 'evidence'
                  ? 'bg-amber-600/90 text-white border border-amber-400/60 shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Evidências ({room.evidencesOnTable.length})
            </button>
          </div>

          {/* Evidence Board */}
          <div className={`glass-ui card-shadow p-4 sm:p-5 rounded-3xl border-white/10 ${mobileTab === 'suspects' ? 'hidden md:block' : 'block'}`}>
            <div className="flex flex-wrap items-center justify-between pb-3 mb-3 border-b border-white/10 gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse shadow-[0_0_12px_#ffd700]" />
                <h3 className="font-serif text-xs sm:text-sm font-bold text-white tracking-[0.18em] uppercase">
                  Mural de Evidências do Códice ({room.evidencesOnTable.length} Cartas)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-amber-300 font-bold tracking-widest uppercase bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-500/30">
                Rodada {room.round} de {room.maxRounds || room.settings?.maxRounds || 3}
              </span>
            </div>

            {/* Marcadores */}
            <div className="mb-4 p-3 rounded-2xl glass-ui-dark border-amber-500/30">
              <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-white/10">
                <span className="text-[11px] font-serif font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Significado das Cores dos Marcadores:
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {Object.values(MARKER_INFOS).map((marker) => (
                  <div
                    key={marker.color}
                    className="flex items-center gap-2 p-2 rounded-xl border text-xs shadow-sm bg-black/40 border-white/10"
                  >
                    <div className={`w-3 h-3 rounded-full shrink-0 ${marker.bgClass}`} />
                    <div className="truncate">
                      <span className="font-serif font-bold text-[11px] block leading-tight text-white">{marker.name}</span>
                      <span className="text-[10px] opacity-80 block truncate font-sans text-zinc-300">{marker.meaning}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Evidence Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4">
              {room.evidencesOnTable.map((ev) => (
                <EvidenceCard key={ev.id} evidence={ev} />
              ))}
            </div>
          </div>

          {/* Suspects Grid */}
          <div className={`glass-ui card-shadow p-4 sm:p-5 rounded-3xl border-white/10 ${mobileTab === 'evidence' ? 'hidden md:block' : 'block'}`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-400 shrink-0" />
                  <h3 className="font-serif text-xs sm:text-sm font-bold text-white tracking-[0.18em] uppercase">
                    Mesa de Suspeitos ({room.players.length} Presentes)
                  </h3>
                </div>
              </div>

              <div className="relative flex-1 sm:w-56">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Buscar suspeito ou carta..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full glass-ui bg-black/50 border-white/10 text-xs text-zinc-200 rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:border-amber-400/60 font-sans"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4">
              {filteredPlayers.map((player) => {
                const char = CHARACTERS.find((c) => c.id === player.characterId);
                const isMe = player.id === myPlayerId;

                return (
                  <div
                    key={player.id}
                    onClick={() => setDossierPlayer(player)}
                    className="group cursor-pointer rounded-2xl p-4 transition-all duration-200 border text-left flex flex-col justify-between gap-3 relative overflow-hidden glass-ui border-white/10 hover:border-amber-400/60 hover:scale-[1.01]"
                  >
                    <div className="flex items-start gap-3">
                      <GothicAvatar
                        characterId={player.characterId}
                        avatarSeed={char?.avatarSeed}
                        name={player.name}
                        size="md"
                        glow={isMe}
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-serif font-bold text-xs sm:text-sm text-zinc-100 group-hover:text-amber-300 truncate">
                          {player.name}
                        </h4>
                        <span className="text-[10px] text-zinc-400 block font-sans truncate">
                          {char?.name || 'Suspeito'} • {char?.title || 'Investigador'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-1 pt-2 border-t border-white/10 flex items-center justify-between text-xs font-serif font-bold text-amber-300">
                      <span>Ver Dossiê ({player.methods.length + player.objects.length} Cartas)</span>
                      <ChevronRight className="w-4 h-4 text-amber-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Suspect Dossier Modal in Grid View */}
          {dossierPlayer && (
            <SuspectDossierModal
              player={dossierPlayer}
              onClose={() => setDossierPlayer(null)}
              onSelectCard={(p, type, card) => {
                if (onSelectPlayerCard) {
                  onSelectPlayerCard(p, type, card);
                }
              }}
              onAccuseSuspect={(target) => {
                if (onAccuseSuspect) {
                  onAccuseSuspect(target);
                } else if (onAccuseClick) {
                  onAccuseClick();
                }
              }}
              myPlayerId={myPlayerId}
              canAccuse={!myPlayer?.hasAccused && myPlayer?.role !== 'oraculo'}
            />
          )}
        </div>
      )}
    </div>
  );
};


