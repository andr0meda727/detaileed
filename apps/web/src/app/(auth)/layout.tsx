import type { Metadata } from 'next';

/** Sign-in, sign-up and password pages are personal: kept out of search results. */
export const metadata: Metadata = { robots: { index: false } };

/** The narrow column every sign-in and password page sits in. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <section className="max-w-md mx-auto px-4 py-12 sm:py-16">{children}</section>;
}
