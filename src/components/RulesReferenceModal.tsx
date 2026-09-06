import React from 'react';
import { X, Upload, BookOpen } from 'lucide-react';
import { RulesReferenceCard } from './RulesReferenceCard';
import { promptCardArtUpload } from '../utils/customCardArt';

interface RulesReferenceModalProps {
  onClose: () => void;
}

export const RulesReferenceModal: React.FC<RulesReferenceModalProps> = ({ onClose }) => {
  const handleUploadClick = () => {
    promptCardArtUpload('rules_reference', {
      name: 'Carta Manual de Regras: O Códice da Morte',
      aliases: ['rules_reference', 'codice_regras', 'manual_regras', 'reference_card', 'codice_manual'],
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-3 sm:p-4 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative max-w-md w-full flex flex-col items-center space-y-3 sm:space-y-4 my-auto">
        {/* Top Floating Actions Bar */}
        <div className="w-full flex items-center justify-between px-2 text-amber-200">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-serif font-bold uppercase tracking-wider text-amber-300">
              Manual do Códice
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleUploadClick}
              title="Trocar ou enviar PNG da carta de regras"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-500/40 text-[11px] font-serif font-bold transition-all"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Trocar PNG</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-xl bg-black/80 text-zinc-400 hover:text-white border border-white/20 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* THE GOTHIC RULES REFERENCE CARD */}
        <div className="w-full flex justify-center drop-shadow-2xl">
          <RulesReferenceCard />
        </div>

        {/* Bottom Close Action */}
        <button
          onClick={onClose}
          className="w-full max-w-[360px] sm:max-w-[400px] py-2 rounded-xl bg-gradient-to-r from-amber-800 via-amber-700 to-amber-800 hover:from-amber-700 hover:to-amber-600 text-amber-100 font-serif font-bold text-xs uppercase tracking-widest transition-all border border-amber-400/60 shadow-lg cursor-pointer"
        >
          Fechar Manual
        </button>
      </div>
    </div>
  );
};

