import type { ReactNode } from 'react';

/** The frame of the sign-in and sign-up pages. */
export default function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section className="max-w-md mx-auto px-4 py-12 sm:py-16">
      <h1 className="font-serif text-4xl tracking-tight">{title}</h1>
      <p className="mt-2 text-green-light">{subtitle}</p>
      <div className="mt-8 floating-card-static p-6 sm:p-8">{children}</div>
    </section>
  );
}
