import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { PageHeader } from '@detaileed/ui';
import { getSignedInUser } from '@/shared/lib/supabase/server';
import { signInPath } from '@/features/auth';
import { AccountNav } from '@/features/account';

export const metadata: Metadata = { title: 'Moje konto' };

/** The customer account; signed-in only. */
export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await getSignedInUser();
  if (!user) redirect(signInPath('/account'));
  return (
    <section className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8 sm:px-6 sm:py-10">
      <PageHeader title="Moje konto" description={user.email} />
      <AccountNav />
      {children}
    </section>
  );
}
