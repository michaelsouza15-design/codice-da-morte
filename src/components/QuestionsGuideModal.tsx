import React, { useState } from 'react';
import {
  X,
  HelpCircle,
  MessageSquare,
  Search,
  Sparkles,
  ShieldAlert,
  Flame,
  CheckCircle2,
  Send,
  BookOpen,
} from 'lucide-react';
import { MARKER_INFOS } from '../data/gameData';

interface QuestionsGuideModalProps {
  onClose: () => void;
  onSelectQuestion?: (questionText: string) => void;
}

export const QuestionsGuideModal: React.FC<QuestionsGuideModalProps> = ({
  onClose,
  onSelectQuestion,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'geral' | 'metodos' | 'objetos' | 'oraculo'>('geral');
  const [copiedQuestion, setCopiedQuestion] = useState<string | null>(null);

  const QUESTION_CATEGORIES = {
    geral: [
      {
        q: "Onde você estava no momento em que o sino da biblioteca tocou?",
        desc: "Excelente para checar inconsistências entre os relatos dos suspeitos e a carta de Local do Crime.",
        tag: "Álibi",
      },
      {
        q: "Quem você viu circulando próximo às alas restritas do arquivo?",
        desc: "Pode forçar o Cúmplice ou o Assassino a acusarem um inocente ou hesitarem.",
        tag: "Testemunho",
      },
      {
        q: "Por que você possuía acesso aos registros trancados da abadia?",
        desc: "Crucial para confrontar quem possui métodos ou objetos de alta periculosidade.",
        tag: "Motivação",
      },
      {
        q: "Você notou algum cheiro ou ruído incomum antes do silêncio se instalar?",
        desc: "Ajuda a cruzar pistas com Marcadores de Causa da Morte e Som.",
        tag: "Percepção",
      },
    ],
    metodos: [
      {
        q: "Qual das suas cartas de Método melhor se alinha com a pista de perigo indicada pelo Oráculo?",
        desc: "Força o jogador a analisar seu próprio dossiê e se justificar perante a mesa.",
        tag: "Método",
      },
      {
        q: "Você saberia manusear o veneno/mecanismo apontado nas evidências?",
        desc: "Testa a narrativa do personagem e seu perfil profissional.",
        tag: "Perícia",
      },
      {
        q: "Por que você nega a ligação do seu método com a cor Azul fixada no mural?",
        desc: "Marcadores Azuis são colocados pelo Oráculo para indicar correlação com o Método Fatal.",
        tag: "Confronto",
      },
    ],
    objetos: [
      {
        q: "Qual dos seus 4 Objetos estava sob sua posse durante a última hora?",
        desc: "Investiga a custódia dos itens suspeitos na mesa.",
        tag: "Custódia",
      },
      {
        q: "Como o seu artefato veio parar próximo ao vestígio marcado em Preto?",
        desc: "Marcadores Pretos indicam relação direta com o Objeto do Crime.",
        tag: "Rastreio",
      },
      {
        q: "Algum outro investigador pediu para examinar seus instrumentos?",
        desc: "Descobre possíveis tentativas de sabotagem ou incriminação.",
        tag: "Sabotagem",
      },
    ],
    oraculo: [
      {
        q: "Como devemos interpretar o marcador Dourado na carta central?",
        desc: "A gema dourada aponta o cerne da narrativa construída pelo Oráculo.",
        tag: "Decifração",
      },
      {
        q: "Por que a carta de Localidade recebeu um marcador Cinza?",
        desc: "Marcadores Cinzas indicam menor certeza ou pista ambígua.",
        tag: "Descarte",
      },
      {
        q: "Há alguma contradição entre os dois suspeitos mais votados?",
        desc: "Auxilia a mesa a focar a dedução antes de gastar a ficha de acusação.",
        tag: "Consenso",
      },
    ],
  };

  const handleUseQuestion = (q: string) => {
    if (onSelectQuestion) {
      onSelectQuestion(q);
      onClose();
    } else {
      navigator.clipboard?.writeText(q);
      setCopiedQuestion(q);
      setTimeout(() => setCopiedQuestion(null), 2000);
    }
  };

  return (
    <div
      id="questions-guide-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-3xl glass-ui card-shadow rounded-2xl sm:rounded-3xl border-amber-500/40 p-4 sm:p-6 md:p-7 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-950/80 border border-amber-500/50 flex items-center justify-center text-amber-300 shadow-md">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-md">
                  Guia do Investigador
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-serif font-bold text-white tracking-wide mt-0.5">
                Perguntas & Interrogatório Forense
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl glass-ui text-zinc-400 hover:text-white transition-colors border border-white/10 hover:border-white/30"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 py-3 border-b border-white/10 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setSelectedCategory('geral')}
            className={`px-3 py-1.5 rounded-xl text-xs font-serif font-bold transition-all whitespace-nowrap ${
              selectedCategory === 'geral'
                ? 'bg-amber-600 text-white border border-amber-400 shadow-sm'
                : 'glass-ui text-zinc-300 hover:text-white'
            }`}
          >
            Álibis & Geral
          </button>
          <button
            onClick={() => setSelectedCategory('metodos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-serif font-bold transition-all whitespace-nowrap ${
              selectedCategory === 'metodos'
                ? 'bg-blue-600 text-white border border-blue-400 shadow-sm'
                : 'glass-ui text-zinc-300 hover:text-white'
            }`}
          >
            Sobre Métodos (Azul)
          </button>
          <button
            onClick={() => setSelectedCategory('objetos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-serif font-bold transition-all whitespace-nowrap ${
              selectedCategory === 'objetos'
                ? 'bg-zinc-700 text-white border border-zinc-500 shadow-sm'
                : 'glass-ui text-zinc-300 hover:text-white'
            }`}
          >
            Sobre Objetos (Preto)
          </button>
          <button
            onClick={() => setSelectedCategory('oraculo')}
            className={`px-3 py-1.5 rounded-xl text-xs font-serif font-bold transition-all whitespace-nowrap ${
              selectedCategory === 'oraculo'
                ? 'bg-purple-700 text-white border border-purple-400 shadow-sm'
                : 'glass-ui text-zinc-300 hover:text-white'
            }`}
          >
            Pistas do Oráculo
          </button>
        </div>

        {/* Questions List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
          {QUESTION_CATEGORIES[selectedCategory].map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl glass-ui border-white/10 hover:border-amber-400/50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded">
                    {item.tag}
                  </span>
                </div>
                <h4 className="font-serif font-bold text-xs sm:text-sm text-zinc-100 group-hover:text-amber-300 transition-colors">
                  "{item.q}"
                </h4>
                <p className="text-[11px] text-zinc-400 font-sans mt-0.5">
                  {item.desc}
                </p>
              </div>

              <button
                onClick={() => handleUseQuestion(item.q)}
                className="px-3 py-2 rounded-xl bg-amber-950/70 hover:bg-amber-800 text-amber-200 border border-amber-500/40 text-xs font-serif font-bold shrink-0 flex items-center gap-1.5 transition-all shadow"
              >
                <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                <span>{onSelectQuestion ? 'Fazer Pergunta' : copiedQuestion === item.q ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>
          ))}
        </div>

        {/* Marker Color Reference Mini-Bar */}
        <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[10px] shrink-0 text-zinc-400">
          <span className="font-mono text-amber-300/80 font-bold uppercase">Lembrete de Cores:</span>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1 text-red-300">
              <span className="w-2 h-2 rounded-full bg-red-500" /> Perigo/Foco
            </span>
            <span className="flex items-center gap-1 text-blue-300">
              <span className="w-2 h-2 rounded-full bg-blue-500" /> Método
            </span>
            <span className="flex items-center gap-1 text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-zinc-400" /> Objeto
            </span>
            <span className="flex items-center gap-1 text-amber-300">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> Pista Central
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
