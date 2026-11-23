import type { Metadata } from 'next';

/** Sign-in, sign-up and password pages are personal: kept out of search results. */
export const metadata: Metadata = { robots: { index: false } };

/** The narrow column every sign-in and password page sits in. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <section className="mx-auto w-full max-w-md px-4 py-10 sm:py-16">{children}</section>;
}
