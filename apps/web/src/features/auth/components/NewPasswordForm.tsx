'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound } from 'lucide-react';
import { Alert, Button, FormInput, useToast } from '@detaileed/ui';
import { textLink } from '@/shared/ui/textLink';
import { newPasswordSchema, type NewPasswordValues } from '@/features/auth/model/schemas';
import { authErrorMessage } from '@/features/auth/model/authErrors';
import { setPassword } from '@/features/auth/api/password';

/** The last step of a password reset: the link has signed the customer in, now they choose the new password. */
export function NewPasswordForm() {
  const router = useRouter();
  const { addToast } = useToast();
  const [error, setError] = useState<string | null>(null);
  // The session is too old to change the password without a code; the account's security page asks for one
  const [needsCode, setNeedsCode] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NewPasswordValues>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = async ({ password }: NewPasswordValues) => {
    setError(null);
    const authError = await setPassword(password);
    if (authError) {
      setError(authErrorMessage(authError));
      setNeedsCode(authError.code === 'reauthentication_needed');
      return;
    }
    addToast('Hasło zostało zmienione.', 'success');
    router.replace('/account');
    router.refresh();
  };

  return (
    <form className="space-y-3" onSubmit={handleSubmit(onSubmit)} noValidate>
      <FormInput
        label="Nowe hasło"
        type="password"
        autoComplete="new-password"
        error={errors.password?.message}
        {...register('password')}
      />
      <FormInput
        label="Powtórz nowe hasło"
        type="password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />
      {error && (
        <Alert tone="danger">
          {error}
          {needsCode && (
            <>
              {' '}
              <Link href="/account/security" className={textLink}>
                Przejdź do ustawień
              </Link>
            </>
          )}
        </Alert>
      )}
      <Button size="lg" fullWidth type="submit" icon={KeyRound} loading={isSubmitting}>
        Ustaw hasło
      </Button>
    </form>
  );
}
