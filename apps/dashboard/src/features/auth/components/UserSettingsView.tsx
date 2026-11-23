import React, { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Shield } from 'lucide-react';
import { Alert, Button, Card, CardContent, CardHeader } from '@detaileed/ui';
import { setPasswordSchema, SetPasswordValues } from '@/features/auth/model/schemas';
import { supabase } from '@/shared/lib/supabase';
import { GlobalHeader } from '@/shared/ui/GlobalHeader';
import { PasswordField } from './settings/PasswordField';
import { PasswordStrength } from './settings/PasswordStrength';

function getErrorMessage(error: unknown, fallbackMessage: string): string {
  if (error instanceof Error && error.message) return error.message;
  return fallbackMessage;
}

export const UserSettingsView: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SetPasswordValues>({
    resolver: zodResolver(setPasswordSchema),
  });

  const passwordValue = useWatch({ control, name: 'password', defaultValue: '' });

  const onSubmit = async (data: SetPasswordValues) => {
    setResult(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: data.password });
      if (error) throw error;
      setResult({ type: 'success', message: 'Hasło zostało zmienione.' });
      reset();
    } catch (error) {
      setResult({ type: 'error', message: getErrorMessage(error, 'Nie udało się zmienić hasła.') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <GlobalHeader title="Ustawienia konta" subtitle="Zarządzaj swoim profilem i bezpieczeństwem" />

      <div className="flex max-w-lg flex-col gap-4">
        <Card>
          <CardHeader title="Zmień hasło" description="Ustaw nowe hasło do swojego konta" />
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <PasswordField
                label="Nowe hasło"
                autoComplete="new-password"
                placeholder="Minimum 8 znaków"
                error={errors.password?.message}
                {...register('password')}
              />
              <PasswordField
                label="Potwierdź nowe hasło"
                autoComplete="new-password"
                placeholder="Powtórz nowe hasło"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />

              <PasswordStrength password={passwordValue} />

              {result && <Alert tone={result.type === 'success' ? 'success' : 'danger'}>{result.message}</Alert>}

              <div className="flex justify-end">
                <Button type="submit" loading={loading} icon={Shield}>
                  Zmień hasło
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Alert>
          Po zmianie hasła Twoja aktualna sesja pozostanie aktywna. Inne urządzenia zostaną poproszone o ponowne
          logowanie.
        </Alert>
      </div>
    </div>
  );
};
