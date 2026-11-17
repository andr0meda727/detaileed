'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MailCheck, UserPlus } from 'lucide-react';
import { Button, FormInput, Turnstile, useTurnstile } from '@detaileed/ui';
import { getSupabase } from '@/lib/supabase/client';
import { TURNSTILE_SITE_KEY } from '@/lib/site';
import { signUpSchema, type SignUpValues } from '@/features/auth/model/schemas';
import { authErrorMessage } from '@/features/auth/model/authErrors';
import { confirmEmailRedirect } from '@/features/auth/model/returnPath';
import ResendConfirmation from '@/features/auth/components/ResendConfirmation';

/**
 * Customer sign-up. First and last name go into the account's metadata, from which the backend fills the profile.
 * With email confirmation on, the link brings the person back through /auth/callback to `next`.
 */
export default function SignUpForm({ next }: { next: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const captcha = useTurnstile(TURNSTILE_SITE_KEY, 'sign_up');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { firstName: '', lastName: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (values: SignUpValues) => {
    setError(null);
    const { data, error: authError } = await getSupabase().auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: { first_name: values.firstName, last_name: values.lastName },
        emailRedirectTo: confirmEmailRedirect(next),
        captchaToken: captcha.token,
      },
    });
    captcha.reset();
    if (authError) {
      setError(authErrorMessage(authError));
      return;
    }
    if (data.session) {
      router.replace(next);
      router.refresh();
    } else {
      setSentTo(values.email);
    }
  };

  if (sentTo) {
    return (
      <div className="text-center space-y-3">
        <MailCheck size={40} className="mx-auto text-green-light" />
        <p className="font-bold">Sprawdź skrzynkę</p>
        <p className="text-sm text-green-light">
          Wysłaliśmy link potwierdzający na <strong>{sentTo}</strong>. Kliknij go, aby dokończyć zakładanie konta.
        </p>
        <ResendConfirmation email={sentTo} next={next} justSent />
      </div>
    );
  }

  return (
    <form className="space-y-2" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="grid grid-cols-2 gap-3">
        <FormInput
          label="Imię"
          autoComplete="given-name"
          error={errors.firstName?.message}
          {...register('firstName')}
        />
        <FormInput
          label="Nazwisko"
          autoComplete="family-name"
          error={errors.lastName?.message}
          {...register('lastName')}
        />
      </div>
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
        autoComplete="new-password"
        error={errors.password?.message}
        {...register('password')}
      />
      <FormInput
        label="Powtórz hasło"
        type="password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
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
      <Button size="lg" fullWidth type="submit" icon={UserPlus} loading={isSubmitting} disabled={!captcha.ready}>
        Załóż konto
      </Button>
      <p className="pt-4 text-sm text-center text-green-light">
        Masz już konto?{' '}
        <Link href={`/logowanie?next=${encodeURIComponent(next)}`} className="font-bold text-green-deep underline">
          Zaloguj się
        </Link>
      </p>
    </form>
  );
}
