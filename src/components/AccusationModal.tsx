import React, { useState } from 'react';
import { RoomState } from '../types/game';
import { CHARACTERS } from '../data/gameData';
import { MethodCard, ObjectCard } from './GothicCard';
import { GothicAvatar } from './GothicAvatar';
import { ShieldAlert, X, CheckCircle2, AlertOctagon } from 'lucide-react';

interface AccusationModalProps {
  room: RoomState;
  myPlayerId: string;
  onClose: () => void;
  onConfirmAccusation: (targetPlayerId: string, methodId: string, objectId: string) => void;
}

export const AccusationModal: React.FC<AccusationModalProps> = ({
  room,
  myPlayerId,
  onClose,
  onConfirmAccusation,
}) => {
  const [targetId, setTargetId] = useState<string>('');
  const [methodId, setMethodId] = useState<string>('');
  const [objectId, setObjectId] = useState<string>('');

  const myPlayer = room.players.find((p) => p.id === myPlayerId);
  const isOracle = myPlayer?.role === 'oraculo';
  const hasAlreadyAccused = myPlayer?.hasAccused;
  const isAccusationBlockedByEvent = room.activeEvent?.event.id === 'EV04';
  const isEarlyAccusationEvent = room.activeEvent?.event.id === 'EV09';

  // Filter suspects: only players who have methods and objects (not the Oracle)
  const suspects = room.players.filter((p) => p.role !== 'oraculo' && p.methods.length > 0);
  const targetPlayer = suspects.find((p) => p.id === targetId);

  const handleAccuse = () => {
    if (isOracle || hasAlreadyAccused || isAccusationBlockedByEvent) return;
    if (!targetId || !methodId || !objectId) return;
    onConfirmAccusation(targetId, methodId, objectId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0502]/90 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="glass-ui-red border-red-500/40 rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto card-shadow">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-red-500/30">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl glass-ui-red border-red-500/60 flex items-center justify-center shadow-lg">
              <ShieldAlert className="w-6 h-6 text-red-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-serif font-black text-white uppercase tracking-[0.2em]">
                TRIBUNAL DE ACUSAÇÃO FORMAL
              </h2>
              <p className="text-xs text-red-300/80 font-serif">
                Atenção: Cada investigador possui apenas UMA única ficha de acusação em qualquer rodada da partida. O Oráculo não acusa.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl glass-ui text-zinc-400 hover:text-white border-white/10 hover:border-white/30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Oracle Guard Alert */}
        {isOracle && (
          <div className="p-4 rounded-2xl glass-ui bg-amber-950/40 border border-amber-400/40 text-amber-200 text-xs font-serif leading-relaxed">
            <strong>Oráculo do Códice:</strong> Você é a testemunha silenciosa que conhece toda a verdade e guia os investigadores através das pistas. Por regra primordial, o Oráculo NUNCA pode formular acusações.
          </div>
        )}

        {/* Event Silêncio Forçado Alert */}
        {isAccusationBlockedByEvent && (
          <div className="p-4 rounded-2xl glass-ui bg-red-950/80 border border-red-500 text-red-200 text-xs font-serif leading-relaxed flex items-center gap-3">
            <AlertOctagon className="w-6 h-6 text-red-400 shrink-0 animate-bounce" />
            <div>
              <strong className="block text-amber-300 uppercase tracking-wider font-mono">
                ⚠️ ACUSAÇÕES BLOQUEADAS PELO EVENTO [SILÊNCIO FORÇADO]
              </strong>
              Nenhuma acusação formal é permitida enquanto o efeito deste evento estiver ativo na biblioteca.
            </div>
          </div>
        )}

        {/* Event Acusação Antecipada Alert */}
        {isEarlyAccusationEvent && !isOracle && !hasAlreadyAccused && (
          <div className="p-3.5 rounded-2xl glass-ui bg-amber-950/50 border border-amber-400/60 text-amber-200 text-xs font-serif leading-relaxed">
            <strong className="text-amber-300">⚡ Efeito Especial [Acusação Antecipada]:</strong> Você pode realizar esta acusação sem perder sua ficha de voto definitivo caso erre!
          </div>
        )}

        {/* Has Already Accused Alert */}
        {!isOracle && hasAlreadyAccused && (
          <div className="p-4 rounded-2xl glass-ui bg-red-950/50 border border-red-500/40 text-red-200 text-xs font-serif leading-relaxed">
            <strong>Acusação Esgotada:</strong> Você já gastou sua única ficha de acusação nesta partida. Você pode continuar debatendo e analisando as evidências com o grupo, mas não pode votar novamente.
          </div>
        )}

        {/* 1. Step: Who? (Target suspect) */}
        {!isOracle && !hasAlreadyAccused && !isAccusationBlockedByEvent && (
          <>
            <div className="space-y-2.5">
              <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
                1. QUEM MATOU? (Selecione o Suspeito):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {suspects.map((p) => {
                  const char = CHARACTERS.find((c) => c.id === p.characterId);
                  const isSelected = targetId === p.id;

                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        setTargetId(p.id);
                        setMethodId('');
                        setObjectId('');
                      }}
                      className={`flex items-center gap-2.5 p-3 rounded-2xl border transition-all text-left ${
                        isSelected
                          ? 'glass-ui-red border-red-400/80 text-white ring-2 ring-red-500/50 shadow-lg'
                          : 'glass-ui border-white/10 text-zinc-300 hover:border-white/20'
                      }`}
                    >
                      <GothicAvatar
                        characterId={p.characterId}
                        avatarSeed={char?.avatarSeed}
                        name={p.name}
                        size="sm"
                        glow={isSelected}
                      />
                      <div className="truncate">
                        <span className="text-xs font-serif font-bold block truncate text-zinc-100">{p.name}</span>
                        <span className="text-[10px] text-zinc-400 truncate block font-sans">
                          {char?.title || 'Investigador'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Step: Which Method and Object from target's hand */}
            {targetPlayer && (
              <div className="space-y-4 pt-3 border-t border-white/10">
                {/* Method Selection */}
                <div className="space-y-2.5">
                  <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-[0.2em] block">
                    2. QUAL MÉTODO FOI USADO POR {targetPlayer.name.toUpperCase()}?
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {targetPlayer.methods.map((m) => (
                      <MethodCard
                        key={m.id}
                        method={m}
                        isSelected={methodId === m.id}
                        onClick={() => setMethodId(m.id)}
                      />
                    ))}
                  </div>
                </div>

                {/* Object Selection */}
                <div className="space-y-2.5">
                  <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-[0.2em] block">
                    3. QUAL OBJETO FOI UTILIZADO POR {targetPlayer.name.toUpperCase()}?
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {targetPlayer.objects.map((o) => (
                      <ObjectCard
                        key={o.id}
                        object={o}
                        isSelected={objectId === o.id}
                        onClick={() => setObjectId(o.id)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Accuse Action Button */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl glass-ui hover:border-white/20 text-zinc-300 font-serif text-xs uppercase tracking-wider"
          >
            Fechar
          </button>
          {!isOracle && !hasAlreadyAccused && (
            <button
              onClick={handleAccuse}
              disabled={!targetId || !methodId || !objectId}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-serif font-bold text-xs uppercase tracking-[0.15em] transition-all border ${
                targetId && methodId && objectId
                  ? 'bg-red-900/40 hover:bg-red-900/60 text-red-200 border-red-500/50 shadow-xl shadow-red-950/80 scale-105 animate-pulse'
                  : 'glass-ui text-zinc-600 border-white/5 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Acusar Formalmente (Apenas 1x)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
