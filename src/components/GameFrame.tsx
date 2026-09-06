import React from 'react';
import { GameFrameDefinition } from '../utils/gameFrames';

export interface GameFrameProps {
  children: React.ReactNode;
  variant?: 'screen' | 'modal' | 'panel' | 'card';
  className?: string;
  contentClassName?: string;
  frameOverride?: GameFrameDefinition | null;
  frameIdOverride?: string;
  padding?: string;
  showGlow?: boolean;
  id?: string;
}

/**
 * Clean wrapper component without intrusive frames.
 */
export const GameFrame: React.FC<GameFrameProps> = ({
  children,
  variant = 'screen',
  className = '',
  contentClassName = '',
  padding,
  id,
}) => {
  const defaultPadding =
    padding !== undefined
      ? padding
      : variant === 'screen'
      ? 'p-2 sm:p-4'
      : variant === 'modal'
      ? 'p-4 sm:p-6'
      : variant === 'card'
      ? 'p-2 sm:p-3'
      : 'p-3 sm:p-4';

  return (
    <div
      id={id || `game-frame-${variant}`}
      className={`relative flex flex-col w-full h-full ${className}`}
    >
      <div className={`relative z-10 w-full h-full flex flex-col ${defaultPadding} ${contentClassName}`}>
        {children}
      </div>
    </div>
  );
};
