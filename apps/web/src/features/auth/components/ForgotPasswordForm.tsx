'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MailCheck, Send } from 'lucide-react';
import { Button, FormInput, useTurnstile } from '@detaileed/ui';
import { getSupabase } from '@/lib/supabase/client';
import { siteUrl, TURNSTILE_SITE_KEY } from '@/lib/site';
import { forgotPasswordSchema, type ForgotPasswordValues } from '@/features/auth/model/schemas';
import { authErrorMessage } from '@/features/auth/model/authErrors';
import CaptchaField from '@/features/auth/components/CaptchaField';

/** Where the reset link leads: /auth/callback signs the person in, then the new-password page. */
export const RESET_REDIRECT = '/auth/callback?next=/reset-password';

/**
 * Asks Supabase to email a password reset link. The answer is the same whether or not the account exists, so the
 * form can't be used to find out who has one.
 */
export default function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const captcha = useTurnstile(TURNSTILE_SITE_KEY, 'password_reset');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({ resolver: zodResolver(forgotPasswordSchema), defaultValues: { email: '' } });

  const onSubmit = async ({ email }: ForgotPasswordValues) => {
    setError(null);
    const { error: authError } = await getSupabase().auth.resetPasswordForEmail(email, {
      redirectTo: siteUrl(RESET_REDIRECT),
      captchaToken: captcha.token,
    });
    captcha.reset();
    if (authError) {
      setError(authErrorMessage(authError));
      return;
    }
    setSentTo(email);
  };

  if (sentTo) {
    return (
      <div className="text-center space-y-3">
        <MailCheck size={40} className="mx-auto text-green-light" />
        <p className="font-bold">Sprawdź skrzynkę</p>
        <p className="text-sm text-green-light">
          Jeśli konto z adresem <strong>{sentTo}</strong> istnieje, wysłaliśmy na nie link do ustawienia nowego hasła.
          Otwórz go w tej samej przeglądarce.
        </p>
        <p className="pt-2 text-sm">
          <Link href="/sign-in" className="font-bold text-green-deep underline">
            Wróć do logowania
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form className="space-y-2" onSubmit={handleSubmit(onSubmit)} noValidate>
      <FormInput
        label="E-mail"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />
      <CaptchaField captcha={captcha} />
      {error && (
        <p role="alert" className="text-sm text-red-600 bg-red-50 rounded-xl p-3">
          {error}
        </p>
      )}
      <Button size="lg" fullWidth type="submit" icon={Send} loading={isSubmitting} disabled={!captcha.ready}>
        Wyślij link
      </Button>
      <p className="pt-4 text-sm text-center text-green-light">
        Pamiętasz hasło?{' '}
        <Link href="/sign-in" className="font-bold text-green-deep underline">
          Zaloguj się
        </Link>
      </p>
    </form>
  );
}
