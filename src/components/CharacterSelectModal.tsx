import React, { useState, useMemo, useRef } from 'react';
import { CHARACTERS, ABILITIES, getCharacterById } from '../data/gameData';
import { CharacterInfo } from '../types/game';
import { GothicAvatar } from './GothicAvatar';
import { soundEngine } from '../utils/soundEngine';
import { useCustomCardArt, promptCardArtUpload, persistCharacterToServer, processImageUpload } from '../utils/customCardArt';
import {
  ArrowLeft,
  Lock,
  Unlock,
  Check,
  Zap,
  X,
  UserCheck,
  Shield,
  Sparkles,
  Image as ImageIcon,
  Upload,
  Loader2,
} from 'lucide-react';

interface CharacterSlotItemProps {
  char: CharacterInfo;
  isSelected: boolean;
  isEquipped: boolean;
  unlocked: boolean;
  isTaken: boolean;
  onClick: () => void;
  onDoubleClickUpload: () => void;
}

const CharacterSlotItem: React.FC<CharacterSlotItemProps> = ({
  char,
  isSelected,
  isEquipped,
  unlocked,
  isTaken,
  onClick,
  onDoubleClickUpload,
}) => {
  const lastTapRef = useRef<number>(0);
  const lookupIds = useMemo(
    () => [
      `crest_${char.id}`,
      `brasao_${char.id}`,
      `crest_${char.number}`,
      `crest_char_${char.number}`,
      `char_crest_${char.id}`,
      char.id,
      ...(char.aliases || []),
    ],
    [char.id, char.aliases, char.number]
  );
  const customArt = useCustomCardArt(lookupIds);
  const avatarSrc = customArt || char.avatarUrl;

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDoubleClickUpload();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const now = Date.now();
    if (now - lastTapRef.current < 350) {
      e.stopPropagation();
      onDoubleClickUpload();
    }
    lastTapRef.current = now;
  };

  return (
    <div
      id={`character-slot-${char.id}`}
      onClick={onClick}
      onDoubleClick={handleDoubleClick}
      onTouchEnd={handleTouchEnd}
      title="Clique para selecionar. Duplo clique para vincular brasão em PNG."
      className={`group relative aspect-[210/170] flex items-center justify-center rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 p-0.5 select-none ${
        isSelected
          ? 'border-2 border-red-500 ring-2 ring-red-500/70 shadow-[0_0_18px_rgba(239,68,68,0.85)] bg-gradient-to-b from-[#2e120f] to-[#140b09] scale-[1.03]'
          : 'border-2 border-amber-900/60 hover:border-amber-500/80 bg-[#120a07] hover:bg-[#1a0e0a] shadow-[0_4px_12px_rgba(0,0,0,0.6)]'
      } ${isTaken ? 'opacity-40 cursor-not-allowed' : ''}`}
    >
      {unlocked ? (
        <img
          src={avatarSrc}
          alt={`Brasão`}
          className="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-300 rounded-xl"
          referrerPolicy="no-referrer"
        />
      ) : (
        // Locked Padlock slot
        <div className="w-full h-full bg-[#0d0908] flex flex-col items-center justify-center p-2 text-stone-500">
          <Lock className="w-6 h-6 text-stone-500/80 mb-1" />
          <span className="text-[9px] font-serif text-stone-500 uppercase tracking-widest">
            Bloqueado
          </span>
        </div>
      )}

      {/* Check badge if currently equipped in game */}
      {isEquipped && (
        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-emerald-600 border border-emerald-300 text-white flex items-center justify-center shadow-md z-10">
          <Check className="w-3 h-3 stroke-[3]" />
        </div>
      )}

      {/* Custom art badge subtle indicator */}
      {customArt && (
        <div className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border border-black shadow-sm z-10 pointer-events-none" />
      )}

      {/* Red Selection Indicator Ring */}
      {isSelected && (
        <div className="absolute inset-0 rounded-2xl border-2 border-red-500/80 pointer-events-none" />
      )}
    </div>
  );
};

