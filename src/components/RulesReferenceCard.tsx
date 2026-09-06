import React from 'react';
import { GothicWaxSeal } from './GothicWaxSeal';
import { useCustomCardArt, promptCardArtUpload } from '../utils/customCardArt';
import { Upload, Sparkles } from 'lucide-react';

interface RulesReferenceCardProps {
  className?: string;
}

export const RulesReferenceCard: React.FC<RulesReferenceCardProps> = ({ className = '' }) => {
  const lookupIds = ['rules_reference', 'codice_regras', 'manual_regras', 'reference_card', 'codice_manual'];
  const customArt = useCustomCardArt(lookupIds);

  const handleUpload = () => {
    promptCardArtUpload('rules_reference', {
      name: 'Manual de Regras: O Códice da Morte (Carta)',
      aliases: lookupIds,
    });
  };

  if (customArt) {
    return (
      <div
        onDoubleClick={handleUpload}
        title="Duplo clique para alterar arte da carta de regras"
        className={`relative rounded-3xl overflow-hidden aspect-[2/3] w-full max-w-[360px] sm:max-w-[400px] mx-auto shadow-2xl border-2 border-amber-500/60 transition-all group cursor-pointer ${className}`}
      >
        <img
          src={customArt}
          alt="Manual de Regras - O Códice da Morte"
          className="w-full h-full object-cover rounded-3xl pointer-events-none"
        />
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="bg-black/80 text-amber-200 border border-amber-400/60 px-3 py-1.5 rounded-xl text-xs font-serif font-bold tracking-wider shadow-lg flex items-center gap-2">
            <Upload className="w-3.5 h-3.5" />
            Duplo clique para trocar PNG
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      onDoubleClick={handleUpload}
      title="Duplo clique para enviar PNG personalizado da carta"
      className={`relative rounded-3xl aspect-[2/3] w-full max-w-[360px] sm:max-w-[400px] mx-auto shadow-2xl transition-all select-none border-[3px] border-[#382b1d] bg-[#0c0906] p-3 sm:p-4 flex flex-col justify-between overflow-hidden group cursor-pointer ${className}`}
    >
      {/* Ornate Gold Border & Corner Filigree */}
      <div className="absolute inset-1.5 rounded-[22px] border border-amber-600/40 pointer-events-none z-10" />
      <div className="absolute inset-2.5 rounded-[18px] border border-amber-500/20 pointer-events-none z-10" />

      {/* Aged Parchment Inner Background Texture */}
      <div className="absolute inset-2.5 rounded-[18px] bg-gradient-to-b from-[#211a12] via-[#17110a] to-[#0d0905] z-0" />

      {/* Subtle Background Grunge/Gothic Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(217,119,6,0.12),transparent_70%)] pointer-events-none z-0" />

      {/* ================= CARD HEADER ================= */}
      <div className="relative z-10 flex flex-col items-center text-center pt-1 sm:pt-2">
        {/* Top Skull Icon */}
        <div className="w-6 h-6 sm:w-7 sm:h-7 mb-1 text-amber-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-amber-200">
            <path d="M12 2C7.58 2 4 5.58 4 10c0 2.5 1.15 4.73 2.94 6.21L6 20h3l1-2h4l1 2h3l-.94-3.79C18.85 14.73 20 12.5 20 10c0-4.42-3.58-8-8-8zm-3 10a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm6 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-lg sm:text-xl font-serif font-black text-amber-100 uppercase tracking-[0.14em] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
          O CÓDICE DA MORTE
        </h1>

        {/* Subtitle */}
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-amber-500/80 text-[10px]">✦</span>
          <span className="text-[9px] sm:text-[10px] font-serif font-bold text-amber-300/90 uppercase tracking-[0.18em]">
            REFERÊNCIA DE MARCADORES
          </span>
          <span className="text-amber-500/80 text-[10px]">✦</span>
        </div>
      </div>

      {/* ================= BOX 1: CORES DAS FICHAS ================= */}
      <div className="relative z-10 mt-2 p-2.5 sm:p-3 rounded-2xl bg-[#140e08]/90 border border-amber-600/40 shadow-inner flex flex-col space-y-1.5">
        {/* Section Header */}
        <div className="text-center pb-1 border-b border-amber-600/20 flex items-center justify-center gap-1">
          <span className="text-[10px] sm:text-[11px] font-serif font-black text-amber-300 uppercase tracking-widest">
            1. CORES DAS FICHAS
          </span>
        </div>

        {/* 5 Wax Seal Rows */}
        <div className="space-y-1.5 pt-0.5">
          {/* RED */}
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 sm:w-6 sm:h-6 shrink-0">
              <GothicWaxSeal color="vermelho" size="custom" glow={false} />
            </div>
            <div className="text-[10.5px] sm:text-xs font-serif leading-tight">
              <span className="font-black text-red-400 tracking-wider">RED</span>
              <span className="text-amber-100/90 font-serif"> — Alta relevância / perigo</span>
            </div>
          </div>

          {/* BLUE */}
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 sm:w-6 sm:h-6 shrink-0">
              <GothicWaxSeal color="azul" size="custom" glow={false} />
            </div>
            <div className="text-[10.5px] sm:text-xs font-serif leading-tight">
              <span className="font-black text-sky-400 tracking-wider">BLUE</span>
              <span className="text-amber-100/90 font-serif"> — Ligado ao MÉTODO</span>
            </div>
          </div>

          {/* BLACK */}
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 sm:w-6 sm:h-6 shrink-0">
              <GothicWaxSeal color="preto" size="custom" glow={false} />
            </div>
            <div className="text-[10.5px] sm:text-xs font-serif leading-tight">
              <span className="font-black text-zinc-300 tracking-wider">BLACK</span>
              <span className="text-amber-100/90 font-serif"> — Ligado ao OBJETO</span>
            </div>
          </div>

          {/* GOLD */}
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 sm:w-6 sm:h-6 shrink-0">
              <GothicWaxSeal color="dourado" size="custom" glow={false} />
            </div>
            <div className="text-[10.5px] sm:text-xs font-serif leading-tight">
              <span className="font-black text-amber-300 tracking-wider">GOLD</span>
              <span className="text-amber-100/90 font-serif"> — Pista central</span>
            </div>
          </div>

          {/* GREY */}
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 sm:w-6 sm:h-6 shrink-0">
              <GothicWaxSeal color="cinza" size="custom" glow={false} />
            </div>
            <div className="text-[10.5px] sm:text-xs font-serif leading-tight">
              <span className="font-black text-gray-300 tracking-wider">GREY</span>
              <span className="text-amber-100/90 font-serif"> — Menos confiável</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= BOX 2: FLUXO RÁPIDO ================= */}
      <div className="relative z-10 mt-1.5 p-2.5 sm:p-3 rounded-2xl bg-[#140e08]/90 border border-amber-600/40 shadow-inner flex flex-col space-y-1.5">
        {/* Section Header */}
        <div className="text-center pb-1 border-b border-amber-600/20 flex items-center justify-center gap-1">
          <span className="text-[10px] sm:text-[11px] font-serif font-black text-amber-300 uppercase tracking-widest">
            2. FLUXO RÁPIDO
          </span>
        </div>

        {/* 5 Turn Steps */}
        <div className="space-y-1 pt-0.5 text-[9.5px] sm:text-[10.5px] font-serif text-amber-100/90 leading-tight">
          <div className="flex items-start gap-1.5">
            <span className="w-4 h-4 rounded-full bg-amber-950/80 border border-amber-500/60 text-amber-300 font-mono text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">
              1
            </span>
            <span>Cada jogador: 4 Métodos + 4 Objetos à frente.</span>
          </div>

          <div className="flex items-start gap-1.5">
            <span className="w-4 h-4 rounded-full bg-amber-950/80 border border-amber-500/60 text-amber-300 font-mono text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">
              2
            </span>
            <span>Noite: Assassino (+Cúmplice) escolhe 1+1.</span>
          </div>

          <div className="flex items-start gap-1.5">
            <span className="w-4 h-4 rounded-full bg-amber-950/80 border border-amber-500/60 text-amber-300 font-mono text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">
              3
            </span>
            <span>Oráculo observa e conta a história.</span>
          </div>

          <div className="flex items-start gap-1.5">
            <span className="w-4 h-4 rounded-full bg-amber-950/80 border border-amber-500/60 text-amber-300 font-mono text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">
              4
            </span>
            <div className="flex flex-col">
              <span>Oráculo marca evidências com as cores.</span>
              <span className="text-[8.5px] sm:text-[9px] font-serif font-black text-red-400 uppercase tracking-wider mt-0.5 flex items-center gap-1">
                <span>⚠</span>
                <span>ORÁCULO NUNCA FALA — SÓ MARCA COM CORES</span>
              </span>
            </div>
          </div>

          <div className="flex items-start gap-1.5">
            <span className="w-4 h-4 rounded-full bg-amber-950/80 border border-amber-500/60 text-amber-300 font-mono text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">
              5
            </span>
            <span>Acusem: Assassino + Método + Objeto.</span>
          </div>
        </div>
      </div>

      {/* ================= CARD FOOTER / BOTTOM SKULL ================= */}
      <div className="relative z-10 flex items-center justify-center pt-1 text-amber-400/80">
        <div className="w-5 h-5 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-amber-400">
            <path d="M12 2C7.58 2 4 5.58 4 10c0 2.5 1.15 4.73 2.94 6.21L6 20h3l1-2h4l1 2h3l-.94-3.79C18.85 14.73 20 12.5 20 10c0-4.42-3.58-8-8-8zm-3 10a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm6 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
          </svg>
        </div>
      </div>
    </div>
  );
};
