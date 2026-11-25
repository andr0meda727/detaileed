'use client';

import { useEffect } from 'react';

/**
 * Fades `.reveal` sections in as they scroll into view. Until it runs they are hidden only by CSS that applies when
 * scripts are on and the visitor doesn't prefer reduced motion, so otherwise the content is simply visible.
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
