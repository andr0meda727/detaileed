'use client';

import { useEffect, useRef } from 'react';

/** Elements that grow the cursor ring while hovered. */
const HOVER_TARGETS = 'a, button, .feat-card, .step, .price-card';

/** A dot and ring that follow the mouse (hidden on touch screens by CSS). */
export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const ring = ringRef.current;
    if (!cursor || !ring) return;
    const move = (e: MouseEvent) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
    };
    const over = (e: MouseEvent) => {
      ring.classList.toggle('hovering', e.target instanceof Element && e.target.closest(HOVER_TARGETS) !== null);
    };
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseover', over);
    return () => {
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseover', over);
    };
  }, []);

  return (
    <div className="custom-cursor" ref={cursorRef} aria-hidden>
      <div className="cursor-ring" ref={ringRef} />
      <div className="cursor-dot" />
    </div>
  );
}

/**
 * Fades `.reveal` sections in as they scroll into view. Until it runs they are hidden only by CSS that applies when
 * scripts are on, so without JavaScript (and for visitors who prefer reduced motion) the content is simply visible.
 */
export function ScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12 },
    );
    document.querySelectorAll('.landing .reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return null;
}
