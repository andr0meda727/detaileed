import type { Metadata } from 'next';
import AuthCard from '@/features/auth/components/AuthCard';
import SignInForm from '@/features/auth/components/SignInForm';
import { safeReturnPath } from '@/features/auth/model/returnPath';

export const metadata: Metadata = { title: 'Logowanie', robots: { index: false } };

const NOTICES: Record<string, string> = {
  link: 'Link wygasł albo został już użyty. Zaloguj się lub załóż konto ponownie.',
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
