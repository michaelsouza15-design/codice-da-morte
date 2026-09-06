import React from 'react';
import { CardEvidence } from '../types/game';
import { EvidenceCard } from './GothicCard';
import { Archive, X, RotateCcw, AlertTriangle } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

interface DiscardedEvidencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  discardedEvidences: CardEvidence[];
  canRestore?: boolean;
  onRestoreEvidence?: (evidenceId: string) => void;
}

export const DiscardedEvidencesModal: React.FC<DiscardedEvidencesModalProps> = ({
  isOpen,
  onClose,
  discardedEvidences,
  canRestore = false,
  onRestoreEvidence,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in text-zinc-100">
      <div className="max-w-3xl w-full glass-ui-dark border border-amber-500/30 rounded-3xl p-6 shadow-2xl relative flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3 text-amber-400">
            <div className="w-10 h-10 rounded-2xl glass-ui-amber border border-amber-400/40 flex items-center justify-center shadow-lg">
              <Archive className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg tracking-wider text-amber-200 uppercase">
                Arquivo Morto do Códice
              </h3>
              <p className="text-xs text-zinc-400 font-serif">
                Evidências e pistas que foram descartadas durante a partida
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list of discarded evidences */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 custom-scrollbar">
          {discardedEvidences.length === 0 ? (
            <div className="p-8 text-center glass-ui rounded-2xl border-white/5 space-y-2">
              <AlertTriangle className="w-8 h-8 text-zinc-500 mx-auto" />
              <p className="font-serif text-sm text-zinc-400">
                Nenhuma evidência foi descartada ainda nesta partida.
              </p>
              <p className="text-xs text-zinc-500 italic">
                Quando o Oráculo ou eventos removerem cartas da mesa, elas ficarão arquivadas aqui.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {discardedEvidences.map((ev) => (
                <div key={ev.id} className="relative group">
                  <EvidenceCard evidence={ev} isDiscarded={true} />
                  {canRestore && onRestoreEvidence && (
                    <button
                      onClick={() => {
                        soundEngine.playCardFlip();
                        onRestoreEvidence(ev.id);
                        onClose();
                      }}
                      className="w-full mt-2 py-2 px-3 rounded-xl bg-emerald-950/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-500/50 font-serif font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Restaurar para a Mesa (Habilidade)
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="px-6 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-serif font-bold text-xs uppercase tracking-wider shadow-lg transition-all"
          >
            Fechar Arquivo
          </button>
        </div>
      </div>
    </div>
  );
};
