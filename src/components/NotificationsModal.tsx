import React from 'react';
import { Bell, X, Sparkles, Trophy, Skull, Flame, CheckCircle2 } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const notifications = [
    {
      id: 1,
      title: 'Desafio Diário: A Marca de Vlad',
      desc: 'Vença 1 partida sem usar acusações falsas.',
      reward: '+250 Ouro Gótico',
      icon: Trophy,
      color: 'text-amber-400',
    },
    {
      id: 2,
      title: 'Novo Códice Desbloqueado',
      desc: 'Capítulo IV "A Fuga das Trevas" adicionado ao Grimório.',
      reward: 'História Liberada',
      icon: Sparkles,
      color: 'text-cyan-400',
    },
    {
      id: 3,
      title: 'Bônus Noturno Ativo',
      desc: 'Ganhe dobro de XP em partidas com mais de 5 investigadores.',
      reward: '2x XP',
      icon: Flame,
      color: 'text-red-400',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in text-[#e8dfd8]">
      <div className="bg-gradient-to-b from-[#140b0b] via-[#0d0707] to-black border-2 border-amber-500/60 rounded-3xl max-w-md w-full p-4 sm:p-6 shadow-2xl shadow-black max-h-[90vh] flex flex-col space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/60 flex items-center justify-center text-amber-300 shadow-md">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-serif font-black text-amber-200 uppercase tracking-widest">
                NOVIDADES & MISSÕES
              </h2>
              <p className="text-[10px] sm:text-xs text-amber-400/80 font-serif">
                Avisos do castelo e missões diárias
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-zinc-900/80 text-zinc-400 hover:text-white border border-white/10 hover:border-amber-400/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-2.5 overflow-y-auto">
          {notifications.map((n) => {
            const IconComp = n.icon;
            return (
              <div
                key={n.id}
                className="p-3.5 rounded-2xl bg-black/60 border border-white/10 hover:border-amber-500/50 transition-all flex items-start gap-3"
              >
                <div className="w-9 h-9 rounded-xl bg-zinc-900/80 border border-white/10 flex items-center justify-center shrink-0">
                  <IconComp className={`w-4 h-4 ${n.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-serif font-bold text-amber-200 truncate">
                      {n.title}
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/30">
                      {n.reward}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-1 leading-snug">{n.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-white/10 flex justify-end">
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-serif font-bold text-xs uppercase tracking-wider transition-all"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
