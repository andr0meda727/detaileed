import type { Metadata } from 'next';
import AuthCard from '@/features/auth/components/AuthCard';
import SignUpForm from '@/features/auth/components/SignUpForm';
import { safeReturnPath } from '@/features/auth/model/returnPath';

export const metadata: Metadata = { title: 'Załóż konto' };

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <AuthCard title="Załóż konto" subtitle="Zapisz swoje auta, wysyłaj zapytania o termin i oceniaj wizyty.">
      <SignUpForm next={safeReturnPath(next)} />
    </AuthCard>
  );
}
