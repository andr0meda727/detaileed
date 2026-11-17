import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSignedInUser } from '@/lib/supabase/server';
import AuthCard from '@/features/auth/components/AuthCard';
import NewPasswordForm from '@/features/auth/components/NewPasswordForm';

export const metadata: Metadata = { title: 'Nowe hasło', robots: { index: false } };

/** Where a reset link lands after /auth/callback signed the customer in; without a session the link didn't work. */
export default async function NewPasswordPage() {
  const user = await getSignedInUser();
  if (!user) redirect('/logowanie?blad=link');
  return (
    <AuthCard title="Ustaw nowe hasło" subtitle={`Dla konta ${user.email}.`}>
      <NewPasswordForm />
    </AuthCard>
  );
}
