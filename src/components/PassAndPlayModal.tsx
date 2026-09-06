import React, { useState } from 'react';
import { RoomState, Player, Character, MarkerColor } from '../types/game';
import { CHARACTERS, ABILITIES } from '../data/gameData';
import {
  Smartphone,
  Users,
  Eye,
  EyeOff,
  Skull,
  Shield,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Play,
  X,
  ChevronRight,
  ShieldAlert,
  HelpCircle,
  Clock,
  Volume2,
  BookOpen,
} from 'lucide-react';
import { MethodCard, ObjectCard } from './GothicCard';
import { OracleView } from './OracleView';
import { AccusationModal } from './AccusationModal';
import { GothicAvatar } from './GothicAvatar';

interface PassAndPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartLocalGame: (playersConfig: { name: string; characterId: string }[]) => void;
}

export const PassAndPlaySetupModal: React.FC<PassAndPlayModalProps> = ({
  isOpen,
  onClose,
  onStartLocalGame,
}) => {
  const [playerCount, setPlayerCount] = useState<number>(4);
  const [playersList, setPlayersList] = useState<{ name: string; characterId: string }[]>([
    { name: 'Investigador 1', characterId: CHARACTERS[0].id },
    { name: 'Investigador 2', characterId: CHARACTERS[1].id },
    { name: 'Investigador 3', characterId: CHARACTERS[2].id },
    { name: 'Investigador 4', characterId: CHARACTERS[3].id },
  ]);

  if (!isOpen) return null;

  const handleCountChange = (count: number) => {
    setPlayerCount(count);
    const newList = [...playersList];
    while (newList.length < count) {
      const idx = newList.length;
      const char = CHARACTERS[idx % CHARACTERS.length];
      newList.push({ name: `Investigador ${idx + 1}`, characterId: char.id });
    }
    setPlayersList(newList.slice(0, count));
  };

  const handleUpdateName = (index: number, name: string) => {
    const newList = [...playersList];
    newList[index].name = name;
    setPlayersList(newList);
  };

  const handleUpdateChar = (index: number, charId: string) => {
    const newList = [...playersList];
    newList[index].characterId = charId;
    setPlayersList(newList);
  };

  const handleStart = () => {
    onStartLocalGame(playersList);
  };

  return (
    <div
      id="pass-and-play-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/85 backdrop-blur-xl animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl glass-ui-amber card-shadow rounded-2xl sm:rounded-3xl border-amber-400/40 p-4 sm:p-6 md:p-7 space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start sm:items-center justify-between border-b border-amber-500/20 pb-4 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl glass-ui-amber border-amber-400/60 flex items-center justify-center shadow-lg shrink-0">
              <Smartphone className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg md:text-xl font-serif font-bold text-white uppercase tracking-[0.12em]">
                SALA LOCAL: PASSAR O APARELHO
              </h2>
              <p className="text-[11px] sm:text-xs text-amber-300/80 font-sans">
                De 4 a 12 jogadores reunidos passando o celular para ações secretas!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl glass-ui text-zinc-400 hover:text-white transition-colors border border-white/10 shrink-0"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Player Count Selector (4 to 12) */}
        <div className="space-y-2">
          <label className="text-[11px] sm:text-xs font-mono uppercase tracking-widest text-amber-300 block font-bold">
            Quantidade de Jogadores Presentes ({playerCount} Jogadores)
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-1.5">
            {[4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleCountChange(num)}
                className={`py-2 px-1 rounded-xl font-serif font-bold text-xs transition-all border text-center ${
                  playerCount === num
                    ? 'bg-amber-600 text-white border-amber-400 shadow-md shadow-amber-950/80 scale-[1.03]'
                    : 'glass-ui text-zinc-300 border-white/10 hover:border-amber-400/50 hover:text-white'
                }`}
              >
                {num} {num <= 4 ? 'Mín' : num === 12 ? 'Máx' : 'Jog.'}
              </button>
            ))}
          </div>
        </div>

        {/* Players Configuration List */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] sm:text-xs font-mono uppercase tracking-widest text-amber-300 block font-bold">
              Nomes e Personagens dos Jogadores (1 a {playerCount})
            </label>
            <span className="text-[10px] font-mono text-zinc-400">
              Role para ver todos
            </span>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
            {playersList.map((p, idx) => {
              const char = CHARACTERS.find((c) => c.id === p.characterId) || CHARACTERS[0];
              return (
                <div
                  key={idx}
                  className="p-3 rounded-xl glass-ui bg-black/50 border-white/10 hover:border-amber-400/40 transition-colors flex flex-col gap-2.5"
                >
                  {/* Top line: # number badge + Name input + Avatar */}
                  <div className="flex items-center gap-2.5 w-full">
                    <span className="w-7 h-7 rounded-lg bg-amber-950/80 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                      #{idx + 1}
                    </span>

                    <input
                      type="text"
                      value={p.name}
                      onChange={(e) => handleUpdateName(idx, e.target.value)}
                      placeholder={`Nome do Jogador ${idx + 1}`}
                      className="flex-1 glass-ui bg-black/40 border-white/10 px-3 py-1.5 rounded-lg text-xs font-serif text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
                    />

                    <GothicAvatar
                      characterId={char.id}
                      avatarSeed={char.avatarSeed}
                      name={char.name}
                      size="sm"
                    />
                  </div>

                  {/* Bottom line: Full width character picker select */}
                  <div className="w-full">
                    <select
                      value={p.characterId}
                      onChange={(e) => handleUpdateChar(idx, e.target.value)}
                      className="w-full glass-ui bg-black/70 border-white/15 px-3 py-1.5 rounded-lg text-xs font-serif text-amber-200 focus:outline-none focus:border-amber-400"
                    >
                      {CHARACTERS.map((c) => (
                        <option key={c.id} value={c.id} className="bg-zinc-950 text-amber-100 py-1">
                          {c.number ? `#${String(c.number).padStart(2, '0')} ` : ''}{c.name} — {c.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rule Reminder */}
        <div className="p-3.5 rounded-xl glass-ui bg-amber-950/30 border-amber-500/25 text-xs text-amber-200/90 font-serif leading-relaxed flex items-start gap-2.5">
          <HelpCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-[11px] sm:text-xs">
            <strong>Fluxo Secreto Seguro:</strong> Cada jogador receberá o celular em ordem para conferir em segredo seu papel. O Assassino escolhe sua combinação fatal na sua própria vez. Ao final, o celular vai ao <strong>Oráculo</strong> para marcar as tábuas de evidência!
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-3 border-t border-amber-500/20">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl glass-ui text-zinc-300 text-xs font-serif font-bold uppercase tracking-wider hover:text-white transition-all text-center"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleStart}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-serif font-bold uppercase tracking-[0.18em] transition-all shadow-xl shadow-amber-950/80 border border-amber-400/50"
          >
            <Play className="w-4 h-4 text-amber-100" />
            Iniciar Partida ({playerCount} Jogadores)
          </button>
        </div>
      </div>
    </div>
  );
};

interface PassDeviceScreenProps {
  targetPlayerName: string;
  targetPlayerTitle?: string;
  actionDescription: string;
  onReady: () => void;
}

export const PassDeviceScreen: React.FC<PassDeviceScreenProps> = ({
  targetPlayerName,
  targetPlayerTitle,
  actionDescription,
  onReady,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0502]/95 backdrop-blur-2xl animate-fade-in text-center">
      <div className="max-w-md w-full glass-ui-amber card-shadow rounded-2xl border-amber-400/40 p-8 space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl glass-ui-amber border-amber-400/60 flex items-center justify-center shadow-2xl animate-pulse">
          <Smartphone className="w-8 h-8 text-amber-400" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono uppercase tracking-[0.25em] text-red-400 block font-bold">
            CORTINA DE PRIVACIDADE
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-black text-white uppercase tracking-wider">
            PASSE O DISPOSITIVO PARA:
          </h2>
          <div className="p-3.5 rounded-xl glass-ui bg-black/60 border-amber-400/40 my-3">
            <h3 className="text-xl font-serif font-extrabold text-amber-300">{targetPlayerName}</h3>
            {targetPlayerTitle && (
              <span className="text-xs text-zinc-400 font-sans">{targetPlayerTitle}</span>
            )}
          </div>
          <p className="text-xs text-zinc-300 font-serif leading-relaxed opacity-80">
            {actionDescription}
          </p>
        </div>

        <button
          onClick={onReady}
          className="w-full py-4 rounded-xl bg-amber-600/90 hover:bg-amber-500 text-white font-serif font-bold text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-amber-950/80 border border-amber-400/50 flex items-center justify-center gap-2"
        >
          <Eye className="w-4 h-4" />
          Estou com o celular em mãos
        </button>
      </div>
    </div>
  );
};

interface LocalRoleRevealProps {
  player: Player;
  onNext: () => void;
  isLastPlayer: boolean;
  onKillerSelect?: (methodId: string, objectId: string) => void;
  selectedMethodId?: string;
  selectedObjectId?: string;
}

export const LocalRoleRevealModal: React.FC<LocalRoleRevealProps> = ({
  player,
  onNext,
  isLastPlayer,
  onKillerSelect,
  selectedMethodId,
  selectedObjectId,
}) => {
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [localMethodId, setLocalMethodId] = useState<string>(selectedMethodId || (player.methods[0]?.id || ''));
  const [localObjectId, setLocalObjectId] = useState<string>(selectedObjectId || (player.objects[0]?.id || ''));

  const char = CHARACTERS.find((c) => c.id === player.characterId) || CHARACTERS[0];

  const getRoleName = () => {
    if (player.role === 'oraculo') return 'ORÁCULO SAGRADO';
    if (player.role === 'assassino') return 'O ASSASSINO';
    if (player.role === 'cumplice') return 'O CÚMPLICE';
    if (player.role === 'sabotador') return 'O SABOTADOR';
    return 'INVESTIGADOR';
  };

  const getRoleColor = () => {
    if (player.role === 'oraculo') return 'text-amber-400 border-amber-400/50 bg-amber-950/50';
    if (player.role === 'assassino') return 'text-red-400 border-red-500/50 bg-red-950/50';
    if (player.role === 'cumplice') return 'text-purple-400 border-purple-500/50 bg-purple-950/50';
    return 'text-blue-400 border-blue-500/50 bg-blue-950/50';
  };

  const handleConfirmAndNext = () => {
    if (player.role === 'assassino' && onKillerSelect) {
      if (!localMethodId || !localObjectId) {
        alert('Assassino: Selecione 1 Método e 1 Objeto entre suas cartas para o crime antes de prosseguir.');
        return;
      }
      onKillerSelect(localMethodId, localObjectId);
    }
    onNext();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-fade-in">
      <div className="max-w-2xl w-full glass-ui-amber card-shadow rounded-2xl border-amber-400/40 p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="text-center space-y-2 border-b border-amber-500/20 pb-4">
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-amber-300">
            Identidade Secreta de {player.name}
          </span>
          <h2 className="text-xl font-serif font-bold text-white uppercase tracking-wider">
            {char.name} — {char.title}
          </h2>
        </div>

        {!isRevealed ? (
          <div className="text-center py-10 space-y-4">
            <EyeOff className="w-12 h-12 text-amber-400/60 mx-auto" />
            <p className="text-xs text-zinc-300 font-serif max-w-sm mx-auto">
              Apenas <strong>{player.name}</strong> deve estar olhando para a tela neste momento.
            </p>
            <button
              onClick={() => setIsRevealed(true)}
              className="px-6 py-3.5 rounded-xl bg-amber-600/90 hover:bg-amber-500 text-white font-serif font-bold text-xs uppercase tracking-[0.2em] transition-all border border-amber-400/50 shadow-xl"
            >
              Revelar Meu Papel Secreto
            </button>
          </div>
        ) : (
          <div className="space-y-5 animate-fade-in">
            {/* Secret Role Badge */}
            <div className={`p-4 rounded-xl border text-center ${getRoleColor()}`}>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] block mb-1">
                SEU PAPEL SECRETO NESTA PARTIDA
              </span>
              <h3 className="text-xl font-serif font-extrabold uppercase">{getRoleName()}</h3>
              <p className="text-xs font-sans mt-1 opacity-80">
                {player.role === 'oraculo' && 'Você é o Mestre da Visão. Você NÃO recebe cartas de método nem de objeto. Ao final da passagem do celular, você receberá o aparelho para analisar a solução e posicionar os marcadores de pistas no Códice.'}
                {player.role === 'assassino' && 'Você é o Assassino! Selecione abaixo 1 Método e 1 Objeto das suas cartas para consumar o crime agora em sigilo absoluto.'}
                {player.role === 'cumplice' && 'Você conhece o assassino e deve despistar os investigadores durante o debate.'}
                {player.role === 'investigador' && 'Examine suas 4 cartas de Método e 4 de Objeto. Descubra o culpado e a combinação fatal antes que o tempo esgote!'}
              </p>
            </div>

            {/* Oracle View: No Cards */}
            {player.role === 'oraculo' ? (
              <div className="p-4 rounded-xl glass-ui bg-amber-950/20 border-amber-400/30 text-center space-y-2">
                <BookOpen className="w-8 h-8 text-amber-400 mx-auto" />
                <h4 className="text-sm font-serif font-bold text-amber-300">
                  O Códice Sagrado Aguarda Sua Sabedoria
                </h4>
                <p className="text-xs text-zinc-300 font-serif">
                  Como Oráculo, você não possui cartas de suspeito. Assim que todos os outros jogadores visualizarem seus papéis, o celular voltará para você para marcar as pistas do crime.
                </p>
              </div>
            ) : player.role === 'assassino' ? (
              /* Killer Selection Interface */
              <div className="space-y-4">
                <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-center">
                  <span className="text-xs font-serif font-bold text-red-300 block">
                    SELECIONE 1 MÉTODO E 1 OBJETO PARA O CRIME:
                  </span>
                  <span className="text-[10px] text-zinc-400 font-sans">
                    Nenhum outro jogador verá sua escolha.
                  </span>
                </div>

                {/* Methods Selection */}
                <div className="space-y-2">
                  <span className="text-[11px] font-mono text-red-400 uppercase tracking-wider font-bold block">
                    Selecione 1 Método para o Crime:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 justify-items-center">
                    {player.methods.map((m) => (
                      <MethodCard
                        key={m.id}
                        method={m}
                        size="sm"
                        isSelected={localMethodId === m.id}
                        onClick={() => setLocalMethodId(m.id)}
                      />
                    ))}
                  </div>
                </div>

                {/* Objects Selection */}
                <div className="space-y-2">
                  <span className="text-[11px] font-mono text-blue-400 uppercase tracking-wider font-bold block">
                    Selecione 1 Objeto para o Crime:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 justify-items-center">
                    {player.objects.map((o) => (
                      <ObjectCard
                        key={o.id}
                        object={o}
                        size="sm"
                        isSelected={localObjectId === o.id}
                        onClick={() => setLocalObjectId(o.id)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Standard Non-Killer Hand of Cards Preview */
              <div className="space-y-3">
                <span className="text-xs font-serif font-bold text-zinc-200 uppercase tracking-wider block">
                  Suas Cartas na Mesa (4 Métodos & 4 Objetos):
                </span>
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-red-400 uppercase tracking-wider block mb-1">
                      ✦ 4 Métodos de Assassinato
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 justify-items-center">
                      {player.methods.map((m) => (
                        <MethodCard key={m.id} method={m} size="sm" />
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider block mb-1">
                      ✦ 4 Objetos Suspeitos
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 justify-items-center">
                      {player.objects.map((o) => (
                        <ObjectCard key={o.id} object={o} size="sm" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleConfirmAndNext}
              className="w-full py-3.5 rounded-xl bg-amber-600/90 hover:bg-amber-500 text-white font-serif font-bold text-xs uppercase tracking-[0.2em] transition-all border border-amber-400/50 shadow-lg"
            >
              {isLastPlayer
                ? 'Concluir Revelação & Passar para o Oráculo'
                : 'Ocultar e Passar para o Próximo'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
