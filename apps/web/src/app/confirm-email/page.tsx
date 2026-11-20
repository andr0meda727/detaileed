import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import AuthCard from '@/features/auth/components/AuthCard';
import ResendConfirmation from '@/features/auth/components/ResendConfirmation';
import { safeReturnPath } from '@/features/auth/model/returnPath';

export const metadata: Metadata = { title: 'Potwierdź e-mail', robots: { index: false } };

/** For a customer who signed up but can't sign in yet: the address isn't confirmed. */
export default async function ConfirmEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; next?: string }>;
}) {
  const { email, next } = await searchParams;
  if (!email) redirect('/logowanie');
  return (
    <AuthCard title="Potwierdź e-mail" subtitle="Twoje konto czeka na potwierdzenie adresu.">
      <p className="text-sm text-green-light">
        Adres <strong>{email}</strong> nie jest jeszcze potwierdzony. Kliknij link z e-maila, który wysłaliśmy po
        rejestracji, aby dokończyć zakładanie konta.
      </p>
      <ResendConfirmation email={email} next={safeReturnPath(next)} />
    </AuthCard>
  );
}
