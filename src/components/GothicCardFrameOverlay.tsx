import React from 'react';

export interface GothicCardFrameOverlayProps {
  frameId?: string;
  borderColor?: string;
  className?: string;
  showGems?: boolean;
}

/**
 * The frame system has been removed as per user request.
 * Returns null to keep cards clean and uncluttered.
 */
export const GothicCardFrameOverlay: React.FC<GothicCardFrameOverlayProps> = () => {
  return null;
};
