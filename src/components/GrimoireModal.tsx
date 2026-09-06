import React, { useState } from 'react';
import { BookOpen, X, Scroll, Shield, Skull, Eye, Flame, Crown } from 'lucide-react';
import { MARKER_INFOS } from '../data/gameData';
import { soundEngine } from '../utils/soundEngine';
import { RulesReferenceCard } from './RulesReferenceCard';
import { GothicWaxSeal } from './GothicWaxSeal';
import { MarkerColor } from '../types/game';

interface GrimoireModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GrimoireModal: React.FC<GrimoireModalProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState<'historias' | 'regras' | 'marcadores'>('historias');
  const [selectedStory, setSelectedStory] = useState<number>(0);

  if (!isOpen) return null;

  const stories = [
    {
      title: 'Capítulo I: O Selamento da Cúpula',
      subtitle: 'O pacto de sangue e a biblioteca ancestral',
      text: 'Nas profundezas da Transilvânia, sob uma abóbada de vitrais manchados pelo tempo, o Códice foi forjado. Doze nobres foram convocados para jurar silêncio eterno sobre a linhagem da noite. Porém, ao bater da meia-noite, um dos presentes quebrou o juramento sagrado com uma lâmina de prata e veneno de acônito.',
    },
    {
      title: 'Capítulo II: As Sombras do Conde',
      subtitle: 'A vigília do Drácula e os olhares atentos',
      text: 'O Senhor do Castelo não pode intervir diretamente no julgamento mortal, mas tudo observa através do Oráculo. Cada marcador deixado sobre o veludo escarlate é uma pista codificada: um aviso àqueles que sabem decifrar os segredos entre as linhas de sangue.',
    },
    {
      title: 'Capítulo III: A Tríade Proibida',
      subtitle: 'Assassino, Método e Objeto',
      text: 'Para libertar as almas presas no salão, os investigadores devem pronunciar a verdade sem hesitação: quem perpetrou a traição, qual método hediondo ceifou a vida e qual objeto maldito repousa oculto sob as vestes do culpado.',
    },
    {
      title: 'Capítulo IV: A Fuga das Trevas',
      subtitle: 'A corrida contra a meia-noite',
      text: 'Três rodadas completas é tudo o que o tempo concede. Se o Assassino permanecer nas sombras após o terceiro ciclo do relógio, as portas se trancarão para sempre na escuridão perpétua.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in text-[#e8dfd8]">
      <div className="bg-gradient-to-b from-[#140b0b] via-[#0d0707] to-black border-2 border-amber-500/60 rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl shadow-black max-h-[90vh] flex flex-col space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/60 flex items-center justify-center text-amber-300 shadow-md">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-serif font-black text-amber-200 uppercase tracking-widest">
                GRIMÓRIO DO CÓDICE
              </h2>
              <p className="text-[10px] sm:text-xs text-amber-400/80 font-serif">
                Histórias ancestrais do Drácula, crônicas e leis da cúpula
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

        {/* Section Tabs */}
        <div className="flex rounded-xl bg-black/60 p-1 border border-white/10 gap-1">
          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveSection('historias');
            }}
            className={`flex-1 py-1.5 text-xs font-serif font-bold uppercase tracking-wider rounded-lg transition-all ${
              activeSection === 'historias'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-amber-200'
            }`}
          >
            Histórias do Drácula
          </button>
          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveSection('regras');
            }}
            className={`flex-1 py-1.5 text-xs font-serif font-bold uppercase tracking-wider rounded-lg transition-all ${
              activeSection === 'regras'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-amber-200'
            }`}
          >
            Regras de Investigação
          </button>
          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveSection('marcadores');
            }}
            className={`flex-1 py-1.5 text-xs font-serif font-bold uppercase tracking-wider rounded-lg transition-all ${
              activeSection === 'marcadores'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-amber-200'
            }`}
          >
            Marcadores Místicos
          </button>
        </div>

        {/* Content Scrollable Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {activeSection === 'historias' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {stories.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      soundEngine.playClick();
                      setSelectedStory(idx);
                    }}
                    className={`p-2 rounded-xl border text-left transition-all ${
                      selectedStory === idx
                        ? 'bg-amber-950/60 border-amber-400 text-amber-200 shadow-md'
                        : 'bg-zinc-900/40 border-white/10 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span className="text-[9px] font-mono text-amber-400/80 block">PARTE {idx + 1}</span>
                    <span className="text-[11px] font-serif font-bold truncate block">{s.title.split(':')[1] || s.title}</span>
                  </button>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-black/60 border border-amber-500/30 space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-serif font-bold text-sm">
                  <Scroll className="w-4 h-4 text-amber-400" />
                  <span>{stories[selectedStory].title}</span>
                </div>
                <p className="text-[11px] font-mono text-amber-400/70 italic">
                  {stories[selectedStory].subtitle}
                </p>
                <p className="text-xs sm:text-sm font-serif text-zinc-300 leading-relaxed pt-2 border-t border-white/10">
                  "{stories[selectedStory].text}"
                </p>
              </div>
            </div>
          )}

          {activeSection === 'regras' && (
            <div className="flex justify-center py-1">
              <RulesReferenceCard className="max-w-[320px] sm:max-w-[360px]" />
            </div>
          )}

          {activeSection === 'marcadores' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {Object.entries(MARKER_INFOS).map(([key, info]) => (
                <div key={key} className="p-3 rounded-2xl bg-black/60 border border-white/10 flex items-center gap-3">
                  <div className="w-8 h-8 shrink-0 flex items-center justify-center">
                    <GothicWaxSeal color={key as MarkerColor} size="custom" glow={false} />
                  </div>
                  <div>
                    <span className="text-xs font-serif font-bold text-amber-200 block uppercase">
                      Marcador {info.name}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-sans block">
                      {info.meaning}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
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
            Fechar Grimório
          </button>
        </div>
      </div>
    </div>
  );
};
