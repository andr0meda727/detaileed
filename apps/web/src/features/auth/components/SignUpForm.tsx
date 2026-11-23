'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus } from 'lucide-react';
import { Alert, Button, FormInput, useTurnstile } from '@detaileed/ui';
import { getSupabase } from '@/shared/lib/supabase/client';
import { textLink } from '@/shared/ui/textLink';
import { TURNSTILE_SITE_KEY } from '@/shared/lib/site';
import { signUpSchema, type SignUpValues } from '@/features/auth/model/schemas';
import { authErrorMessage } from '@/features/auth/model/authErrors';
import { confirmEmailRedirect } from '@/features/auth/model/returnPath';
import { ResendConfirmation } from '@/features/auth/components/ResendConfirmation';
import { CaptchaField } from '@/features/auth/components/CaptchaField';
import { MailSent } from '@/features/auth/components/MailSent';

/**
 * Customer sign-up. First and last name go into the account's metadata, from which the backend fills the profile.
 * With email confirmation on, the link brings the person back through /auth/callback to `next`.
 */
export function SignUpForm({ next }: { next: string }) {
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
      <MailSent>
        <p>
          Wysłaliśmy link potwierdzający na <strong className="font-medium text-foreground">{sentTo}</strong>. Kliknij
          go, aby dokończyć zakładanie konta.
        </p>
        <ResendConfirmation email={sentTo} next={next} justSent />
      </MailSent>
    );
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="grid grid-cols-1 gap-x-3 gap-y-3 min-[380px]:grid-cols-2">
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
      <CaptchaField captcha={captcha} />
      {error && <Alert tone="danger">{error}</Alert>}
      <Button size="lg" fullWidth type="submit" icon={UserPlus} loading={isSubmitting} disabled={!captcha.ready}>
        Załóż konto
      </Button>
      <p className="pt-2 text-sm text-center text-muted-foreground">
        Masz już konto?{' '}
        <Link href={`/sign-in?next=${encodeURIComponent(next)}`} className={textLink}>
          Zaloguj się
        </Link>
      </p>
    </form>
  );
}
