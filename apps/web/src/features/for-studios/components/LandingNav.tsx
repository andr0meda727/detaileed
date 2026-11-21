'use client';

import { useSyncExternalStore } from 'react';
import Link from 'next/link';
import { DASHBOARD_URL } from '@/shared/lib/site';
import { LandingLogo } from './LandingLogo';

const subscribe = (onChange: () => void) => {
  window.addEventListener('scroll', onChange, { passive: true });
  return () => window.removeEventListener('scroll', onChange);
};

/** Fixed top bar: transparent over the dark hero, solid once the page scrolls. */
export function LandingNav() {
  const scrolled = useSyncExternalStore(
    subscribe,
    () => window.scrollY > 40,
    () => false,
  );

  return (
    <nav className={`landing-nav ${scrolled ? 'scrolled' : ''}`} id="navbar" aria-label="Główna">
      <Link href="/for-studios" className="nav-logo">
        <LandingLogo />
      </Link>
      <div className="nav-links">
        <a href="#demo">Demo</a>
        <a href="#features">Funkcje</a>
        <a href="#how">Jak to działa</a>
        <a href="#pricing">Cennik</a>
        <a href={DASHBOARD_URL} className="nav-cta">
          Zacznij za darmo
        </a>
      </div>
    </nav>
  );
}
