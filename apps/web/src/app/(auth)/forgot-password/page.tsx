import type { Metadata } from 'next';
import { AuthCard, ForgotPasswordForm } from '@/features/auth';

export const metadata: Metadata = { title: 'Nie pamiętam hasła' };

export default function ForgotPasswordPage() {
  return (
    <AuthCard title="Nie pamiętasz hasła?" subtitle="Podaj e-mail konta, a wyślemy link do ustawienia nowego hasła.">
      <ForgotPasswordForm />
    </AuthCard>
  );
}
