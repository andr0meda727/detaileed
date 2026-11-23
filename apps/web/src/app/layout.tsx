import type { Metadata } from 'next';
import { DM_Sans, DM_Serif_Display, Geist, Geist_Mono, Syne } from 'next/font/google';
import { SITE_URL } from '@/shared/lib/site';
import { Providers } from './providers';
import './globals.css';

const geistSans = Geist({ subsets: ['latin', 'latin-ext'], variable: '--font-geist-sans', display: 'swap' });
const geistMono = Geist_Mono({ subsets: ['latin', 'latin-ext'], variable: '--font-geist-mono', display: 'swap' });

// Deprecated: the Forest & Cream fonts, until the remaining screens are migrated (phase 11, T13).
const dmSans = DM_Sans({ subsets: ['latin', 'latin-ext'], variable: '--font-dm-sans', display: 'swap' });
const dmSerif = DM_Serif_Display({
  subsets: ['latin', 'latin-ext'],
  weight: '400',
  variable: '--font-dm-serif',
  display: 'swap',
});
const syne = Syne({ subsets: ['latin', 'latin-ext'], variable: '--font-syne-family', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'Detaileed: studia detailingu w Twojej okolicy', template: '%s · Detaileed' },
  description:
    'Znajdź studio detailingu na mapie, porównaj ceny dla swojego auta, przeczytaj opinie i wyślij zapytanie o termin.',
  openGraph: { siteName: 'Detaileed', locale: 'pl_PL', type: 'website' },
};

/** Fonts, metadata and providers. The header and footer come from the `(site)` layout; /for-studios has its own. */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pl"
      className={`${geistSans.variable} ${geistMono.variable} ${dmSans.variable} ${dmSerif.variable} ${syne.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-cream text-green-deep antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
