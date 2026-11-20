'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/account', label: 'Dane kontaktowe' },
  { href: '/account/cars', label: 'Moje auta' },
  { href: '/account/bookings', label: 'Moje rezerwacje' },
  { href: '/account/reviews', label: 'Opinie' },
  { href: '/account/security', label: 'Hasło' },
];

/** Tabs of the customer account. */
export default function AccountNav() {
  const pathname = usePathname();
  return (
    <nav
      className="flex gap-1 bg-white border border-green-deep/5 rounded-2xl p-1.5 overflow-x-auto"
      aria-label="Konto"
    >
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? 'page' : undefined}
            className={`px-4 py-2.5 rounded-xl text-[11px] font-semibold uppercase tracking-widest whitespace-nowrap ${active ? 'bg-green-deep text-cream-warm' : 'text-green-light hover:text-green-deep hover:bg-cream/50'}`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
