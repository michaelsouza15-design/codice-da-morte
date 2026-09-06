import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface GameZoomContextType {
  zoom: number;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  setZoom: (level: number) => void;
  isZoomActive: boolean;
}

const GameZoomContext = createContext<GameZoomContextType>({
  zoom: 1,
  zoomIn: () => {},
  zoomOut: () => {},
  resetZoom: () => {},
  setZoom: () => {},
  isZoomActive: false,
});

const STORAGE_KEY = 'codice_game_zoom_level';

export const GameZoomProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [zoom, setZoomState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const val = parseFloat(saved);
        if (!isNaN(val) && val >= 0.65 && val <= 2.2) {
          return val;
        }
      }
    } catch (e) {
      // fallback
    }
    return 1;
  });

  const setZoom = useCallback((level: number) => {
    const clamped = Math.min(2.2, Math.max(0.65, +level.toFixed(2)));
    setZoomState(clamped);
    try {
      localStorage.setItem(STORAGE_KEY, clamped.toString());
    } catch (e) {
      // ignore
    }
  }, []);

  const zoomIn = useCallback(() => {
    setZoom(+(zoom + 0.12).toFixed(2));
  }, [zoom, setZoom]);

  const zoomOut = useCallback(() => {
    setZoom(+(zoom - 0.12).toFixed(2));
  }, [zoom, setZoom]);

  const resetZoom = useCallback(() => {
    setZoom(1);
  }, [setZoom]);

  // Global Wheel and Keyboard Listener for Seamless Accessibility
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) {
        e.preventDefault();
        if (e.deltaY < 0) {
          setZoom(+(zoom + 0.08).toFixed(2));
        } else {
          setZoom(+(zoom - 0.08).toFixed(2));
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=')) {
        e.preventDefault();
        zoomIn();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === '-' || e.key === '_')) {
        e.preventDefault();
        zoomOut();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === '0')) {
        e.preventDefault();
        resetZoom();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [zoom, zoomIn, zoomOut, resetZoom, setZoom]);

  return (
    <GameZoomContext.Provider
      value={{
        zoom,
        zoomIn,
        zoomOut,
        resetZoom,
        setZoom,
        isZoomActive: zoom !== 1,
      }}
    >
      {children}
    </GameZoomContext.Provider>
  );
};

export const useGameZoom = () => useContext(GameZoomContext);

export const GameZoomContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  const { zoom } = useGameZoom();
  return (
    <div
      className={`transition-transform duration-200 origin-center ${className}`}
      style={{ transform: `scale(${zoom})` }}
    >
      {children}
    </div>
  );
};
