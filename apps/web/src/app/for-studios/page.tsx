import type { Metadata } from 'next';
import { ForStudiosPage } from '@/features/for-studios';

const title = 'Detaileed: program do zarządzania studiem detailingu';
const description =
  'Rezerwacje, baza klientów, magazyn, zespół i raporty w jednym miejscu. Wypróbuj interaktywne demo i zacznij za darmo.';

// Outside the (site) group: this page has its own nav and footer instead of the customer site's.
export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: '/for-studios' },
  openGraph: { title, description, url: '/for-studios' },
};

export default function Page() {
  return <ForStudiosPage />;
}
