import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { RoomState, Player } from '../types/game';
import { CHARACTERS } from '../data/gameData';
import { CharacterSelectModal } from './CharacterSelectModal';
import { RulesReferenceModal } from './RulesReferenceModal';
import { GothicAvatar } from './GothicAvatar';
import { soundEngine } from '../utils/soundEngine';
import codiceMorteLivroImg from '../assets/images/codice_morte_livro_1787918785943.jpg';
import lobbyPainelArteImg from '../assets/images/lobby_painel_arte_1787919059138.jpg';
import codiceEmblemaCaveiraImg from '../assets/images/codice_emblema_caveira_1787918811337.jpg';
import {
  Users,
  Copy,
  Check,
  Bot,
  Crown,
  BookOpen,
  QrCode,
  Share2,
  Trash2,
  LogOut,
  X,
  Skull,
  Eye,
  Sparkles,
  Shield,
  Edit3,
  Plus,
  Minus,
} from 'lucide-react';

interface LobbyViewProps {
  room: RoomState;
  myPlayerId: string;
  onUpdateCharacter: (charId: string) => void;
  onToggleReady: () => void;
  onAddBot: () => void;
  onRemoveBot?: () => void;
  onFillBots?: (targetCount?: number) => void;
  onClearBots?: () => void;
  onUpdatePlayerName?: (newName: string) => void;
  onStartGame: () => void;
  onUpdateSettings?: (settings: any) => void;
  onDesignateOracle?: (playerId: string) => void;
  onOpenRules?: () => void;
  onLeaveRoom?: () => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({
  room,
  myPlayerId,
  onUpdateCharacter,
  onToggleReady,
  onAddBot,
  onRemoveBot,
  onFillBots,
  onClearBots,
  onUpdatePlayerName,
  onStartGame,
  onUpdateSettings,
  onDesignateOracle,
  onOpenRules,
  onLeaveRoom,
}) => {
  const [showCharModal, setShowCharModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showInternalRules, setShowInternalRules] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');

  const myPlayer = room.players.find((p) => p.id === myPlayerId);
  const isHost = myPlayer?.isHost || room.players[0]?.id === myPlayerId;
  const takenCharIds = room.players.map((p) => p.characterId);
  const roomUrl = `${window.location.origin}/?room=${room.code}`;
  const botCount = room.players.filter((p) => p.isAI).length;

  useEffect(() => {
    if (myPlayer?.name && !isEditingName) {
      setNameInput(myPlayer.name);
    }
  }, [myPlayer?.name, isEditingName]);

  const handleSaveName = () => {
    soundEngine.playClick();
    const trimmed = nameInput.trim();
    if (trimmed && onUpdatePlayerName) {
      onUpdatePlayerName(trimmed);
    }
    setIsEditingName(false);
  };

  // Generate QR Code on load or room change
  useEffect(() => {
    if (!roomUrl) return;
    try {
      QRCode.toDataURL(roomUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#ffd700',
          light: '#0c0603',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => {
          console.warn('Erro ao gerar QR Code (não fatal):', err);
          setQrDataUrl(''); // Evita travar a tela
        });
    } catch (e) {
      console.warn('Erro na biblioteca de QR Code:', e);
    }
  }, [roomUrl]);

  const copyRoomCode = () => {
    soundEngine.playClick();
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareRoom = async () => {
    soundEngine.playClick();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'O Códice da Morte • Convite de Investigação',
          text: `Venha desvendar o assassinato na biblioteca ancestral! Entre na sala com o código: ${room.code}`,
          url: roomUrl,
        });
        return;
      } catch (err) {
        // Fallback to clipboard if dismissed
      }
    }

    navigator.clipboard.writeText(roomUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleStart = () => {
    soundEngine.playGavelStrike();
    onStartGame();
  };

  if (!myPlayer) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black text-amber-500 font-serif z-[200]">
        <div className="text-center space-y-4 p-6 glass-ui rounded-3xl border border-amber-500/30">
          <Skull className="w-16 h-16 mx-auto animate-pulse text-red-500" />
          <h2 className="text-2xl font-black tracking-widest uppercase">Invocando Investigadores...</h2>
          <p className="text-sm text-zinc-400 max-w-xs mx-auto">
            Aguardando conexão com o Códice. Se a tela permanecer preta, tente recarregar.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-amber-900/40 hover:bg-amber-800 border border-amber-500 text-amber-200 text-xs font-bold rounded-xl mt-4 transition-all uppercase tracking-widest"
          >
            Recarregar Sessão
          </button>
        </div>
      </div>
    );
  }

  // Helper to map role subtitles exactly matching the gothic mockup
  const getRoleSubtitle = (p: Player, isLeader: boolean): string => {
    if (isLeader) return 'Líder da Sala';
    if (p.roleTitle) return p.roleTitle;

    const char = CHARACTERS.find((c) => c.id === p.characterId);
    if (!char) return 'INVESTIGADOR';

    const titleMap: Record<string, string> = {
      char_investigador: 'INVESTIGADOR',
      char_perito: 'PERITO',
      char_advogado: 'ADVOGADO',
      char_01: 'DETECTIVE',
      char_02: 'HISTORIADORA',
      char_03: 'MÉDICO LEGISTA',
      char_jornalista: 'JORNALISTA',
      char_cumplice: 'ACÚMPLICE',
      char_informante: 'INFORMANTE',
      char_testemunha: 'TESTEMUNHA',
      char_auxiliar: 'INVESTIGADOR AUX.',
      char_oraculo: 'NARRADOR',
    };

    if (titleMap[char.id]) return titleMap[char.id];
    return (char.roleTag || char.title || 'INVESTIGADOR').toUpperCase();
  };

  return (
    <div
      id="lobby-screen-root"
      className="fixed inset-0 min-h-[100dvh] h-full w-full flex items-center justify-center bg-[#070404] text-[#e8dfd8] overflow-y-auto select-none p-2 sm:p-4 bg-cover bg-center"
      style={{ backgroundImage: `url(${codiceMorteLivroImg})` }}
    >
      {/* Background artwork with gothic vignette allowing the cursed book & skull to show */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/65 to-[#0c0404]/90" />
        <div className="absolute inset-0 bg-radial-gradient from-amber-950/20 via-black/40 to-black/80" />
      </div>

      {/* Main Card Container - Exact Mobile Frame with Single-Screen Layout & Mobile Scrollability */}
      <div
        id="lobby-main-card"
        className="relative z-10 w-full max-w-sm sm:max-w-md max-h-[96dvh] sm:max-h-[92vh] flex flex-col justify-between p-3 sm:p-4 rounded-2xl sm:rounded-3xl border-2 border-amber-600/60 bg-black/90 shadow-[0_0_50px_rgba(0,0,0,0.95)] overflow-y-auto sm:overflow-hidden bg-cover bg-center my-auto"
        style={{ backgroundImage: `url(${lobbyPainelArteImg})` }}
      >
        {/* Dark atmospheric vignette overlay to guarantee contrast and legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/75 to-black/92 backdrop-blur-[2px] pointer-events-none" />

        {/* Inner Gold Inset Frame */}
        <div className="absolute inset-0 rounded-2xl sm:rounded-3xl border border-amber-500/30 pointer-events-none shadow-[inset_0_0_24px_rgba(0,0,0,0.85)]" />

        {/* 1. Header (Shrink-0 so it stays fixed at top) */}
        <div className="relative z-10 shrink-0 mb-2">
          {/* Row 1: "LOBBY" Title & Discreet Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg overflow-hidden border border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.35)] bg-black/80 shrink-0 flex items-center justify-center">
                <img
                  src={codiceEmblemaCaveiraImg}
                  alt="Selo do Códice"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <h1 className="text-xl sm:text-2xl font-serif font-black tracking-[0.18em] text-amber-200 uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                LOBBY
              </h1>
            </div>

            {/* Quick Action Icons */}
            <div className="flex items-center gap-1.5">
              {isHost && room.players.length < (room.settings?.maxPlayers || 10) && (
                <button
                  id="btn-add-bot"
                  onClick={onAddBot}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-950/80 border border-amber-500/40 text-amber-300 hover:text-amber-100 hover:border-amber-400 transition-all text-[10px] font-mono font-bold"
                  title="Adicionar Investigador IA"
                >
                  <Bot className="w-3 h-3 text-amber-400" />
                  <span>+ Bot</span>
                </button>
              )}
              <button
                id="btn-qr-modal"
                onClick={() => setShowQrModal(true)}
                className="p-1.5 rounded-full bg-zinc-950/80 border border-amber-500/30 text-amber-300 hover:text-amber-100 hover:border-amber-400 transition-all"
                title="Código QR da Sala"
              >
                <QrCode className="w-3.5 h-3.5" />
              </button>
              <button
                id="btn-share-room"
                onClick={handleShareRoom}
                className="p-1.5 rounded-full bg-zinc-950/80 border border-amber-500/30 text-amber-300 hover:text-amber-100 hover:border-amber-400 transition-all"
                title="Compartilhar Link"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
              <button
                id="btn-open-rules"
                onClick={() => (onOpenRules ? onOpenRules() : setShowInternalRules(true))}
                className="p-1.5 rounded-full bg-zinc-950/80 border border-amber-500/30 text-amber-300 hover:text-amber-100 hover:border-amber-400 transition-all"
                title="Regras do Códice"
              >
                <BookOpen className="w-3.5 h-3.5" />
              </button>
              {onLeaveRoom && (
                <button
                  id="btn-leave-lobby"
                  onClick={onLeaveRoom}
                  className="p-1.5 rounded-full bg-zinc-950/80 border border-red-500/30 text-red-400 hover:text-red-200 hover:border-red-400 transition-all"
                  title="Sair do Lobby"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Row 2: Room Code, Player Count & Room Name */}
          <div className="flex items-end justify-between mt-2 pt-1 border-b border-amber-900/35 pb-2">
            <div>
              <div
                onClick={copyRoomCode}
                className="text-base sm:text-lg font-serif font-bold text-amber-300 tracking-wider flex items-center gap-1.5 cursor-pointer group"
                title="Clique para copiar o código"
              >
                <span>SALA #{room.code}</span>
                <Copy className="w-3.5 h-3.5 text-amber-400/60 group-hover:text-amber-300 transition-colors" />
                {copied && (
                  <span className="text-[10px] font-mono text-emerald-400 font-bold ml-1">
                    Copiado!
                  </span>
                )}
              </div>
              <div className="text-[11px] sm:text-xs font-serif text-amber-400/80 flex items-center gap-1 mt-0.5">
                <Users className="w-3.5 h-3.5 text-amber-400/70 inline" />
                <span>
                  {room.players.length}/{room.settings?.maxPlayers || 10} JOGADORES
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs sm:text-sm font-serif font-bold uppercase tracking-[0.14em] text-amber-400/90 drop-shadow">
                {room.roomName || 'INVESTIGAÇÃO SOMBRIA'}
              </span>
              {room.gameMode && (
                <div className="text-[9px] font-mono text-amber-500/70 tracking-widest uppercase mt-0.5">
                  MODO {room.gameMode}
                </div>
              )}
            </div>
          </div>

          {/* Row 3: Host Oracle Selector Control */}
          {isHost && (
            <div className="mt-2 space-y-1.5">
              {/* Oracle Designation Row */}
              <div className="pt-1.5 px-2 py-1.5 rounded-xl bg-black/60 border border-amber-500/30 flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-serif font-bold text-amber-300 uppercase tracking-wider">
                  <Eye className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Oráculo:</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      if (onDesignateOracle) onDesignateOracle('');
                      if (onUpdateSettings) onUpdateSettings({ oracleSelectionMode: 'random', designatedOraclePlayerId: undefined });
                    }}
                    className={`px-2 py-0.5 rounded-lg text-[9px] sm:text-[10px] font-serif font-bold uppercase tracking-wider transition-all border ${
                      !room.designatedOraclePlayerId && room.settings?.oracleSelectionMode !== 'host'
                        ? 'bg-amber-700 text-white border-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                        : 'bg-black/40 border-amber-900/40 text-zinc-400 hover:text-amber-200'
                    }`}
                    title="Sorteio aleatório às cegas"
                  >
                    🎲 Aleatório
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      if (onDesignateOracle) onDesignateOracle(myPlayerId);
                      if (onUpdateSettings) onUpdateSettings({ oracleSelectionMode: 'host', designatedOraclePlayerId: myPlayerId });
                    }}
                    className={`px-2 py-0.5 rounded-lg text-[9px] sm:text-[10px] font-serif font-bold uppercase tracking-wider transition-all border ${
                      room.designatedOraclePlayerId === myPlayerId || (room.settings?.oracleSelectionMode === 'host' && !room.designatedOraclePlayerId)
                        ? 'bg-amber-700 text-white border-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                        : 'bg-black/40 border-amber-900/40 text-zinc-400 hover:text-amber-200'
                    }`}
                    title="Você será o Oráculo"
                  >
                    👑 Eu (Host)
                  </button>
                </div>
              </div>

              {/* Eventos & Habilidades Toggles Row */}
              <div className="grid grid-cols-2 gap-1.5">
                {/* Eventos */}
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    const next = room.settings?.allowEvents !== false ? false : true;
                    if (onUpdateSettings) onUpdateSettings({ allowEvents: next });
                  }}
                  className={`px-2 py-1 rounded-xl text-[9px] sm:text-[10px] font-serif font-bold uppercase tracking-wider transition-all border flex items-center justify-between ${
                    room.settings?.allowEvents !== false
                      ? 'bg-orange-950/80 border-orange-500/60 text-orange-200 shadow-sm'
                      : 'bg-black/40 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                  }`}
                  title="Ativar/Desativar cartas de evento na rodada"
                >
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-orange-400" />
                    <span>Eventos</span>
                  </span>
                  <span className="font-mono text-[8px] font-black">{room.settings?.allowEvents !== false ? 'ON' : 'OFF'}</span>
                </button>

                {/* Habilidades */}
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    const next = room.settings?.allowAbilities !== false ? false : true;
                    if (onUpdateSettings) onUpdateSettings({ allowAbilities: next });
                  }}
                  className={`px-2 py-1 rounded-xl text-[9px] sm:text-[10px] font-serif font-bold uppercase tracking-wider transition-all border flex items-center justify-between ${
                    room.settings?.allowAbilities !== false
                      ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-200 shadow-sm'
                      : 'bg-black/40 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                  }`}
                  title="Ativar/Desativar cartas de habilidade dos jogadores"
                >
                  <span className="flex items-center gap-1">
                    <Shield className="w-2.5 h-2.5 text-emerald-400" />
                    <span>Habilidades</span>
                  </span>
                  <span className="font-mono text-[8px] font-black">{room.settings?.allowAbilities !== false ? 'ON' : 'OFF'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Host Bot Management Controls */}
          {isHost && (
            <div className="p-2 rounded-xl bg-gradient-to-r from-[#1c0e07] via-[#120703] to-[#1c0e07] border border-amber-900/50 flex flex-wrap items-center justify-between gap-1.5 shadow-sm">
              <div className="flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[10px] sm:text-xs font-serif font-bold text-amber-200">
                  Bots IA:
                </span>
                <span className="px-1.5 py-0.2 rounded bg-black/60 border border-amber-500/30 text-[10px] font-mono font-bold text-amber-400">
                  {botCount}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  id="lobby-add-bot-btn"
                  onClick={() => {
                    soundEngine.playClick();
                    onAddBot();
                  }}
                  disabled={room.players.length >= (room.settings?.maxPlayers || 10)}
                  className="px-2 py-0.5 rounded-lg bg-amber-900/60 hover:bg-amber-800 border border-amber-500/40 text-amber-200 hover:text-white text-[10px] font-mono font-bold transition-all disabled:opacity-40 flex items-center gap-0.5 cursor-pointer"
                  title="Incluir 1 Bot Investigador"
                >
                  <Plus className="w-2.5 h-2.5" /> Bot
                </button>
                {botCount > 0 && onRemoveBot && (
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      onRemoveBot();
                    }}
                    className="px-2 py-0.5 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-500/40 text-red-300 hover:text-white text-[10px] font-mono font-bold transition-all flex items-center gap-0.5 cursor-pointer"
                    title="Remover 1 Bot"
                  >
                    <Minus className="w-2.5 h-2.5" /> Bot
                  </button>
                )}
                {room.players.length < 4 && onFillBots && (
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      onFillBots(4);
                    }}
                    className="px-2 py-0.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 hover:text-white text-[10px] font-mono font-bold transition-all cursor-pointer"
                    title="Completar com Bots até 4 jogadores"
                  >
                    Preencher p/ 4
                  </button>
                )}
                {botCount > 0 && onClearBots && (
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      onClearBots();
                    }}
                    className="px-1.5 py-0.5 rounded-lg bg-zinc-900/80 hover:bg-red-950 border border-zinc-700/50 text-zinc-400 hover:text-red-300 text-[9px] font-mono transition-all cursor-pointer"
                    title="Remover todos os bots"
                  >
                    Limpar
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 2. Scrollable Player List - Strictly WITHOUT Visible Scrollbar */}
        <div
          id="lobby-players-list"
          className="relative z-10 flex-1 overflow-y-auto no-scrollbar min-h-0 divide-y divide-amber-950/20 py-1"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {room.players.length === 1 && (
            <div className="my-2 p-3 rounded-2xl bg-amber-950/20 border border-amber-600/30 text-center space-y-1">
              <p className="text-xs font-serif text-amber-200 font-bold">
                Você é o anfitrião da sala!
              </p>
              <p className="text-[11px] text-zinc-300 font-sans">
                Aguardando investigadores entrarem via <strong className="text-amber-300">QR Code</strong> ou link de convite. Se desejar, adicione bots nos botões de controle de IA acima.
              </p>
            </div>
          )}

          {room.players.map((player) => {
            const isCurrent = player.id === myPlayerId;
            const isLeader = player.isHost || player.id === room.players[0]?.id;
            const isDesignatedOracle = room.designatedOraclePlayerId === player.id || 
              (!room.designatedOraclePlayerId && room.settings?.oracleSelectionMode === 'host' && isLeader);

            let displayName = player.name;
            if (displayName.includes('(IA)')) {
              displayName = displayName.replace(/\s*\(IA\)/gi, '');
            }
            if (isCurrent && !displayName.includes('(Você)')) {
              displayName = `${displayName} (Você)`;
            }

            const roleSubtitle = getRoleSubtitle(player, isLeader);

            return (
              <div
                key={player.id}
                className={`group flex items-center justify-between py-2 sm:py-2.5 px-2 rounded-xl transition-colors ${
                  isCurrent ? 'bg-amber-950/25 border border-amber-500/20' : 'hover:bg-white/[0.02]'
                }`}
              >
                {/* Left: Round Illustrated Victorian Avatar + Player Info */}
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <div
                    className={`relative cursor-pointer shrink-0 rounded-full group/avatar transition-transform hover:scale-105 active:scale-95 ${
                      isCurrent ? 'ring-2 ring-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.5)]' : 'ring-1 ring-amber-500/30'
                    }`}
                    onClick={() => isCurrent && setShowCharModal(true)}
                    title={isCurrent ? 'Clique para trocar de personagem' : undefined}
                  >
                    <GothicAvatar
                      characterId={player.characterId}
                      name={player.name}
                      size="md"
                      glow={isCurrent}
                      border={false}
                    />
                    {isCurrent && (
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 rounded-full flex items-center justify-center transition-opacity">
                        <span className="text-[7.5px] font-serif font-black text-amber-300 uppercase tracking-tighter text-center">
                          TROCAR
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      {isCurrent && isEditingName ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={nameInput}
                            maxLength={20}
                            autoFocus
                            onChange={(e) => setNameInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveName();
                              if (e.key === 'Escape') setIsEditingName(false);
                            }}
                            className="px-2 py-0.5 rounded bg-black/90 border border-amber-400 text-amber-200 text-xs font-serif font-bold focus:outline-none w-32 sm:w-44"
                            placeholder="Seu nome..."
                          />
                          <button
                            type="button"
                            onClick={handleSaveName}
                            className="p-1 rounded bg-amber-700 hover:bg-amber-600 text-white"
                            title="Salvar nome"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsEditingName(false)}
                            className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                            title="Cancelar"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="font-serif font-bold text-sm sm:text-[15px] text-amber-100/95 tracking-wide truncate">
                            {displayName}
                          </span>
                          {isCurrent && onUpdatePlayerName && (
                            <button
                              type="button"
                              onClick={() => {
                                setNameInput(player.name);
                                setIsEditingName(true);
                              }}
                              className="ml-1 px-1.5 py-0.5 rounded bg-amber-950/70 border border-amber-500/40 text-amber-300 hover:text-white hover:border-amber-300 transition-all text-[9.5px] font-mono flex items-center gap-1 shadow-sm cursor-pointer"
                              title="Alterar seu nome"
                            >
                              <Edit3 className="w-2.5 h-2.5" />
                              <span>Mudar nome</span>
                            </button>
                          )}
                        </>
                      )}
                      {isDesignatedOracle && (
                        <span className="px-1.5 py-0.2 rounded-full bg-amber-950 border border-amber-400 text-amber-300 text-[8px] sm:text-[9px] font-serif font-black tracking-wider uppercase flex items-center gap-0.5 shrink-0 shadow-[0_0_8px_rgba(245,158,11,0.5)]">
                          <Eye className="w-2.5 h-2.5 text-amber-400 inline" />
                          <span>ORÁCULO</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] sm:text-[11px] font-serif uppercase tracking-[0.15em] text-amber-400/70 font-semibold truncate">
                        {roleSubtitle}
                      </span>
                      {isCurrent && (
                        <button
                          type="button"
                          onClick={() => setShowCharModal(true)}
                          className="text-[9px] text-amber-400 hover:text-amber-200 underline font-serif font-bold"
                        >
                          [Trocar]
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions, Crown, Oracle Toggle, Ready Status */}
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  {/* Host can designate this player as oracle */}
                  {isHost && (
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        const nextOracleId = isDesignatedOracle ? '' : player.id;
                        if (onDesignateOracle) onDesignateOracle(nextOracleId);
                        if (onUpdateSettings) onUpdateSettings({ designatedOraclePlayerId: nextOracleId, oracleSelectionMode: nextOracleId ? 'custom' : 'random' });
                      }}
                      className={`p-1 rounded-lg border transition-all text-xs ${
                        isDesignatedOracle
                          ? 'bg-amber-900/80 border-amber-400 text-amber-200'
                          : 'bg-black/40 border-zinc-700/50 text-zinc-500 hover:text-amber-300 hover:border-amber-500/40 opacity-40 group-hover:opacity-100'
                      }`}
                      title={isDesignatedOracle ? 'Definido como Oráculo (clique para remover)' : 'Designar como Oráculo'}
                    >
                      <Eye className="w-3 h-3" />
                    </button>
                  )}

                  {isCurrent ? (
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        onToggleReady();
                      }}
                      className={`px-3 py-1 rounded-xl font-serif text-[10px] sm:text-xs font-black tracking-wider uppercase transition-all shadow-md active:scale-95 border ${
                        player.isReady
                          ? 'bg-gradient-to-r from-emerald-800 to-emerald-950 border-emerald-400 text-emerald-200 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                          : 'bg-gradient-to-r from-[#3d1808] to-[#1f0b04] border-amber-500/50 text-amber-200 hover:border-amber-400'
                      }`}
                    >
                      {player.isReady ? '✓ PRONTO' : 'FICAR PRONTO'}
                    </button>
                  ) : player.isReady ? (
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-[10px] sm:text-xs font-serif font-black text-emerald-400 tracking-wider shadow-[0_0_8px_rgba(16,185,129,0.4)] uppercase">
                      ✓ PRONTO
                    </span>
                  ) : null}

                  {isLeader && (
                    <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                  )}

                  {/* Host option to remove AI investigator */}
                  {isHost && player.isAI && onRemoveBot && (
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        onRemoveBot(player.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 hover:opacity-100 text-zinc-500 hover:text-red-400 p-1 transition-opacity text-xs cursor-pointer"
                      title="Remover Bot"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 3. Footer (Shrink-0 so it stays fixed at bottom) */}
        <div className="relative z-10 shrink-0 pt-2 pb-0.5">
          {/* "AGUARDANDO..." Pulsing Text */}
          <div className="text-center mb-2">
            <span className="text-[11px] sm:text-xs font-serif font-bold uppercase tracking-[0.25em] text-amber-400/80 animate-pulse drop-shadow">
              AGUARDANDO...
            </span>
          </div>

          {/* "INICIAR PARTIDA" Dark Crimson Button */}
          <button
            id="btn-start-game"
            onClick={handleStart}
            className="w-full relative py-3.5 sm:py-4 px-6 rounded-xl sm:rounded-2xl bg-gradient-to-b from-[#5c0e0e] via-[#3a0808] to-[#1e0404] hover:from-[#751616] hover:to-[#2b0606] border border-amber-600/70 hover:border-amber-400 shadow-[0_4px_24px_rgba(92,14,14,0.75)] transition-all transform active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 group overflow-hidden"
          >
            {/* Subtle corner decorations */}
            <div className="absolute top-1 left-1 w-1.5 h-1.5 border-t border-l border-amber-400/60" />
            <div className="absolute top-1 right-1 w-1.5 h-1.5 border-t border-r border-amber-400/60" />
            <div className="absolute bottom-1 left-1 w-1.5 h-1.5 border-b border-l border-amber-400/60" />
            <div className="absolute bottom-1 right-1 w-1.5 h-1.5 border-b border-r border-amber-400/60" />

            <span className="font-serif font-black text-sm sm:text-base uppercase tracking-[0.22em] text-amber-200 group-hover:text-white drop-shadow-md">
              INICIAR PARTIDA
            </span>
          </button>
        </div>
      </div>

      {/* Character Select Modal */}
      {showCharModal && myPlayer && (
        <CharacterSelectModal
          selectedCharId={myPlayer.characterId}
          onClose={() => setShowCharModal(false)}
          onSelect={(char) => {
            const charId = typeof char === 'string' ? char : char.id;
            onUpdateCharacter(charId);
            setShowCharModal(false);
          }}
          takenCharIds={takenCharIds.filter((id) => id !== myPlayer.characterId)}
        />
      )}

      {/* QR Code / Share Room Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 animate-fade-in text-[#e8dfd8]">
          <div className="relative w-full max-w-xs rounded-2xl border-2 border-amber-600/50 bg-black/95 p-5 flex flex-col items-center shadow-2xl">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-3 right-3 p-1 rounded-full text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-serif font-bold text-amber-200 text-sm uppercase tracking-widest mb-1">
              CONVITE DA SALA
            </h3>
            <span className="font-mono text-xs text-amber-400 font-bold tracking-wider mb-3">
              CÓDIGO: {room.code}
            </span>

            {qrDataUrl && (
              <div className="p-2 rounded-xl bg-black border border-amber-500/40 shadow-inner mb-3">
                <img
                  src={qrDataUrl}
                  alt="QR Code"
                  className="w-48 h-48 rounded-lg"
                />
              </div>
            )}

            <div className="w-full space-y-2 mt-1">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  const waText = encodeURIComponent(
                    `🕵️ *O CÓDICE DA MORTE* 📜\nVenha desvendar o assassinato na biblioteca ancestral!\nEntre na sala com o código: *${room.code}*\n\nClique no link direto para entrar:\n${roomUrl}`
                  );
                  window.open(`https://api.whatsapp.com/send?text=${waText}`, '_blank');
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-green-950 hover:from-emerald-900 hover:to-green-900 border border-emerald-500/70 text-emerald-200 text-xs font-serif font-bold tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer"
              >
                <span>CONVIDAR NO WHATSAPP</span>
              </button>

              <button
                type="button"
                onClick={handleShareRoom}
                className="w-full py-2 px-3 rounded-xl bg-amber-950/70 border border-amber-500/50 hover:border-amber-400 text-amber-200 text-xs font-serif font-bold tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'LINK COPIADO!' : 'COPIAR LINK DA SALA'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Internal Rules Modal */}
      {showInternalRules && (
        <RulesReferenceModal
          isOpen={showInternalRules}
          onClose={() => setShowInternalRules(false)}
        />
      )}
    </div>
  );
};
