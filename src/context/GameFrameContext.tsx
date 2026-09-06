import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  GAME_FRAMES,
  DEFAULT_FRAME_ID,
  GameFrameDefinition,
  getSavedGameFrameId,
  saveGameFrameId,
  CUSTOM_FRAMES_STORAGE_KEY,
} from '../utils/gameFrames';

interface GameFrameContextType {
  activeFrameId: string;
  activeFrame: GameFrameDefinition;
  setFrame: (frameId: string) => void;
  setActiveFrameId: (frameId: string) => void;
  availableFrames: GameFrameDefinition[];
  allFrames: GameFrameDefinition[];
  uploadCustomFrame: (file: File, name: string) => Promise<GameFrameDefinition | null>;
  isFrameVisible: boolean;
  setIsFrameVisible: (visible: boolean) => void;
  isGlowEnabled: boolean;
  setIsGlowEnabled: (enabled: boolean) => void;
}

const GameFrameContext = createContext<GameFrameContextType | null>(null);

export const GameFrameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeFrameId, setActiveFrameId] = useState<string>(() => getSavedGameFrameId());
  const [customFrames, setCustomFrames] = useState<Record<string, GameFrameDefinition>>({});
  const [isFrameVisible, setIsFrameVisible] = useState<boolean>(true);

  // Load custom frames from localStorage and server
  const loadCustomFrames = useCallback(async () => {
    try {
      const savedCustom = localStorage.getItem(CUSTOM_FRAMES_STORAGE_KEY);
      if (savedCustom) {
        setCustomFrames(JSON.parse(savedCustom));
      }
    } catch (e) {
      console.warn('Failed to parse custom frames from local storage', e);
    }

    // Try fetching from server
    try {
      const res = await fetch('/api/frames/list');
      if (res.ok) {
        const data = await res.json();
        if (data.frames) {
          const serverFrames: Record<string, GameFrameDefinition> = {};
          for (const [id, url] of Object.entries(data.frames as Record<string, string>)) {
            // Check if not built-in or if custom override
            if (!GAME_FRAMES[id]) {
              serverFrames[`custom_${id}`] = {
                id: `custom_${id}`,
                name: `Personalizada (${id})`,
                shortName: id,
                src: url,
                thumbnail: url,
                description: 'Moldura personalizada enviada para o jogo.',
                gemColor: '#d4af37',
                accentColor: '#d4af37',
                borderColor: '#d4af37',
                glowColor: 'rgba(212, 175, 55, 0.4)',
                themeStyle: 'dark-gold',
              };
            }
          }
          if (Object.keys(serverFrames).length > 0) {
            setCustomFrames((prev) => ({ ...prev, ...serverFrames }));
          }
        }
      }
    } catch (e) {
      // Offline/local only is fine
    }
  }, []);

  useEffect(() => {
    loadCustomFrames();
  }, [loadCustomFrames]);

  const setFrame = (frameId: string) => {
    setActiveFrameId(frameId);
    saveGameFrameId(frameId);
  };

  const uploadCustomFrame = async (file: File, name: string): Promise<GameFrameDefinition | null> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target?.result as string;
        const cleanId = name.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'custom_frame';

        try {
          // Upload to server
          const res = await fetch('/api/frames/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              frameId: cleanId,
              base64Data,
              fileName: file.name,
            }),
          });

          let frameUrl = base64Data;
          if (res.ok) {
            const data = await res.json();
            if (data.url) frameUrl = data.url;
          }

          const newFrame: GameFrameDefinition = {
            id: `custom_${cleanId}`,
            name: `Personalizada: ${name}`,
            shortName: name,
            src: frameUrl,
            thumbnail: frameUrl,
            description: 'Moldura personalizada carregada pelo jogador.',
            gemColor: '#d4af37',
            accentColor: '#d4af37',
            borderColor: '#d4af37',
            glowColor: 'rgba(212, 175, 55, 0.4)',
            themeStyle: 'dark-gold',
          };

          setCustomFrames((prev) => {
            const updated = { ...prev, [newFrame.id]: newFrame };
            localStorage.setItem(CUSTOM_FRAMES_STORAGE_KEY, JSON.stringify(updated));
            return updated;
          });

          setFrame(newFrame.id);
          resolve(newFrame);
        } catch (err) {
          console.error('Failed to upload custom frame:', err);
          resolve(null);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const allFramesMap = { ...GAME_FRAMES, ...customFrames };
  const activeFrame: GameFrameDefinition = allFramesMap[activeFrameId] || GAME_FRAMES[DEFAULT_FRAME_ID];
  const availableFrames = Object.values(allFramesMap);

  return (
    <GameFrameContext.Provider
      value={{
        activeFrameId,
        activeFrame,
        setFrame,
        setActiveFrameId: setFrame,
        availableFrames,
        allFrames: availableFrames,
        uploadCustomFrame,
        isFrameVisible,
        setIsFrameVisible,
        isGlowEnabled: isFrameVisible,
        setIsGlowEnabled: setIsFrameVisible,
      }}
    >
      {children}
    </GameFrameContext.Provider>
  );
};

export const useGameFrame = () => {
  const ctx = useContext(GameFrameContext);
  if (!ctx) {
    throw new Error('useGameFrame must be used within a GameFrameProvider');
  }
  return ctx;
};
