import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSignedInUser } from '@/shared/lib/supabase/server';
import { signInPath } from '@/features/auth';
import { AccountNav } from '@/features/account';

export const metadata: Metadata = { title: 'Moje konto' };

/** The customer account; signed-in only. */
export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await getSignedInUser();
  if (!user) redirect(signInPath('/account'));
  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
      <div>
        <h1 className="font-serif text-4xl tracking-tight">Moje konto</h1>
        <p className="text-green-light mt-1">{user.email}</p>
      </div>
      <AccountNav />
      {children}
    </section>
  );
}
