'use client';

import { useState, type FormEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound, RefreshCw, ShieldCheck } from 'lucide-react';
import { Button, FormInput, FormSection, useToast } from '@detaileed/ui';
import { getSupabase } from '@/lib/supabase/client';
import { newPasswordSchema, type NewPasswordValues } from '@/features/auth/model/schemas';
import { authErrorMessage } from '@/features/auth/model/authErrors';
import { setPassword } from '@/features/auth/api/password';

/**
 * Changes the signed-in customer's password. When Supabase's "secure password change" wants proof that it's really
 * them (the session is older than a day), it emails a code; the form then asks for it and tries again.
 */
export default function ChangePasswordForm() {
  const { addToast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [pendingPassword, setPendingPassword] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewPasswordValues>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const done = () => {
    addToast('Hasło zostało zmienione.', 'success');
    reset();
    setPendingPassword(null);
    setCode('');
  };

  const onSubmit = async ({ password }: NewPasswordValues) => {
    setError(null);
    setBusy(true);
    try {
      const authError = await setPassword(password);
      if (!authError) return done();
      if (authError.code !== 'reauthentication_needed') return setError(authErrorMessage(authError));
      if (await sendCode()) setPendingPassword(password);
    } finally {
      setBusy(false);
    }
  };

  /** Emails a reauthentication code; false (with the error shown) when Supabase refused. */
  const sendCode = async () => {
    const { error: sendError } = await getSupabase().auth.reauthenticate();
    if (sendError) setError(authErrorMessage(sendError));
    return !sendError;
  };

  const resendCode = async () => {
    setError(null);
    setBusy(true);
    try {
      if (await sendCode()) {
        setCode('');
        addToast('Wysłaliśmy nowy kod.', 'success');
      }
    } finally {
      setBusy(false);
    }
  };

  const cancelCode = () => {
    setPendingPassword(null);
    setCode('');
    setError(null);
  };

  const confirmWithCode = async (event: FormEvent) => {
    event.preventDefault();
    if (!pendingPassword || !code.trim()) return;
    setError(null);
    setBusy(true);
    try {
      const authError = await setPassword(pendingPassword, code.trim());
      if (authError) return setError(authErrorMessage(authError));
      done();
    } finally {
      setBusy(false);
    }
  };

  return (
    <FormSection icon={KeyRound} title="Hasło">
      <div className="p-5 space-y-3">
        {pendingPassword ? (
          <form className="space-y-3" onSubmit={confirmWithCode} noValidate>
            <p className="text-sm text-green-light">
              Dla bezpieczeństwa wysłaliśmy kod na Twój adres e-mail. Wpisz go, aby zmienić hasło.
            </p>
            <FormInput
              label="Kod z e-maila"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            {error && (
              <p role="alert" className="text-sm text-red-600 bg-red-50 rounded-xl p-3">
                {error}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Button type="submit" icon={ShieldCheck} loading={busy} disabled={!code.trim()}>
                Potwierdź i zmień hasło
              </Button>
              <Button variant="secondary" icon={RefreshCw} disabled={busy} onClick={resendCode}>
                Wyślij nowy kod
              </Button>
              <Button variant="ghost" disabled={busy} onClick={cancelCode}>
                Anuluj
              </Button>
            </div>
          </form>
        ) : (
          <form className="space-y-2" onSubmit={handleSubmit(onSubmit)} noValidate>
            <p className="text-sm text-green-light">Po zmianie hasła wylogujemy Cię na pozostałych urządzeniach.</p>
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
            <Button type="submit" icon={KeyRound} loading={busy}>
              Zmień hasło
            </Button>
          </form>
        )}
      </div>
    </FormSection>
  );
}
