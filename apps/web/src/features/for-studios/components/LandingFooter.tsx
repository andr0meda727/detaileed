import Link from 'next/link';
import { DASHBOARD_URL } from '@/shared/lib/site';
import { LandingLogo } from './LandingLogo';

export function LandingFooter() {
  return (
    <footer className="landing-footer">
      <div className="footer-top">
        <div className="footer-brand">
          <Link href="/for-studios" className="nav-logo" style={{ color: 'var(--color-cream)' }}>
            <LandingLogo />
          </Link>
          <p>Studio OS zaprojektowany specjalnie dla branży detailingu. Prosty, szybki, bezpieczny.</p>
        </div>
        <div className="footer-col">
          <h2>Produkt</h2>
          <a href="#features">Funkcje</a>
          <a href="#pricing">Cennik</a>
          <a href={DASHBOARD_URL}>Panel studia</a>
        </div>
        <div className="footer-col">
          <h2>Dla klientów</h2>
          <Link href="/">Szukaj studia na mapie</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Detaileed. Wszelkie prawa zastrzeżone.</p>
        <p>Zbudowane z ❤️ dla detailerów</p>
      </div>
    </footer>
  );
}
