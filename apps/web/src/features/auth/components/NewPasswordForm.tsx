'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound } from 'lucide-react';
import { Button, FormInput, useToast } from '@detaileed/ui';
import { newPasswordSchema, type NewPasswordValues } from '@/features/auth/model/schemas';
import { authErrorMessage } from '@/features/auth/model/authErrors';
import { setPassword } from '@/features/auth/api/password';

/** The last step of a password reset: the link has signed the customer in, now they choose the new password. */
export default function NewPasswordForm() {
  const router = useRouter();
  const { addToast } = useToast();
  const [error, setError] = useState<string | null>(null);
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
      return;
    }
    addToast('Hasło zostało zmienione.', 'success');
    router.replace('/konto');
    router.refresh();
  };

  return (
    <form className="space-y-2" onSubmit={handleSubmit(onSubmit)} noValidate>
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
        <p role="alert" className="text-sm text-red-600 bg-red-50 rounded-xl p-3">
          {error}
        </p>
      )}
      <Button size="lg" fullWidth type="submit" icon={KeyRound} loading={isSubmitting}>
        Ustaw hasło
      </Button>
    </form>
  );
}
