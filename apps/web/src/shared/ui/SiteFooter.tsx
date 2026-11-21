import Link from 'next/link';
import { DASHBOARD_URL } from '@/shared/lib/site';

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-green-deep/5 bg-white/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row gap-4 justify-between text-sm text-green-light">
        <p>© {new Date().getFullYear()} Detaileed: studia detailingu w Twojej okolicy.</p>
        <nav className="flex gap-4">
          <Link href="/" className="hover:text-green-deep">
            Szukaj studia
          </Link>
          <Link href="/for-studios" className="hover:text-green-deep">
            Dla studiów
          </Link>
          <a href={DASHBOARD_URL} className="hover:text-green-deep">
            Panel dla studiów
          </a>
        </nav>
      </div>
    </footer>
  );
}
