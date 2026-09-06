import React, { useRef, useCallback } from 'react';

export function useDragScroll<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const hasMoved = useRef(false);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    isDragging.current = true;
    hasMoved.current = false;
    startX.current = e.pageX - ref.current.offsetLeft;
    scrollLeft.current = ref.current.scrollLeft;
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current || !ref.current) return;
    const x = e.pageX - ref.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    if (Math.abs(walk) > 4) {
      hasMoved.current = true;
    }
    ref.current.scrollLeft = scrollLeft.current - walk;
  }, []);

  const onMouseUpOrLeave = useCallback(() => {
    isDragging.current = false;
  }, []);

  return {
    ref,
    dragHandlers: {
      onMouseDown,
      onMouseMove,
      onMouseUp: onMouseUpOrLeave,
      onMouseLeave: onMouseUpOrLeave,
    },
    hasMoved,
  };
}
