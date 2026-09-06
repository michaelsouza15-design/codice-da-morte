import React from 'react';
import { RoomState } from '../types/game';
import { CHARACTERS } from '../data/gameData';
import { GothicAvatar } from './GothicAvatar';
import { ShieldAlert, X, CheckCircle2, XCircle, Skull, Flame, FileText } from 'lucide-react';

interface AccusationsHistoryModalProps {
  room: RoomState;
  onClose: () => void;
}

export const AccusationsHistoryModal: React.FC<AccusationsHistoryModalProps> = ({
  room,
  onClose,
}) => {
  const history = room.accusationHistory || [];

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0502]/90 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="glass-ui card-shadow rounded-3xl max-w-3xl w-full p-6 space-y-6 max-h-[92vh] overflow-y-auto border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl glass-ui-amber border-amber-400/50 flex items-center justify-center shadow-lg">
              <ShieldAlert className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-serif font-black text-white uppercase tracking-[0.2em]">
                REGISTRO OFICIAL DE ACUSAÇÕES
              </h2>
              <p className="text-xs text-zinc-400 font-serif">
                Histórico judicial de todas as acusações formuladas perante o Códice ({history.length} registradas).
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

        {/* Content */}
        {history.length === 0 ? (
          <div className="p-10 text-center space-y-3 rounded-2xl glass-ui-dark border-white/5">
            <Skull className="w-10 h-10 text-zinc-600 mx-auto" />
            <h3 className="text-sm font-serif font-bold text-zinc-300 uppercase tracking-widest">
              Nenhuma Acusação Formal Registrada
            </h3>
            <p className="text-xs text-zinc-400 font-serif max-w-md mx-auto leading-relaxed">
              Os investigadores continuam examinando as evidências, cores e pistas do Oráculo. Quando qualquer jogador efetuar uma acusação, as cartas e o suspeito apontados serão gravados aqui publicamente para todos consultarem.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((record, index) => {
              const accuserChar = CHARACTERS.find((c) => c.id === record.accuserCharacterId);
              const targetChar = CHARACTERS.find((c) => c.id === record.targetCharacterId);

              return (
                <div
                  key={record.id || index}
                  className={`p-5 rounded-2xl border transition-all ${
                    record.isCorrect
                      ? 'glass-ui-emerald border-emerald-500/50 shadow-emerald-950/40 shadow-xl'
                      : 'glass-ui-red border-red-500/40 shadow-red-950/30 shadow-lg'
                  }`}
                >
                  {/* Record Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/50 text-zinc-300 uppercase tracking-wider">
                        Rodada {record.round} • {record.timestamp}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {record.isCorrect ? (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-400/60 text-emerald-300 text-xs font-serif font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Acusação Procedente / Vitória!</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/80 border border-red-400/60 text-red-300 text-xs font-serif font-bold">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Acusação Incorreta (Ficha Perdida)</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Accuser vs Suspect Flow */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
                    {/* Accuser */}
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-white/5">
                      <GothicAvatar
                        characterId={record.accuserCharacterId}
                        avatarSeed={accuserChar?.avatarSeed}
                        name={record.accuserName}
                        size="sm"
                      />
                      <div className="truncate">
                        <span className="text-[10px] font-mono text-zinc-400 block uppercase tracking-wider">
                          Acusador(a)
                        </span>
                        <span className="text-sm font-serif font-bold text-zinc-100 block truncate">
                          {record.accuserName}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-serif block truncate">
                          {accuserChar?.title || 'Investigador'}
                        </span>
                      </div>
                    </div>

                    {/* Suspect Target */}
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-white/5">
                      <GothicAvatar
                        characterId={record.targetCharacterId}
                        avatarSeed={targetChar?.avatarSeed}
                        name={record.targetName}
                        size="sm"
                        glow={record.isCorrect}
                      />
                      <div className="truncate">
                        <span className="text-[10px] font-mono text-red-400 block uppercase tracking-wider">
                          Suspeito(a) Apontado
                        </span>
                        <span className="text-sm font-serif font-bold text-white block truncate">
                          {record.targetName}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-serif block truncate">
                          {targetChar?.title || 'Suspeito'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Selected Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* Method Card */}
                    <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/30 space-y-1">
                      <div className="flex items-center justify-between text-red-300">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <Flame className="w-3 h-3 text-red-400" />
                          Carta de Método Selecionada
                        </span>
                        {record.methodCategory && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-950/60 border border-red-500/40 text-red-300">
                            {record.methodCategory}
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs sm:text-sm font-serif font-black text-red-100">
                        {record.methodName}
                      </h4>
                      {record.methodDescription && (
                        <p className="text-[11px] text-zinc-300 font-serif italic line-clamp-2">
                          "{record.methodDescription}"
                        </p>
                      )}
                    </div>

                    {/* Object Card */}
                    <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-500/30 space-y-1">
                      <div className="flex items-center justify-between text-blue-300">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <FileText className="w-3 h-3 text-blue-400" />
                          Carta de Objeto Selecionada
                        </span>
                        {record.objectCategory && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-950/60 border border-blue-500/40 text-blue-300">
                            {record.objectCategory}
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs sm:text-sm font-serif font-black text-blue-100">
                        {record.objectName}
                      </h4>
                      {record.objectDescription && (
                        <p className="text-[11px] text-zinc-300 font-serif italic line-clamp-2">
                          "{record.objectDescription}"
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end pt-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl glass-ui hover:border-white/20 text-zinc-200 font-serif text-xs uppercase tracking-wider"
          >
            Fechar Histórico
          </button>
        </div>
      </div>
    </div>
  );
};
