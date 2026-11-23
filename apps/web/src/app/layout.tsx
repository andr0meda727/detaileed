import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { themeInitScript } from '@detaileed/ui';
import { SITE_URL } from '@/shared/lib/site';
import { Providers } from './providers';
import './globals.css';

const geistSans = Geist({ subsets: ['latin', 'latin-ext'], variable: '--font-geist-sans', display: 'swap' });
const geistMono = Geist_Mono({ subsets: ['latin', 'latin-ext'], variable: '--font-geist-mono', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'Detaileed: studia detailingu w Twojej okolicy', template: '%s · Detaileed' },
  description:
    'Znajdź studio detailingu na mapie, porównaj ceny dla swojego auta, przeczytaj opinie i wyślij zapytanie o termin.',
  openGraph: { siteName: 'Detaileed', locale: 'pl_PL', type: 'website' },
  icons: { icon: { url: '/icon.svg', type: 'image/svg+xml' } },
};

/**
 * Fonts, metadata, the theme and providers. The header and footer come from the `(site)` layout; /for-studios has
 * its own. The theme script sets data-theme and color-scheme on <html> before the first paint, so <html> differs
 * from the server HTML: hence suppressHydrationWarning (it covers only <html>'s own attributes).
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
