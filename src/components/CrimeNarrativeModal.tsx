import React, { useState } from 'react';
import { RoomState } from '../types/game';
import { BookOpen, Edit3, Save, X, Sparkles, Feather, Check, AlertCircle } from 'lucide-react';
import { GameFrame } from './GameFrame';

interface CrimeNarrativeModalProps {
  room: RoomState;
  myPlayerId: string;
  onClose: () => void;
  onSaveNarrative: (newNarrative: string) => void;
}

export const CrimeNarrativeModal: React.FC<CrimeNarrativeModalProps> = ({
  room,
  myPlayerId,
  onClose,
  onSaveNarrative,
}) => {
  const myPlayer = room.players.find((p) => p.id === myPlayerId);
  const isOracle = myPlayer?.role === 'oraculo';

  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(room.storyNarrative || '');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [storyZoom, setStoryZoom] = useState<number>(1);

  const handleSave = () => {
    if (!editedText.trim()) return;
    onSaveNarrative(editedText.trim());
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleApplyPreset = (preset: string) => {
    setEditedText(preset);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0502]/90 flex items-center justify-center p-2 sm:p-4 backdrop-blur-md animate-fade-in overflow-y-auto">
      <GameFrame
        variant="modal"
        className="card-shadow rounded-3xl max-w-3xl w-full max-h-[92vh] border-amber-500/30 bg-zinc-950/95 shadow-2xl overflow-hidden"
        contentClassName="space-y-6 max-h-[92vh] overflow-y-auto p-5 sm:p-8"
        padding="p-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 gap-2">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl glass-ui-amber border-amber-400/50 flex items-center justify-center shadow-lg shrink-0">
              <BookOpen className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-serif font-black text-white uppercase tracking-[0.2em]">
                  DIÁRIO E CRÔNICA DO CRIME
                </h2>
                {isOracle && (
                  <span className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-400/60 text-amber-300 text-[10px] font-mono uppercase tracking-wider font-bold">
                    Oráculo • Editor Autorizado
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 font-serif">
                O relato sombrio dos acontecimentos da noite na biblioteca da abadia ancestral.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Story Zoom Controls */}
            {!isEditing && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-black/80 border border-amber-500/40 text-amber-200">
                <button
                  onClick={() => setStoryZoom((z) => Math.max(0.7, +(z - 0.15).toFixed(2)))}
                  disabled={storyZoom <= 0.7}
                  className="w-5 h-5 flex items-center justify-center rounded text-amber-300 hover:text-white hover:bg-amber-950/80 disabled:opacity-40 transition-all font-mono font-bold text-xs"
                  title="Diminuir Zoom"
                >
                  -
                </button>
                <button
                  onClick={() => setStoryZoom(1)}
                  className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-amber-300 hover:text-white"
                  title="Redefinir Zoom para 100%"
                >
                  {Math.round(storyZoom * 100)}%
                </button>
                <button
                  onClick={() => setStoryZoom((z) => Math.min(2.2, +(z + 0.15).toFixed(2)))}
                  disabled={storyZoom >= 2.2}
                  className="w-5 h-5 flex items-center justify-center rounded text-amber-300 hover:text-white hover:bg-amber-950/80 disabled:opacity-40 transition-all font-mono font-bold text-xs"
                  title="Aumentar Zoom"
                >
                  +
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl glass-ui text-zinc-400 hover:text-white border-white/10 hover:border-white/30 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Save confirmation banner */}
        {savedSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-200 text-xs font-serif flex items-center gap-2 animate-fade-in">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>A Crônica do Crime foi atualizada e transmitida a todos os investigadores na biblioteca!</span>
          </div>
        )}

        {/* Body content */}
        {!isEditing ? (
          <div className="space-y-6">
            {/* Parchment Styled Story Card */}
            <div
              style={{
                transform: `scale(${storyZoom})`,
                transformOrigin: 'top center',
                transition: 'transform 0.15s ease-out',
              }}
              className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-amber-950/30 to-black/60 border border-amber-500/30 relative shadow-2xl overflow-hidden"
            >
              <div className="absolute top-3 right-4 opacity-10 pointer-events-none">
                <Feather className="w-32 h-32 text-amber-300" />
              </div>

              <div className="flex items-center gap-2 text-amber-400/80 mb-4 pb-2 border-b border-amber-500/20">
                <Sparkles className="w-4 h-4" />
                <span className="text-[11px] font-mono uppercase tracking-[0.25em] font-bold">
                  Crônica Oficial do Códice
                </span>
              </div>

              <p className="text-sm sm:text-base text-zinc-100 font-serif italic leading-relaxed tracking-wide selection:bg-amber-900 selection:text-white whitespace-pre-line">
                "{room.storyNarrative || 'Nas sombras da biblioteca ancestral, os pergaminhos ainda aguardam a revelação da primeira visão...'}"
              </p>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400 font-serif">
                <span>Registrado nos anais da Abadia de Saint-Malo</span>
                <span className="font-mono text-amber-300/80">Rodada {room.round}/{room.maxRounds || 3}</span>
              </div>
            </div>

            {/* Oracle Edit Trigger */}
            {isOracle && (
              <div className="p-4 rounded-2xl glass-ui-amber border-amber-400/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-serif font-bold text-amber-200 block uppercase tracking-wider">
                    Deseja enriquecer ou personalizar a narrativa?
                  </span>
                  <span className="text-[11px] text-zinc-300 font-serif">
                    Como Oráculo, você pode reescrever a crônica, adicionar pistas poéticas ou focar a atenção dos investigadores.
                  </span>
                </div>
                <button
                  onClick={() => {
                    setEditedText(room.storyNarrative || '');
                    setIsEditing(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-serif font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all shrink-0"
                >
                  <Edit3 className="w-4 h-4" />
                  Editar Narrativa
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Oracle Editor Mode */
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-400" />
                Edição da Crônica pelo Oráculo:
              </label>
              <textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                rows={7}
                placeholder="Escreva a narrativa atmosférica do crime..."
                className="w-full p-4 rounded-2xl bg-black/60 border border-amber-400/40 text-zinc-100 text-sm font-serif italic focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 leading-relaxed"
              />
            </div>

            {/* Quick Inspiration Presets */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono text-zinc-400 block uppercase tracking-wider">
                Sugestões de Inspiração Gótica:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleApplyPreset(
                      `Sob o rugido dos trovões que estremeciam os vitrais da biblioteca, o silêncio foi quebrado por um baque surdo. A vítima caiu entre os pergaminhos da ala secreta, enquanto vestígios sutis de uma substância estranha e um objeto esquecido denunciavam a presença de um dos membros da mesa.`
                    )
                  }
                  className="px-3 py-1.5 rounded-xl text-[11px] font-serif bg-black/50 hover:bg-amber-950/60 border border-white/10 hover:border-amber-400/40 text-zinc-300 transition-all text-left"
                >
                  ⚡ Clima de Tempestade
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleApplyPreset(
                      `A fumaça acre de páginas queimadas e cera negra impregnou os corredores do arquivo subterrâneo. A vida se esvaiu sem gritos, restando apenas um silêncio sepulcral e um instrumento fatal que o Códice agora aponta aos investigadores atentos.`
                    )
                  }
                  className="px-3 py-1.5 rounded-xl text-[11px] font-serif bg-black/50 hover:bg-amber-950/60 border border-white/10 hover:border-amber-400/40 text-zinc-300 transition-all text-left"
                >
                  📜 Manuscritos Queimados
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleApplyPreset(
                      `Nas gélidas primeiras horas da alvorada, passos apressados ecoaram em direção aos aposentos nobres. O crime foi executado com frieza cirúrgica, deixando para trás apenas a marca de uma arma incomum e o odor inconfundível de um crime premeditado.`
                    )
                  }
                  className="px-3 py-1.5 rounded-xl text-[11px] font-serif bg-black/50 hover:bg-amber-950/60 border border-white/10 hover:border-amber-400/40 text-zinc-300 transition-all text-left"
                >
                  🕯️ Frieza Cirúrgica
                </button>
              </div>
            </div>

            {/* Editor Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl glass-ui text-zinc-400 hover:text-white text-xs font-serif uppercase tracking-wider"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!editedText.trim()}
                className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-serif font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all"
              >
                <Save className="w-4 h-4" />
                Salvar Crônica Oficial
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs text-zinc-400 font-serif">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span>Todos os investigadores podem consultar esta narrativa a qualquer momento durante os debates.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl glass-ui hover:border-white/20 text-zinc-200 uppercase tracking-wider font-bold cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </GameFrame>
    </div>
  );
};
