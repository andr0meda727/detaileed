'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LogIn } from 'lucide-react';
import { Alert, Button, FormInput, useTurnstile } from '@detaileed/ui';
import { getSupabase } from '@/shared/lib/supabase/client';
import { textLink } from '@/shared/ui/textLink';
import { TURNSTILE_SITE_KEY } from '@/shared/lib/site';
import { signInSchema, type SignInValues } from '@/features/auth/model/schemas';
import { authErrorMessage, isEmailNotConfirmed } from '@/features/auth/model/authErrors';
import { confirmEmailPath } from '@/features/auth/model/returnPath';
import { CaptchaField } from '@/features/auth/components/CaptchaField';

/** Email + password sign-in; goes back to `next` afterwards. */
export function SignInForm({ next, notice }: { next: string; notice?: ReactNode }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  // The email of an account that can't sign in until it's confirmed: offer to send the link again
  const [unconfirmed, setUnconfirmed] = useState<string | null>(null);
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
      setUnconfirmed(isEmailNotConfirmed(authError) ? values.email : null);
      return;
    }
    router.replace(next);
    router.refresh();
  };

  return (
    <form className="space-y-3" onSubmit={handleSubmit(onSubmit)} noValidate>
      {notice && <Alert tone="warning">{notice}</Alert>}
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
      <p className="-mt-2 text-right text-sm">
        <Link href="/forgot-password" className={textLink}>
          Nie pamiętasz hasła?
        </Link>
      </p>
      <CaptchaField captcha={captcha} />
      {error && (
        <Alert tone="danger">
          {error}
          {unconfirmed && (
            <>
              {' '}
              <Link href={confirmEmailPath(unconfirmed, next)} className={textLink}>
                Wyślij link ponownie
              </Link>
            </>
          )}
        </Alert>
      )}
      <Button size="lg" fullWidth type="submit" icon={LogIn} loading={isSubmitting} disabled={!captcha.ready}>
        Zaloguj się
      </Button>
      <p className="pt-2 text-sm text-center text-muted-foreground">
        Nie masz konta?{' '}
        <Link href={`/sign-up?next=${encodeURIComponent(next)}`} className={textLink}>
          Załóż je
        </Link>
      </p>
    </form>
  );
}