interface CharacterSelectModalProps {
  selectedCharId: string;
  onSelect: (char: CharacterInfo) => void;
  onClose: () => void;
  takenCharIds?: string[];
}

export const CharacterSelectModal: React.FC<CharacterSelectModalProps> = ({
  selectedCharId,
  onSelect,
  onClose,
  takenCharIds = [],
}) => {
  // State for unlocked characters (persisted or defaults)
  const [unlockedIds, setUnlockedIds] = useState<string[]>(() => {
    const initialUnlocked = CHARACTERS.filter((c) => !c.isLocked).map((c) => c.id);
    // Also include selectedCharId if any
    if (selectedCharId && !initialUnlocked.includes(selectedCharId)) {
      initialUnlocked.push(selectedCharId);
    }
    return initialUnlocked;
  });

  const [activeCharId, setActiveCharId] = useState<string>(() => {
    return selectedCharId || CHARACTERS[1]?.id || CHARACTERS[0].id;
  });

  const [categoryFilter, setCategoryFilter] = useState<'all' | 'investigadores' | 'especiais'>('all');
  const [showDossier, setShowDossier] = useState<boolean>(false);

  const activeChar = useMemo(() => {
    return getCharacterById(activeCharId);
  }, [activeCharId]);

  const activeAbility = useMemo(() => {
    return ABILITIES.find((a) => a.id === activeChar.defaultAbilityId);
  }, [activeChar]);

  const isCharUnlocked = (charId: string) => {
    return unlockedIds.includes(charId);
  };

  const unlockCharacter = (charId: string) => {
    soundEngine.playVictory();
    setUnlockedIds((prev) => (prev.includes(charId) ? prev : [...prev, charId]));
  };

  const filteredCharacters = useMemo(() => {
    return CHARACTERS.filter((char) => {
      if (categoryFilter === 'all') return true;
      if (categoryFilter === 'investigadores') return char.category === 'investigadores';
      if (categoryFilter === 'especiais') return char.category === 'especiais';
      return true;
    });
  }, [categoryFilter]);

  const handleCardClick = (charId: string) => {
    soundEngine.playCardFlip();
    setActiveCharId(charId);
  };

  const handleConfirmSelect = (char: CharacterInfo) => {
    soundEngine.playEventStinger();
    onSelect(char);
    onClose();
  };

  return (
    <div
      id="character-select-modal-overlay"
      className="fixed inset-0 z-50 bg-[#070403]/95 flex items-center justify-center p-0 sm:p-4 backdrop-blur-md animate-fade-in select-none"
    >
      {/* Outer Shell styled with gothic dark leather & gold/crimson accents */}
      <div
        id="character-select-modal-container"
        className="w-full max-w-md sm:max-w-lg h-full sm:h-auto sm:max-h-[92vh] bg-gradient-to-b from-[#180e0a] via-[#110907] to-[#0a0504] sm:border-2 sm:border-[#382119] sm:rounded-3xl shadow-2xl shadow-black flex flex-col overflow-hidden text-[#eedec5]"
      >
        {/* Top Header matching Image 1: Back arrow, Centered Title */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#2b1711] bg-[#120906]">
          <button
            id="char-select-back-btn"
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-amber-200/90 hover:text-amber-100 hover:bg-white/5 active:scale-95 transition-all"
            title="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <h1 className="text-sm sm:text-base font-serif font-black tracking-[0.25em] text-[#f3e5d3] uppercase text-center">
            PERSONAGENS
          </h1>

          {/* Optical Spacer */}
          <div className="w-8 h-8 flex items-center justify-center">
            <span className="text-[10px] font-mono text-amber-500/70 font-semibold">
              {filteredCharacters.length}
            </span>
          </div>
        </div>

        {/* Category Filter Tabs matching Image 1 */}
        <div className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0e0705] border-b border-[#24130e]">
          <button
            id="tab-filter-todos"
            onClick={() => {
              soundEngine.playClick();
              setCategoryFilter('all');
            }}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-serif uppercase tracking-wider transition-all text-center ${
              categoryFilter === 'all'
                ? 'bg-[#3d120f] border border-red-700/80 text-amber-100 font-bold shadow-[0_0_12px_rgba(185,28,28,0.4)]'
                : 'bg-[#150c09] border border-[#2d1812] text-stone-400 hover:text-stone-200 font-medium'
            }`}
          >
            TODOS
          </button>
          <button
            id="tab-filter-investigadores"
            onClick={() => {
              soundEngine.playClick();
              setCategoryFilter('investigadores');
            }}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-serif uppercase tracking-wider transition-all text-center ${
              categoryFilter === 'investigadores'
                ? 'bg-[#3d120f] border border-red-700/80 text-amber-100 font-bold shadow-[0_0_12px_rgba(185,28,28,0.4)]'
                : 'bg-[#150c09] border border-[#2d1812] text-stone-400 hover:text-stone-200 font-medium'
            }`}
          >
            INVESTIGADORES
          </button>
          <button
            id="tab-filter-especiais"
            onClick={() => {
              soundEngine.playClick();
              setCategoryFilter('especiais');
            }}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-serif uppercase tracking-wider transition-all text-center ${
              categoryFilter === 'especiais'
                ? 'bg-[#3d120f] border border-red-700/80 text-amber-100 font-bold shadow-[0_0_12px_rgba(185,28,28,0.4)]'
                : 'bg-[#150c09] border border-[#2d1812] text-stone-400 hover:text-stone-200 font-medium'
            }`}
          >
            ESPECIAIS
          </button>
        </div>

        {/* 4-Column Character Cards Grid matching Image 1 */}
        <div
          id="character-selection-grid"
          className="flex-1 overflow-y-auto p-3 sm:p-4 custom-scrollbar"
        >
          <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
            {filteredCharacters.map((char) => {
              const isSelected = activeCharId === char.id;
              const isEquipped = char.id === selectedCharId;
              const unlocked = isCharUnlocked(char.id);
              const isTaken = takenCharIds.includes(char.id) && char.id !== selectedCharId;

              return (
                <CharacterSlotItem
                  key={char.id}
                  char={char}
                  isSelected={isSelected}
                  isEquipped={isEquipped}
                  unlocked={unlocked}
                  isTaken={isTaken}
                  onClick={() => handleCardClick(char.id)}
                  onDoubleClickUpload={() => {
                    promptCardArtUpload(`crest_${char.id}`, {
                      name: `Brasão: ${char.name}`,
                      aliases: [`brasao_${char.id}`, `crest_${char.number}`, `char_crest_${char.id}`],
                    });
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Bottom Bar with VER DETALHES Button matching Image 1 */}
        <div className="p-3 sm:p-4 border-t border-[#2b1711] bg-[#0e0705] flex flex-col gap-2">
          <div className="flex items-center justify-between text-[10px] font-serif text-amber-500/80 px-1">
            <span>✨ Duplo clique em um brasão para vincular imagem PNG</span>
            <span>{filteredCharacters.length} personagens</span>
          </div>

          <button
            id="ver-detalhes-btn"
            onClick={() => {
              soundEngine.playClick();
              setShowDossier(true);
            }}
            className="w-full py-3 rounded-xl font-serif font-bold text-xs sm:text-sm uppercase tracking-[0.25em] text-[#eedec5] bg-gradient-to-r from-[#2a0e0c] via-[#4a1513] to-[#2a0e0c] border border-red-800/80 shadow-lg shadow-black hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            <span>VER DETALHES</span>
          </button>
        </div>
      </div>

      {/* Detail Dossier Modal matching the Medallion Style */}
      {showDossier && (
        <DossierView
          activeChar={activeChar}
          activeAbility={activeAbility}
          selectedCharId={selectedCharId}
          isCharUnlocked={isCharUnlocked}
          unlockCharacter={unlockCharacter}
          handleConfirmSelect={handleConfirmSelect}
          onClose={() => setShowDossier(false)}
        />
      )}
    </div>
  );
};

interface DossierViewProps {
  activeChar: CharacterInfo;
  activeAbility: any;
  selectedCharId: string;
  isCharUnlocked: (id: string) => boolean;
  unlockCharacter: (id: string) => void;
  handleConfirmSelect: (char: CharacterInfo) => void;
  onClose: () => void;
}

const DossierView: React.FC<DossierViewProps> = ({
  activeChar,
  activeAbility,
  selectedCharId,
  isCharUnlocked,
  unlockCharacter,
  handleConfirmSelect,
  onClose,
}) => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const lastTapRef = useRef<number>(0);
  const lookupIds = useMemo(
    () => [
      `crest_${activeChar.id}`,
      `brasao_${activeChar.id}`,
      `crest_${activeChar.number}`,
      `crest_char_${activeChar.number}`,
      `char_crest_${activeChar.id}`,
      activeChar.id,
      ...(activeChar.aliases || []),
    ],
    [activeChar.id, activeChar.aliases, activeChar.number]
  );
  const customArt = useCustomCardArt(lookupIds);
  const avatarSrc = customArt || activeChar.avatarUrl;

  const handleUpload = () => {
    promptCardArtUpload(`crest_${activeChar.id}`, {
      name: `Brasão: ${activeChar.name}`,
      aliases: [`brasao_${activeChar.id}`, `crest_${activeChar.number}`, `char_crest_${activeChar.id}`],
    });
  };

  const handleDirectPngUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      soundEngine.playCardFlip();
      const dataUrl = await processImageUpload(file);
      const slot = activeChar.number ? activeChar.number - 1 : activeChar.id;
      await persistCharacterToServer(slot, dataUrl, file.name);
      soundEngine.playVictory();
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err) {
      console.error('Erro ao substituir imagem:', err);
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handlePortraitDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleUpload();
  };

  const handlePortraitTouchEnd = (e: React.TouchEvent) => {
    const now = Date.now();
    if (now - lastTapRef.current < 350) {
      e.stopPropagation();
      handleUpload();
    }
    lastTapRef.current = now;
  };

  return (
    <div
      id="character-dossier-overlay"
      className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in"
    >
      <div
        id="character-dossier-modal"
        className="w-full max-w-sm sm:max-w-md bg-gradient-to-b from-[#1c110c] via-[#140b08] to-[#0a0504] border-2 border-amber-600/60 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-black relative text-[#eedec5] space-y-4"
      >
        {/* Close Button */}
        <button
          id="close-dossier-btn"
          onClick={() => {
            soundEngine.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-black/60 border border-amber-500/30 text-stone-400 hover:text-amber-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Medallion & Card Portrait Display */}
        <div className="flex flex-col items-center pt-2">
          <div
            onClick={handlePortraitDoubleClick}
            onDoubleClick={handlePortraitDoubleClick}
            onTouchEnd={handlePortraitTouchEnd}
            title="Dê duplo clique ou use o botão abaixo para substituir por imagem PNG"
            className="w-48 aspect-[210/170] rounded-2xl overflow-hidden border-2 border-amber-500/80 shadow-[0_0_24px_rgba(245,158,11,0.3)] bg-[#070403] p-1 flex items-center justify-center cursor-pointer group relative"
          >
            <img
              src={avatarSrc}
              alt="Brasão do Personagem"
              className="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-300 rounded-xl"
              referrerPolicy="no-referrer"
            />
            {/* Subtle double-click hint badge */}
            <div className="absolute bottom-1.5 inset-x-2 py-0.5 px-1.5 rounded bg-black/80 backdrop-blur-xs border border-amber-500/40 opacity-0 group-hover:opacity-100 transition-opacity text-[9px] font-mono text-amber-300 text-center pointer-events-none">
              Duplo clique ou botão para substituir PNG
            </div>
          </div>

          {/* Direct PNG Replacement Button */}
          <div className="mt-2.5 flex items-center gap-2">
            <label className="cursor-pointer flex items-center gap-1.5 px-3 py-1 bg-amber-950/70 hover:bg-amber-900 border border-amber-500/50 hover:border-amber-400 rounded-xl text-amber-200 text-xs font-serif shadow transition-all active:scale-95">
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                  <span>Substituindo...</span>
                </>
              ) : uploadSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">PNG Substituído!</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  <span>Substituir Imagem PNG</span>
                </>
              )}
              <input
                type="file"
                accept="image/png, image/webp, image/*"
                className="hidden"
                disabled={isUploading}
                onChange={handleDirectPngUpload}
              />
            </label>
          </div>

          <h2 className="mt-2 text-lg font-serif font-black text-amber-100 tracking-widest text-center uppercase">
            {activeChar.title || 'INVESTIGADOR'}
          </h2>

          <div className="flex items-center gap-2 mt-1">
            <span
              className="text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold border"
              style={{
                backgroundColor: `${activeChar.roleColor || '#d97706'}20`,
                borderColor: `${activeChar.roleColor || '#d97706'}60`,
                color: activeChar.roleColor || '#fbbf24',
              }}
            >
              {activeChar.roleTag || activeChar.category}
            </span>

            {isCharUnlocked(activeChar.id) ? (
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-700/50 px-2 py-0.5 rounded font-bold">
                DISPONÍVEL
              </span>
            ) : (
              <span className="text-[10px] font-mono text-amber-400 bg-amber-950/70 border border-amber-700/50 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                <Lock className="w-3 h-3" /> BLOQUEADO
              </span>
            )}
          </div>
        </div>

        {/* Lore / Bio */}
        <div className="p-3 rounded-xl bg-black/50 border border-amber-900/40 text-xs text-stone-300 font-serif leading-relaxed">
          <p>{activeChar.bio || activeChar.lore}</p>
        </div>

        {/* Special Ability Card */}
        {activeAbility && (
          <div className="p-3 rounded-xl bg-gradient-to-r from-[#24120c] to-black border border-amber-500/40 space-y-1">
            <div className="flex items-center gap-1.5 text-amber-300 text-xs font-serif font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Habilidade: {activeAbility.name}
            </div>
            <p className="text-[11px] text-stone-300 font-sans leading-tight">
              {activeAbility.effect}
            </p>
          </div>
        )}

        {/* Modal Actions */}
        <div className="pt-2 flex flex-col gap-2">
          {isCharUnlocked(activeChar.id) ? (
            <button
              id="confirm-char-choice-btn"
              onClick={() => {
                handleConfirmSelect(activeChar);
                onClose();
              }}
              className={`w-full py-3 rounded-xl font-serif font-bold text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 border shadow-lg ${
                activeChar.id === selectedCharId
                  ? 'bg-emerald-900/80 text-emerald-200 border-emerald-500/60'
                  : 'bg-gradient-to-r from-red-900 via-red-800 to-red-900 hover:brightness-110 text-amber-100 border-red-600 shadow-black'
              }`}
            >
              {activeChar.id === selectedCharId ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  PERSONAGEM ATUAL
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4 text-amber-300" />
                  ESCOLHER PERSONAGEM
                </>
              )}
            </button>
          ) : (
            <button
              id="unlock-char-btn"
              onClick={() => unlockCharacter(activeChar.id)}
              className="w-full py-3 rounded-xl font-serif font-bold text-xs uppercase tracking-[0.2em] bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 hover:brightness-110 text-black border border-amber-400 shadow-lg flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" />
              DESBLOQUEAR PERSONAGEM
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl text-xs font-serif text-stone-400 hover:text-stone-200 transition-colors text-center"
          >
            Voltar à Seleção
          </button>
        </div>
      </div>
    </div>
  );
};
