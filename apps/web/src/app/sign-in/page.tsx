import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import AuthCard from '@/features/auth/components/AuthCard';
import SignInForm from '@/features/auth/components/SignInForm';
import { safeReturnPath } from '@/features/auth/model/returnPath';
import { LINK_EXPIRED } from '@/features/auth/model/authErrors';

export const metadata: Metadata = { title: 'Logowanie', robots: { index: false } };

const NOTICES: Record<string, ReactNode> = {
  link: (
    <>
      {LINK_EXPIRED} Zaloguj się poniżej. Jeśli to był link do ustawienia hasła,{' '}
      <Link href="/forgot-password" className="font-bold underline">
        wyślij nowy
      </Link>
      .
    </>
  ),
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; blad?: string }>;
}) {
  const { next, blad } = await searchParams;
  return (
    <AuthCard title="Zaloguj się" subtitle="Aby wysyłać zapytania o termin i śledzić swoje rezerwacje.">
      <SignInForm next={safeReturnPath(next)} notice={blad ? NOTICES[blad] : undefined} />
    </AuthCard>
  );
}
