import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, FormInput } from '@detaileed/ui';
import { setPasswordSchema, SetPasswordValues } from '@/features/auth/model/schemas';
import { supabase } from '@/shared/lib/supabase';
import { AuthScreen } from './AuthScreen';

interface SetPasswordViewProps {
  onSuccess: () => void;
}

export const SetPasswordView: React.FC<SetPasswordViewProps> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SetPasswordValues>({
    resolver: zodResolver(setPasswordSchema),
  });

  const onSubmit = async (data: SetPasswordValues) => {
    setError('');
    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password: data.password,
      data: { needs_password: false },
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    onSuccess();
  };

  return (
    <AuthScreen
      title="Witaj w zespole!"
      description="Zostałeś zaproszony do aplikacji. Ustaw swoje hasło, aby uzyskać dostęp do panelu."
    >
      {error && <Alert tone="danger">{error}</Alert>}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormInput
          label="Nowe hasło"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password')}
        />
        <FormInput
          label="Powtórz hasło"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        <Button type="submit" fullWidth loading={loading} className="mt-1">
          Zapisz hasło i wejdź
        </Button>
      </form>
    </AuthScreen>
  );
};
