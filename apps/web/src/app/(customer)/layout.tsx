import type { Metadata } from 'next';

/**
 * Pages for a signed-in customer (the account and the booking request): personal, so kept out of search results.
 * Each page or layout checks the sign-in itself, since only it knows where to come back to afterwards.
 */
export const metadata: Metadata = { robots: { index: false } };

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
