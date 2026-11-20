import type { Metadata } from 'next';
import AuthCard from '@/features/auth/components/AuthCard';
import ForgotPasswordForm from '@/features/auth/components/ForgotPasswordForm';

export const metadata: Metadata = { title: 'Nie pamiętam hasła', robots: { index: false } };

export default function ForgotPasswordPage() {
  return (
    <AuthCard title="Nie pamiętasz hasła?" subtitle="Podaj e-mail konta, a wyślemy link do ustawienia nowego hasła.">
      <ForgotPasswordForm />
    </AuthCard>
  );
}
