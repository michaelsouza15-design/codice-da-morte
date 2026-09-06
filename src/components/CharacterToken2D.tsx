import React, { useRef } from 'react';
import { Player, Character } from '../types/game';
import { CHARACTERS } from '../data/gameData';
import { CHARACTER_IMAGES } from '../assets/characters';
import { CHAR_SPRITE_MAP } from './GothicAvatar';
import { useCustomCardArt, promptCardArtUpload } from '../utils/customCardArt';
import {
  ShieldAlert,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
  Eye,
  HelpCircle,
  FolderOpen,
} from 'lucide-react';

interface CharacterToken2DProps {
  player: Player;
  seatNumber?: number;
  isSelected?: boolean;
  isMe?: boolean;
  onClick: () => void;
  roleOverride?: string;
  roleColorOverride?: string;
  isAssassin?: boolean;
  isAccomplice?: boolean;
  isSaboteur?: boolean;
}

export const CharacterToken2D: React.FC<CharacterToken2DProps> = ({
  player,
  seatNumber,
  isSelected,
  isMe,
  onClick,
  roleOverride,
  roleColorOverride,
  isAssassin,
  isAccomplice,
  isSaboteur,
}) => {
  const lastTapRef = useRef<number>(0);
  const char: Character | undefined = CHARACTERS.find((c) => c.id === player.characterId);
  const displayNumber = String(seatNumber !== undefined ? seatNumber : (player.seatNumber + 1)).padStart(2, '0');

  // Resolve sprite image
  const seed = (char?.avatarSeed || player.name || '').toLowerCase().trim();
  let spriteIdx = 0;
  if (CHAR_SPRITE_MAP[seed] !== undefined) {
    spriteIdx = CHAR_SPRITE_MAP[seed];
  } else if (player.characterId && CHAR_SPRITE_MAP[player.characterId.toLowerCase().trim()] !== undefined) {
    spriteIdx = CHAR_SPRITE_MAP[player.characterId.toLowerCase().trim()];
  } else if (char?.spriteIndex !== undefined) {
    spriteIdx = char.spriteIndex;
  }
  spriteIdx = Math.abs(spriteIdx) % CHARACTER_IMAGES.length;
  const defaultImgSrc = CHARACTER_IMAGES[spriteIdx] || CHARACTER_IMAGES[0];

  // Dynamic custom uploaded art hook check (for custom PNGs and crests/brasões)
  const cleanCharId = player.characterId || `char_${String(spriteIdx).padStart(2, '0')}`;
  const lookupIds = [
    `crest_${cleanCharId}`,
    `brasao_${cleanCharId}`,
    `crest_char_${spriteIdx}`,
    `crest_${spriteIdx}`,
    `crest_${spriteIdx + 1}`,
    cleanCharId,
    seed,
    player.name || '',
    `char_${spriteIdx}`,
    `char_${String(spriteIdx).padStart(2, '0')}`,
  ].filter(Boolean);

  const customArt = useCustomCardArt(lookupIds);
  const imgSrc = customArt || defaultImgSrc;

  // Role tag determination (SECRET ROLES: only visible to self or if role is public Oracle)
  const isOracle = player.role === 'oraculo';
  const roleName = roleOverride || (
    isMe
      ? (player.role === 'oraculo' ? 'Oráculo' :
         player.role === 'assassino' ? 'Assassino' :
         player.role === 'cumplice' ? 'Ocultista' :
         char?.roleTag || 'Investigador')
      : isOracle
      ? 'Oráculo'
      : 'Suspeito'
  );

  // Role color determination
  const roleColorClass = roleColorOverride || (
    isOracle ? 'text-purple-400 border-purple-500/40 bg-purple-950/70' :
    !isMe ? 'text-zinc-400 border-zinc-700/40 bg-zinc-900/70' :
    roleName.toLowerCase().includes('assassino') ? 'text-red-400 border-red-500/40 bg-red-950/70' :
    roleName.toLowerCase().includes('ocultista') || roleName.toLowerCase().includes('cúmplice') ? 'text-violet-400 border-violet-500/40 bg-violet-950/70' :
    roleName.toLowerCase().includes('perito') || roleName.toLowerCase().includes('forense') ? 'text-sky-400 border-sky-500/40 bg-sky-950/70' :
    roleName.toLowerCase().includes('jornalista') ? 'text-amber-400 border-amber-500/40 bg-amber-950/70' :
    'text-emerald-400 border-emerald-500/40 bg-emerald-950/70'
  );

  const roleTextClass = (
    isOracle ? 'text-purple-400' :
    !isMe ? 'text-zinc-400' :
    roleName.toLowerCase().includes('assassino') ? 'text-red-400' :
    roleName.toLowerCase().includes('ocultista') || roleName.toLowerCase().includes('cúmplice') ? 'text-violet-400' :
    roleName.toLowerCase().includes('perito') || roleName.toLowerCase().includes('forense') ? 'text-sky-400' :
    roleName.toLowerCase().includes('jornalista') ? 'text-amber-400' :
    'text-emerald-400'
  );

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const targetId = `crest_${cleanCharId}`;
    promptCardArtUpload(targetId, {
      name: `Brasão: ${player.name || char?.name || targetId}`,
      aliases: lookupIds,
    });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const now = Date.now();
    if (now - lastTapRef.current < 350) {
      e.stopPropagation();
      const targetId = `crest_${cleanCharId}`;
      promptCardArtUpload(targetId, {
        name: `Brasão: ${player.name || char?.name || targetId}`,
        aliases: lookupIds,
      });
    }
    lastTapRef.current = now;
  };

  return (
    <div
      onClick={onClick}
      onDoubleClick={handleDoubleClick}
      onTouchEnd={handleTouchEnd}
      className={`group relative flex flex-col items-center cursor-pointer transition-all duration-300 transform select-none hover:-translate-y-1.5 focus:outline-none shrink-0 ${
        isSelected ? 'scale-105' : ''
      }`}
      style={{ minWidth: '64px', maxWidth: '105px' }}
      title={`Clique para ver cartas de ${player.name}. Duplo clique para subir brasão.`}
    >
      {/* Top Pill: Number Badge & Name */}
      <div className="flex flex-col items-center mb-0.5 sm:mb-1 z-10 w-full px-0.5">
        <div className="flex items-center gap-0.5 sm:gap-1">
          <span className="text-[8px] sm:text-[9px] font-mono font-bold text-amber-300 bg-black/90 border border-amber-500/50 px-1 py-0.2 rounded shadow-md backdrop-blur-xs">
            {displayNumber}
          </span>
          {isMe && (
            <span className="text-[7px] sm:text-[8px] font-mono font-bold text-amber-200 bg-amber-600/90 px-1 rounded shadow">
              VOCÊ
            </span>
          )}
          {isOracle && (
            <span className="text-[7px] sm:text-[8px] font-mono font-bold text-purple-200 bg-purple-900/90 border border-purple-400/60 px-1 rounded shadow animate-pulse">
              👑 ORÁCULO
            </span>
          )}
          {isAssassin && (
            <span className="text-[7px] sm:text-[8px] font-mono font-bold text-red-100 bg-red-950/95 border border-red-500/80 px-1 rounded shadow animate-pulse">
              🔪 ASSASSINO
            </span>
          )}
          {isAccomplice && (
            <span className="text-[7px] sm:text-[8px] font-mono font-bold text-violet-100 bg-violet-950/95 border border-violet-500/80 px-1 rounded shadow">
              👁️ CÚMPLICE
            </span>
          )}
          {isSaboteur && (
            <span className="text-[7px] sm:text-[8px] font-mono font-bold text-amber-100 bg-amber-950/95 border border-amber-500/80 px-1 rounded shadow">
              💣 SABOTADOR
            </span>
          )}
        </div>
        <span className="text-[10px] sm:text-xs font-serif font-bold text-zinc-100 tracking-wider group-hover:text-amber-300 transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] text-center w-full truncate mt-0.5">
          {player.name || char?.name}
        </span>
        <span className={`text-[8px] sm:text-[9px] font-serif font-semibold tracking-wide ${roleTextClass} drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] text-center truncate w-full`}>
          {isOracle ? '🔮 Guia da Cena do Crime' : roleName}
        </span>
      </div>

      {/* 2D Bonequinho Body & Frame */}
      <div className="relative flex flex-col items-center">
        {/* Ambient Ring / Halo */}
        <div
          className={`w-13 h-16 sm:w-18 sm:h-22 md:w-20 md:h-24 rounded-xl sm:rounded-2xl overflow-hidden relative border transition-all duration-300 shadow-2xl ${
            isOracle
              ? 'border-purple-400/90 ring-2 ring-purple-500/80 shadow-[0_0_24px_rgba(168,85,247,0.6)] bg-purple-950/40'
              : isAssassin
              ? 'border-red-500 ring-2 ring-red-500/90 shadow-[0_0_25px_rgba(239,68,68,0.85)] bg-red-950/50 animate-pulse'
              : isAccomplice
              ? 'border-violet-500 ring-2 ring-violet-500/80 shadow-[0_0_20px_rgba(139,92,246,0.7)] bg-violet-950/40'
              : isSaboteur
              ? 'border-amber-500 ring-2 ring-amber-500/80 shadow-[0_0_20px_rgba(245,158,11,0.7)] bg-amber-950/40'
              : isSelected
              ? 'border-amber-400 ring-2 ring-amber-400/80 shadow-[0_0_20px_rgba(251,191,36,0.6)]'
              : isMe
              ? 'border-amber-500/70 ring-1 ring-amber-500/50 shadow-[0_0_14px_rgba(245,158,11,0.4)]'
              : 'border-white/20 group-hover:border-amber-400/70 group-hover:shadow-[0_0_16px_rgba(251,191,36,0.3)] bg-black/60'
          }`}
        >
          {/* Character 2D Standing Figure Image */}
          <img
            src={imgSrc}
            alt={player.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            referrerPolicy="no-referrer"
          />

          {/* Vignette Overlay for dark gothic ambiance */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

          {/* Special Role Badge Overlay */}
          {isAssassin && (
            <div className="absolute top-1 left-1 bg-red-950/95 border border-red-500 p-0.5 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse" title="Assassino Secreto">
              <span className="text-[9px] leading-none block">🔪</span>
            </div>
          )}
          {isAccomplice && (
            <div className="absolute top-1 left-1 bg-violet-950/95 border border-violet-500 p-0.5 rounded-full shadow-[0_0_8px_rgba(139,92,246,0.7)]" title="Cúmplice">
              <span className="text-[9px] leading-none block">👁️</span>
            </div>
          )}
          {isSaboteur && (
            <div className="absolute top-1 left-1 bg-amber-950/95 border border-amber-500 p-0.5 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.7)]" title="Sabotador">
              <span className="text-[9px] leading-none block">💣</span>
            </div>
          )}

          {/* Status Badges Overlay */}
          {player.hasAccused && (
            <div className="absolute top-1 right-1 bg-red-950/90 border border-red-500/60 p-0.5 rounded-full shadow" title="Acusação já utilizada">
              <ShieldAlert className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-400" />
            </div>
          )}

          {/* Quick Hover Prompt */}
          <div className="absolute inset-x-0 bottom-0 py-0.5 bg-black/85 text-[7px] sm:text-[8px] font-mono text-amber-300 text-center opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-0.5 border-t border-amber-500/30">
            {isOracle ? (
              <span className="text-purple-300">🔮 Guia Forense</span>
            ) : (
              <>
                <FolderOpen className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                Cartas
              </>
            )}
          </div>
        </div>

        {/* Floor Shadow & Arcane Circle Ritual Base */}
        <div className={`w-13 sm:w-18 md:w-20 h-3.5 sm:h-4 mt-[-5px] sm:mt-[-6px] rounded-[50%] bg-black/90 border ${
          isOracle
            ? 'border-purple-500/60 shadow-[0_0_14px_rgba(168,85,247,0.6)]'
            : isAssassin
            ? 'border-red-500/80 shadow-[0_0_16px_rgba(239,68,68,0.8)]'
            : isAccomplice
            ? 'border-violet-500/80 shadow-[0_0_14px_rgba(139,92,246,0.7)]'
            : isSaboteur
            ? 'border-amber-500/80 shadow-[0_0_14px_rgba(245,158,11,0.7)]'
            : 'border-amber-500/30'
        } shadow-[0_0_10px_rgba(0,0,0,0.9)] flex items-center justify-center relative pointer-events-none group-hover:border-amber-400 group-hover:shadow-[0_0_12px_rgba(251,191,36,0.4)] transition-all`}>
          <div className={`w-10 sm:w-14 h-2 sm:h-2.5 rounded-[50%] ${
            isOracle
              ? 'bg-purple-900/60 border border-purple-400/40'
              : isAssassin
              ? 'bg-red-950/80 border border-red-500/50 shadow-[0_0_8px_rgba(239,68,68,0.7)]'
              : isAccomplice
              ? 'bg-violet-950/80 border border-violet-500/50'
              : isSaboteur
              ? 'bg-amber-950/80 border border-amber-500/50'
              : 'bg-amber-950/40 border border-amber-400/20'
          }`} />
        </div>
      </div>

      {/* Mini Badge for Oracle or Suspect Cards */}
      {isOracle ? (
        <div className="mt-0.5 sm:mt-1 flex flex-col items-center">
          <div className="flex items-center gap-1 text-[7px] sm:text-[8px] font-serif font-bold bg-purple-950/90 text-purple-200 px-1.5 sm:px-2 py-0.5 rounded-full border border-purple-400/60 shadow-md">
            <span>🔮 Mestre da Cena</span>
            <span className="text-purple-400 font-mono text-[6px]">(Sem Cartas)</span>
          </div>
        </div>
      ) : player.methods.length > 0 && player.objects.length > 0 ? (
        <div className="mt-0.5 sm:mt-1 flex flex-col items-center gap-0.5">
          {/* Mini Cards Deck Pill */}
          <div className="flex items-center gap-1 text-[8px] sm:text-[9px] font-serif font-bold bg-black/85 px-1.5 sm:px-2 py-0.5 rounded-full border border-amber-500/40 group-hover:border-amber-400 group-hover:shadow-[0_0_8px_rgba(245,158,11,0.4)] transition-all shadow-md">
            <span className="flex items-center gap-0.5 text-red-400">
              <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-red-500" />
              <span className="hidden sm:inline">{player.methods.length} Métodos</span>
              <span className="sm:hidden">{player.methods.length}M</span>
            </span>
            <span className="text-zinc-600">•</span>
            <span className="flex items-center gap-0.5 text-amber-400">
              <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-amber-400" />
              <span className="hidden sm:inline">{player.objects.length} Objetos</span>
              <span className="sm:hidden">{player.objects.length}O</span>
            </span>
          </div>

          {/* Mini Card Row Preview on Tabletop */}
          <div className="flex items-center gap-0.5 opacity-85 group-hover:opacity-100 transition-opacity">
            {player.methods.slice(0, 2).map((m) => (
              <div
                key={m.id}
                className="w-3 h-4 sm:w-4 sm:h-5 rounded-xs bg-gradient-to-b from-[#3a100b] to-[#120403] border border-red-500/60 shadow-sm flex items-center justify-center text-[5px] sm:text-[6px] font-mono font-bold text-red-300"
                title={`Método: ${m.name}`}
              >
                M
              </div>
            ))}
            {player.objects.slice(0, 2).map((o) => (
              <div
                key={o.id}
                className="w-3 h-4 sm:w-4 sm:h-5 rounded-xs bg-gradient-to-b from-[#3a280b] to-[#120d03] border border-amber-500/60 shadow-sm flex items-center justify-center text-[5px] sm:text-[6px] font-mono font-bold text-amber-300"
                title={`Objeto: ${o.name}`}
              >
                O
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};
