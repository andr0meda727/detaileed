import type { Metadata } from 'next';
import { AuthCard, SignUpForm, safeReturnPath } from '@/features/auth';

export const metadata: Metadata = { title: 'Załóż konto' };

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <AuthCard title="Załóż konto" subtitle="Zapisz swoje auta, wysyłaj zapytania o termin i oceniaj wizyty.">
      <SignUpForm next={safeReturnPath(next)} />
    </AuthCard>
  );
}
