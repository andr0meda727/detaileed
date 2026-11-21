import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AuthCard, ResendConfirmation, safeReturnPath } from '@/features/auth';

export const metadata: Metadata = { title: 'Potwierdź e-mail' };

/** For a customer who signed up but can't sign in yet: the address isn't confirmed. */
export default async function ConfirmEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; next?: string }>;
}) {
  const { email, next } = await searchParams;
  if (!email) redirect('/sign-in');
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
