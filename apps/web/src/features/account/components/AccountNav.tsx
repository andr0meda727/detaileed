'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@detaileed/ui';

const TABS = [
  { href: '/account', label: 'Dane kontaktowe' },
  { href: '/account/cars', label: 'Moje auta' },
  { href: '/account/bookings', label: 'Moje rezerwacje' },
  { href: '/account/reviews', label: 'Opinie' },
  { href: '/account/security', label: 'Hasło' },
];

/** Tabs of the customer account: one page per tab, so the tab follows the URL and the page renders the content. */
export function AccountNav() {
  const pathname = usePathname();
  return (
    <Tabs value={pathname}>
      <TabsList aria-label="Konto">
        {TABS.map((tab) => (
          <TabsTrigger key={tab.href} value={tab.href} asChild>
            <Link href={tab.href} aria-current={pathname === tab.href ? 'page' : undefined}>
              {tab.label}
            </Link>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
