/**
 * Degree Link - Course Equivalency and Transfer Planning System
 * Copyright (c) 2025 University of New Orleans - Computer Science Department
 * Author: Mitchell Mennelle
 * 
 * This file is part of Degree Link.
 * Licensed under the MIT License. See LICENSE file in the project root.
 */

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
  const startYRef = useRef(0);
  const hasMovedRef = useRef(false);
  const isHorizontalSwipeRef = useRef(false);

  const go = useCallback((dir) => {
    setViewIndex(idx => dir === 'next' ? (idx + 1) % slideCount : (idx - 1 + slideCount) % slideCount);
  }, [setViewIndex, slideCount]);

  const onPointerDown = useCallback((e) => {
    // Don't interfere with interactive elements
    const target = e.target;
    if (target.closest('[role="button"]') || target.closest('button') || target.closest('a')) {
      return;
    }
    
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    startXRef.current = x;
    startYRef.current = y;
    hasMovedRef.current = false;
    isHorizontalSwipeRef.current = false;
    setDragging(true);
  }, []);

  const onPointerMove = useCallback((e) => {
    if (!dragging) return;
    
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    const deltaX = x - startXRef.current;
    const deltaY = y - startYRef.current;
    
    // Determine if this is a horizontal or vertical swipe
    if (!hasMovedRef.current && (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5)) {
      isHorizontalSwipeRef.current = Math.abs(deltaX) > Math.abs(deltaY);
      hasMovedRef.current = true;
    }
    
    // Only prevent default and track movement if it's a horizontal swipe
    if (isHorizontalSwipeRef.current) {
      if (e.type === 'touchmove') {
        e.preventDefault();
      }
      setDragX(deltaX);
    }
  }, [dragging]);

  const endDrag = useCallback(() => {
    if (!dragging) return;
    
    // Only change slides if this was a horizontal swipe
    if (isHorizontalSwipeRef.current) {
      const delta = dragX;
      const threshold = 50; // px
      if (Math.abs(delta) > threshold) {
        if (delta > 0) go('prev'); else go('next');
      }
    }
    
    setDragging(false);
    setDragX(0);
    hasMovedRef.current = false;
    isHorizontalSwipeRef.current = false;
  }, [dragging, dragX, go]);

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    // Use passive listeners initially - preventDefault only called conditionally in handlers
    el.addEventListener('touchstart', onPointerDown, { passive: true });
    el.addEventListener('touchmove', onPointerMove, { passive: false }); // Non-passive for conditional preventDefault
    el.addEventListener('touchend', endDrag, { passive: true });
    el.addEventListener('touchcancel', endDrag, { passive: true });
    // Keep pointer events for desktop
    el.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
    return () => {
      el.removeEventListener('touchstart', onPointerDown);
      el.removeEventListener('touchmove', onPointerMove);
      el.removeEventListener('touchend', endDrag);
      el.removeEventListener('touchcancel', endDrag);
      el.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', endDrag);
      window.removeEventListener('pointercancel', endDrag);
    };
  }, [onPointerDown, onPointerMove, endDrag]);

  const trackStyle = {
    transform: `translateX(calc(${-viewIndex * 100}% + ${dragging ? dragX : 0}px))`,
    transition: dragging ? 'none' : 'transform 300ms ease'
  };

  return { frameRef, trackStyle, dragging, dragX, go };
}
