import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * useCarouselDrag enables horizontal swipe/drag gesture navigation.
 * @param {number} viewIndex current index
 * @param {function} setViewIndex setter
 * @param {number} slideCount total slides
 */
export function useCarouselDrag(viewIndex, setViewIndex, slideCount) {
  const frameRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const startXRef = useRef(0);
  const hasMovedRef = useRef(false);

  const go = useCallback((dir) => {
    setViewIndex(idx => dir === 'next' ? (idx + 1) % slideCount : (idx - 1 + slideCount) % slideCount);
  }, [setViewIndex, slideCount]);

  const onPointerDown = useCallback((e) => {
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    startXRef.current = x;
    hasMovedRef.current = false;
    setDragging(true);
  }, []);

  const onPointerMove = useCallback((e) => {
    if (!dragging) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const delta = x - startXRef.current;
    if (Math.abs(delta) > 3) hasMovedRef.current = true;
    setDragX(delta);
  }, [dragging]);

  const endDrag = useCallback(() => {
    if (!dragging) return;
    const delta = dragX;
    const threshold = 50; // px
    if (Math.abs(delta) > threshold) {
      if (delta > 0) go('prev'); else go('next');
    }
    setDragging(false);
    setDragX(0);
  }, [dragging, dragX, go]);

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    // Attach listeners (pointer + touch for broader support)
    el.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
    el.addEventListener('touchstart', onPointerDown, { passive: true });
    el.addEventListener('touchmove', onPointerMove, { passive: true });
    el.addEventListener('touchend', endDrag);
    el.addEventListener('touchcancel', endDrag);
    return () => {
      el.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', endDrag);
      window.removeEventListener('pointercancel', endDrag);
      el.removeEventListener('touchstart', onPointerDown);
      el.removeEventListener('touchmove', onPointerMove);
      el.removeEventListener('touchend', endDrag);
      el.removeEventListener('touchcancel', endDrag);
    };
  }, [onPointerDown, onPointerMove, endDrag]);

  const trackStyle = {
    transform: `translateX(calc(${-viewIndex * 100}% + ${dragging ? dragX : 0}px))`,
    transition: dragging ? 'none' : 'transform 300ms ease'
  };

  return { frameRef, trackStyle, dragging, dragX, go };
}
