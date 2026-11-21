import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSignedInUser } from '@/shared/lib/supabase/server';
import { AuthCard, NewPasswordForm } from '@/features/auth';

export const metadata: Metadata = { title: 'Nowe hasło' };

/** Where a reset link lands after /auth/callback signed the customer in; without a session the link didn't work. */
export default async function NewPasswordPage() {
  const user = await getSignedInUser();
  if (!user) redirect('/sign-in?error=link');
  return (
    <AuthCard title="Ustaw nowe hasło" subtitle={user.email ? `Dla konta ${user.email}.` : undefined}>
      <NewPasswordForm />
    </AuthCard>
  );
}
