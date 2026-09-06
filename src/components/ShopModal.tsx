import React, { useState, useEffect } from 'react';
import { ShoppingBag, X, Sparkles, Coins, Crown, Palette, Check, Lock, AlertCircle } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';
import {
  loadProgression,
  buyCardFrame,
  equipCardFrame,
  buyTableFrame,
  equipTableFrame,
  CARD_FRAMES,
  TABLE_FRAMES,
  AVATAR_FRAMES,
  PlayerProgression,
  saveProgression,
} from '../utils/progression';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({ isOpen, onClose }) => {
  const [progression, setProgression] = useState<PlayerProgression>(() => loadProgression());
  const [activeTab, setActiveTab] = useState<'molduras_cartas' | 'molduras_mesa' | 'molduras_avatar'>('molduras_cartas');
  const [alertMessage, setAlertMessage] = useState<{ text: string; isError: boolean } | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setProgression(loadProgression());
    };
    window.addEventListener('codice_progression_updated', handleUpdate);
    return () => window.removeEventListener('codice_progression_updated', handleUpdate);
  }, []);

  if (!isOpen) return null;

  const showAlert = (text: string, isError: boolean = false) => {
    setAlertMessage({ text, isError });
    setTimeout(() => setAlertMessage(null), 3000);
  };

  const handleCardFrameAction = (frameId: string) => {
    soundEngine.playClick();
    const isUnlocked = progression.unlockedCardFrames.includes(frameId);

    if (isUnlocked) {
      const res = equipCardFrame(frameId);
      if (res.success) {
        setProgression(res.updated);
        showAlert(res.message, false);
      } else {
        showAlert(res.message, true);
      }
    } else {
      const res = buyCardFrame(frameId);
      if (res.success) {
        soundEngine.playCelebrationFanfare();
        setProgression(res.updated);
        showAlert(res.message, false);
      } else {
        soundEngine.playError();
        showAlert(res.message, true);
      }
    }
  };

  const handleTableFrameAction = (frameId: string) => {
    soundEngine.playClick();
    const isUnlocked = progression.unlockedTableFrames?.includes(frameId);

    if (isUnlocked) {
      const res = equipTableFrame(frameId);
      if (res.success) {
        setProgression(res.updated);
        showAlert(res.message, false);
      } else {
        showAlert(res.message, true);
      }
    } else {
      const res = buyTableFrame(frameId);
      if (res.success) {
        soundEngine.playCelebrationFanfare();
        setProgression(res.updated);
        showAlert(res.message, false);
      } else {
        soundEngine.playError();
        showAlert(res.message, true);
      }
    }
  };

  const handleAvatarFrameAction = (frameId: string, price: number) => {
    soundEngine.playClick();
    const isUnlocked = progression.unlockedAvatarFrames.includes(frameId);

    if (isUnlocked) {
      const updated = { ...progression, activeAvatarFrameId: frameId };
      saveProgression(updated);
      setProgression(updated);
      showAlert('Moldura de avatar equipada!', false);
    } else if (progression.coins >= price) {
      soundEngine.playCelebrationFanfare();
      const updated: PlayerProgression = {
        ...progression,
        coins: progression.coins - price,
        unlockedAvatarFrames: [...progression.unlockedAvatarFrames, frameId],
        activeAvatarFrameId: frameId,
      };
      saveProgression(updated);
      setProgression(updated);
      showAlert('Moldura de avatar adquirida e equipada!', false);
    } else {
      soundEngine.playError();
      showAlert(`Moedas insuficientes! Necessário: ${price} moedas.`, true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in text-[#e8dfd8]">
      <div className="bg-gradient-to-b from-[#180b06] via-[#100502] to-[#080201] border-2 border-[#b88c3a] rounded-3xl max-w-3xl w-full p-5 sm:p-6 shadow-[0_0_60px_rgba(0,0,0,0.95)] max-h-[92vh] flex flex-col space-y-4 relative overflow-hidden text-[#f7e4ba]">
        {/* Filigranas douradas nos 4 cantos */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#e5b358] pointer-events-none" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#e5b358] pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#e5b358] pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#e5b358] pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#a67c32]/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#241708] border border-[#b88c3a]/60 flex items-center justify-center text-[#e5b358] shadow-md">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-serif font-black text-[#f7e4ba] uppercase tracking-widest">
                LOJA & ARTEFATOS GÓTICOS
              </h2>
              <p className="text-[10px] sm:text-xs text-[#c9a75e] font-serif">
                Adquira molduras de cartas lendárias e personalize seu baralho de investigação
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Coins Display */}
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#241708] via-[#3d270c] to-[#241708] border border-[#e5b358] text-[#f7e4ba] text-xs font-mono font-bold shadow-lg shadow-amber-900/30">
              <Coins className="w-4 h-4 text-[#e5b358] animate-pulse" />
              <span>{progression.coins} Ouro</span>
            </div>

            <button
              onClick={() => {
                soundEngine.playClick();
                onClose();
              }}
              className="p-2 rounded-xl bg-zinc-900/80 text-zinc-400 hover:text-white border border-white/10 hover:border-amber-400/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Alert notification banner */}
        {alertMessage && (
          <div
            className={`p-2.5 rounded-xl text-xs font-serif font-bold flex items-center gap-2 border animate-fade-in ${
              alertMessage.isError
                ? 'bg-red-950/80 border-red-500/60 text-red-200'
                : 'bg-emerald-950/80 border-emerald-500/60 text-emerald-200'
            }`}
          >
            {alertMessage.isError ? <AlertCircle className="w-4 h-4 text-red-400 shrink-0" /> : <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />}
            <span>{alertMessage.text}</span>
          </div>
        )}

        {/* Categories Bar */}
        <div className="flex rounded-xl bg-black/60 p-1 border border-white/10 gap-1 overflow-x-auto">
          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('molduras_cartas');
            }}
            className={`flex-1 min-w-[130px] py-2 text-xs font-serif font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'molduras_cartas'
                ? 'bg-gradient-to-r from-amber-700 to-amber-600 text-white shadow-lg'
                : 'text-zinc-400 hover:text-amber-200'
            }`}
          >
            <Palette className="w-4 h-4 text-amber-300 shrink-0" /> Cartas (Mesa)
          </button>
          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('molduras_mesa');
            }}
            className={`flex-1 min-w-[130px] py-2 text-xs font-serif font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'molduras_mesa'
                ? 'bg-gradient-to-r from-amber-700 to-amber-600 text-white shadow-lg'
                : 'text-zinc-400 hover:text-amber-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300 shrink-0" /> Mesa 2D & Cenário
          </button>
          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('molduras_avatar');
            }}
            className={`flex-1 min-w-[130px] py-2 text-xs font-serif font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'molduras_avatar'
                ? 'bg-gradient-to-r from-amber-700 to-amber-600 text-white shadow-lg'
                : 'text-zinc-400 hover:text-amber-200'
            }`}
          >
            <Crown className="w-4 h-4 text-amber-300 shrink-0" /> Avatares
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pr-1">
          {activeTab === 'molduras_cartas' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {CARD_FRAMES.map((f) => {
                const isUnlocked = progression.unlockedCardFrames.includes(f.id);
                const isEquipped = progression.activeCardFrameId === f.id;
                const canAfford = progression.coins >= f.price;

                return (
                  <div
                    key={f.id}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between relative overflow-hidden ${
                      isEquipped
                        ? 'border-amber-400 bg-gradient-to-b from-amber-950/40 via-black to-zinc-950 ring-2 ring-amber-400/40 shadow-xl'
                        : isUnlocked
                        ? 'border-white/20 bg-black/60 hover:border-amber-400/40'
                        : 'border-white/10 bg-black/75 hover:border-zinc-500'
                    }`}
                  >
                    {/* Visual Card Miniature Sample */}
                    <div className="mb-3 relative rounded-xl p-2.5 flex flex-col items-center justify-center border" style={{ borderColor: f.borderColor, backgroundColor: '#0b0606' }}>
                      <div
                        className="w-full aspect-[2/1.4] rounded-lg border-2 p-2 flex flex-col justify-between items-center relative overflow-hidden"
                        style={{
                          borderColor: f.borderColor,
                          boxShadow: isEquipped ? `0 0 16px ${f.glowColor}` : 'none',
                        }}
                      >
                        <div className={`w-full h-full absolute inset-0 bg-gradient-to-b ${f.previewGradient} opacity-90 pointer-events-none`} />
                        <div className="relative z-10 flex items-center justify-between w-full">
                          <span className="text-[8px] font-mono font-bold text-amber-300">CÓDICE</span>
                          <div className="w-2.5 h-2.5 rotate-45 rounded-xs" style={{ background: `linear-gradient(135deg, ${f.borderColor}, #000)` }} />
                        </div>
                        <span className="relative z-10 text-[10px] font-serif font-black text-white uppercase tracking-wider text-center drop-shadow">
                          {f.name}
                        </span>
                        <div className="relative z-10 flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-serif font-bold text-amber-200 truncate">{f.name}</span>
                        {isEquipped && (
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 shrink-0">
                            <Check className="w-2.5 h-2.5" /> Em Uso
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-zinc-300 mt-1 leading-snug font-serif">{f.description}</p>
                    </div>

                    <div className="mt-3.5 pt-2.5 border-t border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {isUnlocked ? (
                          <span className="text-[10px] font-mono text-emerald-400 font-bold">Adquirida</span>
                        ) : (
                          <div className="flex items-center gap-1 text-xs font-mono font-bold text-yellow-400">
                            <Coins className="w-3.5 h-3.5 text-yellow-400" />
                            <span>{f.price === 0 ? 'Gratuito' : `${f.price}`}</span>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleCardFrameAction(f.id)}
                        disabled={isEquipped}
                        className={`px-3 py-1.5 rounded-xl text-xs font-serif font-bold uppercase transition-all flex items-center gap-1.5 shadow ${
                          isEquipped
                            ? 'bg-zinc-800 text-zinc-500 cursor-default border border-zinc-700'
                            : isUnlocked
                            ? 'bg-amber-600 hover:bg-amber-500 text-white border border-amber-400'
                            : canAfford
                            ? 'bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-black font-black border border-yellow-300'
                            : 'bg-zinc-900 text-zinc-400 border border-zinc-700 cursor-not-allowed'
                        }`}
                      >
                        {isEquipped ? (
                          <>
                            <Check className="w-3 h-3" /> Equipada
                          </>
                        ) : isUnlocked ? (
                          'Equipar'
                        ) : canAfford ? (
                          <>
                            <Coins className="w-3 h-3" /> Comprar
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3 text-zinc-400" /> Bloqueado
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'molduras_mesa' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {TABLE_FRAMES.map((f) => {
                const isUnlocked = progression.unlockedTableFrames?.includes(f.id);
                const isEquipped = progression.activeTableFrameId === f.id;
                const canAfford = progression.coins >= f.price;

                return (
                  <div
                    key={f.id}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between relative overflow-hidden ${
                      isEquipped
                        ? 'border-amber-400 bg-gradient-to-b from-amber-950/40 via-black to-zinc-950 ring-2 ring-amber-400/40 shadow-xl'
                        : isUnlocked
                        ? 'border-white/20 bg-black/60 hover:border-amber-400/40'
                        : 'border-white/10 bg-black/75 hover:border-zinc-500'
                    }`}
                  >
                    {/* Visual 2D Table Miniature Sample */}
                    <div
                      className="mb-3 relative rounded-xl p-2.5 flex flex-col items-center justify-center border overflow-hidden"
                      style={{ borderColor: f.borderColor, backgroundColor: '#070303' }}
                    >
                      <div
                        className="w-full aspect-[2/1.3] rounded-lg border-2 p-2 flex flex-col justify-between items-center relative overflow-hidden"
                        style={{
                          borderColor: f.borderColor,
                          boxShadow: isEquipped ? `0 0 20px ${f.borderColor}80` : 'none',
                        }}
                      >
                        <div className={`w-full h-full absolute inset-0 bg-gradient-to-b ${f.previewGradient} opacity-90 pointer-events-none`} />
                        {/* Table Ornate Corners */}
                        <div className={`absolute top-1 left-1 w-2.5 h-2.5 border-t-2 border-l-2 ${f.cornerAccent}`} />
                        <div className={`absolute top-1 right-1 w-2.5 h-2.5 border-t-2 border-r-2 ${f.cornerAccent}`} />
                        <div className={`absolute bottom-1 left-1 w-2.5 h-2.5 border-b-2 border-l-2 ${f.cornerAccent}`} />
                        <div className={`absolute bottom-1 right-1 w-2.5 h-2.5 border-b-2 border-r-2 ${f.cornerAccent}`} />

                        <div className="relative z-10 flex items-center justify-between w-full">
                          <span className="text-[7px] font-mono font-bold text-amber-300 uppercase">MESA 2D</span>
                          <span className="text-[7px] font-mono text-zinc-400">SALÃO</span>
                        </div>

                        {/* Miniature Tokens simulation */}
                        <div className="relative z-10 flex items-center gap-1.5 py-1">
                          <div className="w-4 h-4 rounded-full bg-amber-500/30 border border-amber-400/60" />
                          <div className="w-5 h-5 rounded-full bg-red-500/40 border border-red-400/80 shadow" />
                          <div className="w-4 h-4 rounded-full bg-purple-500/30 border border-purple-400/60" />
                        </div>

                        <span className="relative z-10 text-[9px] font-serif font-black text-white uppercase tracking-wider text-center drop-shadow">
                          {f.name}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-serif font-bold text-amber-200 truncate">{f.name}</span>
                        {isEquipped && (
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 shrink-0">
                            <Check className="w-2.5 h-2.5" /> Em Uso
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-zinc-300 mt-1 leading-snug font-serif">{f.description}</p>
                    </div>

                    <div className="mt-3.5 pt-2.5 border-t border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {isUnlocked ? (
                          <span className="text-[10px] font-mono text-emerald-400 font-bold">Adquirida</span>
                        ) : (
                          <div className="flex items-center gap-1 text-xs font-mono font-bold text-yellow-400">
                            <Coins className="w-3.5 h-3.5 text-yellow-400" />
                            <span>{f.price === 0 ? 'Gratuito' : `${f.price}`}</span>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleTableFrameAction(f.id)}
                        disabled={isEquipped}
                        className={`px-3 py-1.5 rounded-xl text-xs font-serif font-bold uppercase transition-all flex items-center gap-1.5 shadow ${
                          isEquipped
                            ? 'bg-zinc-800 text-zinc-500 cursor-default border border-zinc-700'
                            : isUnlocked
                            ? 'bg-amber-600 hover:bg-amber-500 text-white border border-amber-400'
                            : canAfford
                            ? 'bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-black font-black border border-yellow-300'
                            : 'bg-zinc-900 text-zinc-400 border border-zinc-700 cursor-not-allowed'
                        }`}
                      >
                        {isEquipped ? (
                          <>
                            <Check className="w-3 h-3" /> Equipada
                          </>
                        ) : isUnlocked ? (
                          'Equipar'
                        ) : canAfford ? (
                          <>
                            <Coins className="w-3 h-3" /> Comprar
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3 text-zinc-400" /> Bloqueado
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'molduras_avatar' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {AVATAR_FRAMES.map((f) => {
                const isUnlocked = progression.unlockedAvatarFrames.includes(f.id);
                const isEquipped = progression.activeAvatarFrameId === f.id;
                const canAfford = progression.coins >= f.price;

                return (
                  <div
                    key={f.id}
                    className={`p-4 rounded-2xl bg-black/60 border transition-all flex flex-col justify-between ${
                      isEquipped
                        ? 'border-amber-400 ring-2 ring-amber-400/30'
                        : 'border-white/10 hover:border-amber-500/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-serif font-bold text-amber-200">{f.name}</span>
                        {isEquipped && (
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                            <Check className="w-2.5 h-2.5" /> Em Uso
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-1 leading-snug">{f.description}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-amber-400">
                        {isUnlocked ? 'Desbloqueado' : f.price === 0 ? 'Gratuito' : `${f.price} Ouro`}
                      </span>
                      <button
                        onClick={() => handleAvatarFrameAction(f.id, f.price)}
                        disabled={isEquipped}
                        className={`px-3 py-1.5 rounded-xl text-xs font-serif font-bold uppercase transition-all ${
                          isEquipped
                            ? 'bg-zinc-800 text-zinc-500 cursor-default'
                            : isUnlocked
                            ? 'bg-amber-600 hover:bg-amber-500 text-white shadow'
                            : canAfford
                            ? 'bg-yellow-600 hover:bg-yellow-500 text-black font-black'
                            : 'bg-zinc-900 text-zinc-500 cursor-not-allowed'
                        }`}
                      >
                        {isEquipped ? 'Equipado' : isUnlocked ? 'Equipar' : `Comprar (${f.price})`}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info about earning coins */}
        <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] font-serif text-amber-300/80">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Ganhe Ouro participando de investigações e subindo de nível com seus pontos de XP!</span>
          </div>
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-white/10 text-xs font-serif font-bold uppercase"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
