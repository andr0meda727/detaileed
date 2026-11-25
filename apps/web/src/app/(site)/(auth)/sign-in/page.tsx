import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { textLink } from '@/shared/ui/textLink';
import { AuthCard, SignInForm, safeReturnPath, LINK_EXPIRED } from '@/features/auth';

export const metadata: Metadata = { title: 'Logowanie' };

const NOTICES: Record<string, ReactNode> = {
  link: (
    <>
      {LINK_EXPIRED} Zaloguj się poniżej. Jeśli to był link do ustawienia hasła,{' '}
      <Link href="/forgot-password" className={textLink}>
        wyślij nowy
      </Link>
      .
    </>
  ),
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  return (
    <AuthCard title="Zaloguj się" subtitle="Aby wysyłać zapytania o termin i śledzić swoje rezerwacje.">
      <SignInForm next={safeReturnPath(next)} notice={error ? NOTICES[error] : undefined} />
    </AuthCard>
  );
}
