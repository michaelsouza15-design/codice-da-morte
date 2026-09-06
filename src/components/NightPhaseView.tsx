import React, { useState, useEffect } from 'react';
import { RoomState } from '../types/game';
import { MethodCard, ObjectCard } from './GothicCard';
import { Moon, EyeOff, Lock, Check, Skull, Sparkles, Eye, Send, CheckCircle2 } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

interface NightPhaseViewProps {
  room: RoomState;
  myPlayerId: string;
  onConfirmChoice: (methodId: string, objectId: string) => void;
  onSuggestChoice?: (methodId: string, objectId: string) => void;
}

export const NightPhaseView: React.FC<NightPhaseViewProps> = ({
  room,
  myPlayerId,
  onConfirmChoice,
  onSuggestChoice,
}) => {
  const [selectedMethodId, setSelectedMethodId] = useState<string>('');
  const [selectedObjectId, setSelectedObjectId] = useState<string>('');
  
  // Accomplice suggestion state
  const [suggestedMethodId, setSuggestedMethodId] = useState<string>('');
  const [suggestedObjectId, setSuggestedObjectId] = useState<string>('');
  const [suggestionSent, setSuggestionSent] = useState<boolean>(false);

  const myPlayer = room.players.find((p) => p.id === myPlayerId);
  const isKiller = myPlayer?.role === 'assassino';
  const isAccomplice = myPlayer?.role === 'cumplice';

  const killerPlayer = room.players.find(
    (p) => p.role === 'assassino' || p.id === room.secretSolution?.killerPlayerId
  );

  const selectedMethod = myPlayer?.methods.find((m) => m.id === selectedMethodId);
  const selectedObject = myPlayer?.objects.find((o) => o.id === selectedObjectId);

  // Active night suggestion from accomplice
  const incomingSuggestion = room.nightSuggestion || (room.secretSolution?.suggestedMethodId ? {
    methodId: room.secretSolution.suggestedMethodId,
    objectId: room.secretSolution.suggestedObjectId,
    suggestedByPlayerName: room.secretSolution.suggestedByPlayerName || 'Cúmplice',
    suggestedByPlayerId: '',
  } : undefined);

  const suggestedMethodByAccomplice = killerPlayer?.methods.find(
    (m) => m.id === incomingSuggestion?.methodId
  );
  const suggestedObjectByAccomplice = killerPlayer?.objects.find(
    (o) => o.id === incomingSuggestion?.objectId
  );

  // Sync accomplice's local selection if room already has a suggestion
  useEffect(() => {
    if (isAccomplice && incomingSuggestion) {
      if (incomingSuggestion.methodId && !suggestedMethodId) {
        setSuggestedMethodId(incomingSuggestion.methodId);
      }
      if (incomingSuggestion.objectId && !suggestedObjectId) {
        setSuggestedObjectId(incomingSuggestion.objectId);
      }
    }
  }, [isAccomplice, incomingSuggestion]);

  const handleSendAccompliceSuggestion = () => {
    if (!suggestedMethodId || !suggestedObjectId) return;
    soundEngine.playCardFlip();
    if (onSuggestChoice) {
      onSuggestChoice(suggestedMethodId, suggestedObjectId);
    }
    setSuggestionSent(true);
    setTimeout(() => setSuggestionSent(false), 4000);
  };

  const handleAcceptAccompliceSuggestion = () => {
    if (incomingSuggestion?.methodId) {
      setSelectedMethodId(incomingSuggestion.methodId);
    }
    if (incomingSuggestion?.objectId) {
      setSelectedObjectId(incomingSuggestion.objectId);
    }
    soundEngine.playCardFlip();
  };

  return (
    <div
      id="night-phase-view-container"
      className="fixed inset-0 z-50 bg-[#080402]/98 flex flex-col items-center justify-start py-3 sm:py-6 px-2.5 sm:px-6 overflow-y-auto scrollbar-thin text-[#e0d8d0] animate-fade-in"
    >
      {/* Background Ambience / Atmospheric Blur */}
      <div className="fixed inset-0 atmosphere pointer-events-none opacity-60" />

      <div className="relative z-10 max-w-3xl w-full text-center space-y-4 sm:space-y-5 pt-1 pb-24">
        {/* Night Header */}
        <div className="flex flex-col items-center space-y-2 pt-2">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl glass-ui-red border-red-500/50 flex items-center justify-center shadow-2xl">
            <Moon className="w-7 h-7 sm:w-8 sm:h-8 text-red-400 animate-pulse" />
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-red-950/80 border border-red-500/40 text-red-300 text-[10px] font-mono uppercase tracking-[0.2em]">
              <Skull className="w-3 h-3 text-red-400" />
              <span>FASE DA NOITE • CONSPIRAÇÃO</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-serif font-black text-white tracking-[0.2em] uppercase">
              A NOITE CAIU NA BIBLIOTECA
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-zinc-300 font-serif max-w-lg mx-auto opacity-90 leading-relaxed px-2">
            {isKiller
              ? 'Você é o Assassino. Escolha em segredo 1 Método e 1 Objeto entre as suas cartas para forjar o crime perfeito.'
              : isAccomplice
              ? 'Você é o Cúmplice. Ajude o Assassino sugerindo silenciosamente as cartas mais difíceis de descobrir!'
              : 'Todos os olhos se fecham no silêncio da noite ancestral. O crime está sendo forjado nas sombras...'}
          </p>
        </div>

        {/* Non-Killers & Non-Accomplice Waiting View */}
        {!isKiller && !isAccomplice && (
          <div className="p-6 sm:p-8 rounded-3xl glass-ui card-shadow border-white/10 max-w-md mx-auto space-y-4 my-6">
            <EyeOff className="w-10 h-10 text-zinc-500 mx-auto animate-pulse" />
            <p className="text-sm font-serif italic text-zinc-300">
              "Nem um sussurro ecoa pelos corredores do arquivo..."
            </p>
            <div className="flex items-center justify-center gap-2 text-xs font-mono text-amber-300 tracking-wider uppercase opacity-80">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Aguardando a escolha secreta do Assassino</span>
            </div>
          </div>
        )}

        {/* ACCOMPLICE INTERACTIVE SUGGESTION VIEW */}
        {isAccomplice && killerPlayer && (
          <div className="space-y-6 text-left animate-fade-in">
            {/* Conspirator Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/90 via-black to-purple-950/90 border-2 border-purple-500/70 shadow-[0_0_24px_rgba(168,85,247,0.3)] space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-900/90 border border-purple-400 flex items-center justify-center">
                    <Eye className="w-4 h-4 text-purple-200" />
                  </div>
                  <div>
                    <span className="text-xs font-serif font-black text-purple-200 uppercase tracking-wider block">
                      SUGESTÃO SILENCIOSA DO CÚMPLICE
                    </span>
                    <span className="text-[11px] text-zinc-300">
                      Assassino: <strong className="text-red-400">{killerPlayer.name}</strong>
                    </span>
                  </div>
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-purple-900/80 text-purple-200 border border-purple-400 uppercase">
                  Pacto das Sombras
                </span>
              </div>
              <p className="text-xs font-serif text-zinc-300 leading-relaxed">
                Você pode ver as cartas de <strong>{killerPlayer.name}</strong>. Selecione 1 Método e 1 Objeto abaixo para enviar uma sugestão silenciosa que aparecerá na tela dele antes da confirmação final!
              </p>
            </div>

            {/* Suggestion Summary and Send Button */}
            <div className="p-3.5 rounded-2xl bg-black/80 border border-purple-500/40 flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-purple-300 tracking-wider block">
                  Sua Sugestão Atual:
                </span>
                <div className="text-xs font-serif flex items-center gap-2">
                  <span className="font-bold text-red-400">
                    {killerPlayer.methods.find((m) => m.id === suggestedMethodId)?.name || '— 1 Método'}
                  </span>
                  <span className="text-zinc-500">+</span>
                  <span className="font-bold text-blue-400">
                    {killerPlayer.objects.find((o) => o.id === suggestedObjectId)?.name || '— 1 Objeto'}
                  </span>
                </div>
              </div>

              <button
                onClick={handleSendAccompliceSuggestion}
                disabled={!suggestedMethodId || !suggestedObjectId}
                className={`px-5 py-2.5 rounded-xl font-serif text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg ${
                  suggestedMethodId && suggestedObjectId
                    ? 'bg-gradient-to-r from-purple-800 to-indigo-800 hover:from-purple-700 hover:to-indigo-700 text-white border border-purple-400 active:scale-95'
                    : 'bg-zinc-900 text-zinc-600 border border-white/5 cursor-not-allowed'
                }`}
              >
                {suggestionSent ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-bounce" />
                    <span className="text-emerald-300">Sugestão Enviada!</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-purple-300" />
                    <span>Enviar Sugestão ao Assassino</span>
                  </>
                )}
              </button>
            </div>

            {/* Killer Methods (to suggest) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-red-400 font-mono uppercase tracking-[0.2em] flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-red-950 border border-red-500 flex items-center justify-center text-[10px]">
                    1
                  </span>
                  SUGERIR MÉTODO DO ASSASSINO ({killerPlayer.name}):
                </span>
                {suggestedMethodId && (
                  <span className="text-[10px] font-mono text-purple-300">Sugerido ✓</span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
                {killerPlayer.methods.map((m) => {
                  const isSuggested = suggestedMethodId === m.id;
                  return (
                    <div
                      key={m.id}
                      onClick={() => {
                        soundEngine.playCardFlip();
                        setSuggestedMethodId(m.id);
                      }}
                      className="cursor-pointer transition-transform hover:scale-[1.02] active:scale-95 relative"
                    >
                      {isSuggested && (
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-20 px-2 py-0.5 rounded-full bg-purple-600 text-white font-serif font-black text-[9px] uppercase tracking-wider shadow-lg border border-purple-200">
                          Sugerido
                        </div>
                      )}
                      <MethodCard
                        method={m}
                        isSelected={isSuggested}
                        badge={isSuggested ? 'SUGESTÃO' : undefined}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Killer Objects (to suggest) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-400 font-mono uppercase tracking-[0.2em] flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-950 border border-blue-500 flex items-center justify-center text-[10px]">
                    2
                  </span>
                  SUGERIR OBJETO DO ASSASSINO ({killerPlayer.name}):
                </span>
                {suggestedObjectId && (
                  <span className="text-[10px] font-mono text-purple-300">Sugerido ✓</span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
                {killerPlayer.objects.map((o) => {
                  const isSuggested = suggestedObjectId === o.id;
                  return (
                    <div
                      key={o.id}
                      onClick={() => {
                        soundEngine.playCardFlip();
                        setSuggestedObjectId(o.id);
                      }}
                      className="cursor-pointer transition-transform hover:scale-[1.02] active:scale-95 relative"
                    >
                      {isSuggested && (
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-20 px-2 py-0.5 rounded-full bg-purple-600 text-white font-serif font-black text-[9px] uppercase tracking-wider shadow-lg border border-purple-200">
                          Sugerido
                        </div>
                      )}
                      <ObjectCard
                        object={o}
                        isSelected={isSuggested}
                        badge={isSuggested ? 'SUGESTÃO' : undefined}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Killer Selection Interface */}
        {isKiller && myPlayer && (
          <div className="space-y-6 text-left">
            {/* INCOMING ACCOMPLICE SUGGESTION BANNER */}
            {incomingSuggestion && (suggestedMethodByAccomplice || suggestedObjectByAccomplice) && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/90 via-black to-purple-950/90 border-2 border-purple-500 shadow-[0_0_24px_rgba(168,85,247,0.4)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-900 border border-purple-400 flex items-center justify-center shrink-0 shadow">
                    <Eye className="w-5 h-5 text-purple-300 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-serif font-black text-purple-300 uppercase tracking-widest">
                        SUGESTÃO SILENCIOSA DO CÚMPLICE ({incomingSuggestion.suggestedByPlayerName || 'Cúmplice'})
                      </span>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-purple-900/90 text-purple-200 border border-purple-400 font-bold">
                        Pacto Secreto
                      </span>
                    </div>
                    <div className="text-xs font-serif text-zinc-300 mt-1 flex flex-wrap items-center gap-2">
                      <span>Sugestão:</span>
                      {suggestedMethodByAccomplice && (
                        <span className="px-2 py-0.5 rounded-md bg-red-950 border border-red-500/80 text-red-300 font-bold">
                          🔪 {suggestedMethodByAccomplice.name}
                        </span>
                      )}
                      {suggestedObjectByAccomplice && (
                        <span className="px-2 py-0.5 rounded-md bg-blue-950 border border-blue-500/80 text-blue-300 font-bold">
                          🕯️ {suggestedObjectByAccomplice.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleAcceptAccompliceSuggestion}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-800 to-amber-700 hover:from-purple-700 hover:to-amber-600 text-white font-serif font-bold text-xs uppercase tracking-wider border border-amber-400/80 shadow-lg active:scale-95 shrink-0 self-end sm:self-auto"
                >
                  ✓ Aceitar Sugestão
                </button>
              </div>
            )}

            {/* Selection Summary Pill */}
            <div className="p-3 rounded-2xl bg-black/60 border border-amber-500/30 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-serif">
                <span className="text-zinc-400">Sua Seleção Secreta:</span>
                <span className="font-bold text-red-400">
                  {selectedMethod ? selectedMethod.name : '— Escolha 1 Método'}
                </span>
                <span className="text-zinc-600">+</span>
                <span className="font-bold text-blue-400">
                  {selectedObject ? selectedObject.name : '— Escolha 1 Objeto'}
                </span>
              </div>
              <span
                className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full border ${
                  selectedMethodId && selectedObjectId
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                    : 'bg-amber-950/80 border-amber-500 text-amber-300'
                }`}
              >
                {selectedMethodId && selectedObjectId ? '✓ Pronto para Confirmar' : 'Falta Selecionar'}
              </span>
            </div>

            {/* 1. Select Method */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-red-400 font-mono uppercase tracking-[0.2em] flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-red-950 border border-red-500 flex items-center justify-center text-[10px]">
                    1
                  </span>
                  ESCOLHA O SEU MÉTODO DE ASSASSINATO:
                </span>
                {selectedMethodId && (
                  <span className="text-[10px] font-mono text-red-300">Selecionado ✓</span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
                {myPlayer.methods.map((m) => {
                  const isSuggestedByAccomplice = incomingSuggestion?.methodId === m.id;
                  return (
                    <div
                      key={m.id}
                      onClick={() => soundEngine.playCardFlip()}
                      className="cursor-pointer transition-transform hover:scale-[1.02] active:scale-95 relative"
                    >
                      {isSuggestedByAccomplice && (
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-20 px-2 py-0.5 rounded-full bg-purple-600 text-white font-serif font-black text-[9px] uppercase tracking-wider shadow-lg border border-purple-200 animate-pulse">
                          💡 Cúmplice
                        </div>
                      )}
                      <MethodCard
                        method={m}
                        isSelected={selectedMethodId === m.id}
                        badge={isSuggestedByAccomplice ? 'SUGESTÃO CÚMPLICE' : undefined}
                        onClick={() => setSelectedMethodId(m.id)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Select Object */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-400 font-mono uppercase tracking-[0.2em] flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-950 border border-blue-500 flex items-center justify-center text-[10px]">
                    2
                  </span>
                  ESCOLHA O SEU OBJETO DO CRIME:
                </span>
                {selectedObjectId && (
                  <span className="text-[10px] font-mono text-blue-300">Selecionado ✓</span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
                {myPlayer.objects.map((o) => {
                  const isSuggestedByAccomplice = incomingSuggestion?.objectId === o.id;
                  return (
                    <div
                      key={o.id}
                      onClick={() => soundEngine.playCardFlip()}
                      className="cursor-pointer transition-transform hover:scale-[1.02] active:scale-95 relative"
                    >
                      {isSuggestedByAccomplice && (
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-20 px-2 py-0.5 rounded-full bg-purple-600 text-white font-serif font-black text-[9px] uppercase tracking-wider shadow-lg border border-purple-200 animate-pulse">
                          💡 Cúmplice
                        </div>
                      )}
                      <ObjectCard
                        object={o}
                        isSelected={selectedObjectId === o.id}
                        badge={isSuggestedByAccomplice ? 'SUGESTÃO CÚMPLICE' : undefined}
                        onClick={() => setSelectedObjectId(o.id)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Confirmation Button */}
            <div className="text-center pt-2">
              <button
                onClick={() => {
                  soundEngine.playCathedralBell();
                  onConfirmChoice(selectedMethodId, selectedObjectId);
                }}
                disabled={!selectedMethodId || !selectedObjectId}
                className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-serif font-black text-xs sm:text-sm tracking-[0.2em] uppercase transition-all shadow-xl flex items-center justify-center gap-2.5 mx-auto ${
                  selectedMethodId && selectedObjectId
                    ? 'bg-gradient-to-r from-red-800 via-red-700 to-red-900 hover:from-red-700 hover:to-red-800 text-white border-2 border-red-400 shadow-red-950/90 active:scale-95 scale-[1.02]'
                    : 'glass-ui text-zinc-500 border-white/5 cursor-not-allowed'
                }`}
              >
                <Check className="w-5 h-5 text-white" />
                <span>CONFIRMAR CRIME & INICIAR INVESTIGAÇÃO</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

