import React, { useState } from 'react';
import { LoginFormValues, PasswordResetValues } from '@/features/auth/model/schemas';
import { useTurnstile } from '@detaileed/ui';
import { supabase } from '@/shared/lib/supabase';
import { TURNSTILE_SITE_KEY } from '@/shared/lib/siteConfig';
import { AuthScreen } from './AuthScreen';
import { LoginForm } from './login/LoginForm';
import { ResetPasswordForm } from './login/ResetPasswordForm';
import { ResetSentMessage } from './login/ResetSentMessage';

interface LoginViewProps {
  onLogin: (email: string) => void;
}

type Mode = 'login' | 'reset' | 'reset-sent';

const CAPTCHA_FAILED = 'Nie udało się potwierdzić, że nie jesteś robotem. Spróbuj ponownie.';

function authErrorText(error: { code?: string; message: string }): string {
  return error.code === 'captcha_failed' ? CAPTCHA_FAILED : error.message;
}

function getErrorMessage(error: unknown, fallbackMessage: string): string {
  if (error instanceof Error && error.message) return error.message;
  return fallbackMessage;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<Mode>('login');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetEmailSentTo, setResetEmailSentTo] = useState('');
  const captcha = useTurnstile(TURNSTILE_SITE_KEY, mode === 'reset' ? 'password_reset' : 'dashboard_sign_in');

  // Each form mounts fresh when its mode opens, so its fields start empty.
  const switchMode = (next: Mode) => {
    setMode(next);
    setError('');
  };

  const onLoginSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError('');
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
        options: { captchaToken: captcha.token },
      });
      if (authError) throw new Error(authErrorText(authError));
      if (authData.session) {
        onLogin(data.email);
      } else throw new Error('Nie otrzymano sesji autoryzacji');
    } catch (error) {
      setError(getErrorMessage(error, 'Wystąpił błąd podczas logowania'));
    } finally {
      captcha.reset();
      setIsLoading(false);
    }
  };

  const onResetSubmit = async (data: PasswordResetValues) => {
    setIsLoading(true);
    setError('');
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/?type=recovery`,
        captchaToken: captcha.token,
      });
      if (resetError) throw new Error(authErrorText(resetError));
      setResetEmailSentTo(data.email);
      setMode('reset-sent');
    } catch (error) {
      setError(getErrorMessage(error, 'Wystąpił błąd podczas resetowania hasła'));
    } finally {
      captcha.reset();
      setIsLoading(false);
    }
  };

  return (
    <AuthScreen title="Detaileed" description="Twój panel do zarządzania firmą">
      {mode === 'login' && (
        <LoginForm
          captcha={captcha}
          error={error}
          isLoading={isLoading}
          onSubmit={onLoginSubmit}
          onForgotPassword={() => switchMode('reset')}
        />
      )}
      {mode === 'reset' && (
        <ResetPasswordForm
          captcha={captcha}
          error={error}
          isLoading={isLoading}
          onSubmit={onResetSubmit}
          onBack={() => switchMode('login')}
        />
      )}
      {mode === 'reset-sent' && <ResetSentMessage email={resetEmailSentTo} onBack={() => switchMode('login')} />}
    </AuthScreen>
  );
};
