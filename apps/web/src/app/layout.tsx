import type { Metadata } from 'next';
import { DM_Sans, DM_Serif_Display, Syne } from 'next/font/google';
import { SiteHeader } from '@/shared/ui/SiteHeader';
import { SiteFooter } from '@/shared/ui/SiteFooter';
import { SITE_URL } from '@/shared/lib/site';
import { Providers } from './providers';
import { AccountMenu } from '@/features/auth';
import './globals.css';

const dmSans = DM_Sans({ subsets: ['latin', 'latin-ext'], variable: '--font-dm-sans', display: 'swap' });
const dmSerif = DM_Serif_Display({
  subsets: ['latin', 'latin-ext'],
  weight: '400',
  variable: '--font-dm-serif',
  display: 'swap',
});
const syne = Syne({ subsets: ['latin', 'latin-ext'], variable: '--font-syne', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'Detaileed: studia detailingu w Twojej okolicy', template: '%s · Detaileed' },
  description:
    'Znajdź studio detailingu na mapie, porównaj ceny dla swojego auta, przeczytaj opinie i wyślij zapytanie o termin.',
  openGraph: { siteName: 'Detaileed', locale: 'pl_PL', type: 'website' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" className={`${dmSans.variable} ${dmSerif.variable} ${syne.variable}`}>
      <body className="min-h-screen flex flex-col bg-cream text-green-deep antialiased">
        <Providers>
          <SiteHeader accountSlot={<AccountMenu />} />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
