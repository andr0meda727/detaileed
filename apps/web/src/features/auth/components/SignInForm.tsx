'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LogIn } from 'lucide-react';
import { Button, FormInput, Turnstile, useTurnstile } from '@detaileed/ui';
import { getSupabase } from '@/lib/supabase/client';
import { TURNSTILE_SITE_KEY } from '@/lib/site';
import { signInSchema, type SignInValues } from '@/features/auth/model/schemas';
import { authErrorMessage } from '@/features/auth/model/authErrors';

/** Email + password sign-in; goes back to `next` afterwards. */
export default function SignInForm({ next, notice }: { next: string; notice?: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const captcha = useTurnstile(TURNSTILE_SITE_KEY, 'sign_in');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({ resolver: zodResolver(signInSchema), defaultValues: { email: '', password: '' } });

  const onSubmit = async (values: SignInValues) => {
    setError(null);
    const { error: authError } = await getSupabase().auth.signInWithPassword({
      ...values,
      options: { captchaToken: captcha.token },
    });
    captcha.reset();
    if (authError) {
      setError(authErrorMessage(authError));
      return;
    }
    router.replace(next);
    router.refresh();
  };

  return (
    <form className="space-y-2" onSubmit={handleSubmit(onSubmit)} noValidate>
      {notice && <p className="mb-4 text-sm bg-amber/10 text-green-deep rounded-xl p-3">{notice}</p>}
      <FormInput
        label="E-mail"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />
      <FormInput
        label="Hasło"
        type="password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register('password')}
      />
      {captcha.widgetProps && <Turnstile {...captcha.widgetProps} className="flex justify-center" />}
      {captcha.failed && (
        <p role="alert" className="text-sm text-red-600 bg-red-50 rounded-xl p-3">
          Nie udało się załadować weryfikacji. Odśwież stronę albo wyłącz blokowanie skryptów.
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-red-600 bg-red-50 rounded-xl p-3">
          {error}
        </p>
      )}
      <Button size="lg" fullWidth type="submit" icon={LogIn} loading={isSubmitting} disabled={!captcha.ready}>
        Zaloguj się
      </Button>
      <p className="pt-4 text-sm text-center text-green-light">
        Nie masz konta?{' '}
        <Link href={`/rejestracja?next=${encodeURIComponent(next)}`} className="font-bold text-green-deep underline">
          Załóż je
        </Link>
      </p>
    </form>
  );
}
