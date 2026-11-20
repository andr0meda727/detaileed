'use client';

import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button, useTurnstile } from '@detaileed/ui';
import { getSupabase } from '@/lib/supabase/client';
import { TURNSTILE_SITE_KEY } from '@/lib/site';
import { authErrorMessage } from '@/features/auth/model/authErrors';
import { confirmEmailRedirect } from '@/features/auth/model/returnPath';
import CaptchaField from '@/features/auth/components/CaptchaField';

/** Seconds between two sends, so an impatient click doesn't hit Supabase's email rate limit. */
export const RESEND_COOLDOWN = 60;

/**
 * "Didn't get the email?": sends the sign-up confirmation link again. `justSent` starts the wait right away, for
 * the screen shown straight after sign-up.
 */
export default function ResendConfirmation({
  email,
  next,
  justSent = false,
}: {
  email: string;
  next: string;
  justSent?: boolean;
}) {
  const captcha = useTurnstile(TURNSTILE_SITE_KEY, 'resend');
  const [secondsLeft, setSecondsLeft] = useState(justSent ? RESEND_COOLDOWN : 0);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const resend = async () => {
    setError(null);
    setSending(true);
    try {
      const { error: authError } = await getSupabase().auth.resend({
        type: 'signup',
        email,
        options: { emailRedirectTo: confirmEmailRedirect(next), captchaToken: captcha.token },
      });
      if (authError) {
        setError(authErrorMessage(authError));
        return;
      }
      setSent(true);
      setSecondsLeft(RESEND_COOLDOWN);
    } catch {
      // A network failure throws instead of returning an error
      setError(authErrorMessage(null));
    } finally {
      captcha.reset();
      setSending(false);
    }
  };

  return (
    <div className="space-y-2 pt-2">
      <p className="text-sm text-green-light">Nie dostałeś wiadomości? Sprawdź spam albo wyślij ją ponownie.</p>
      <CaptchaField captcha={captcha} />
      {sent && !error && (
        <p role="status" className="text-sm text-green-deep">
          Wysłaliśmy link ponownie.
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-red-600 bg-red-50 rounded-xl p-3">
          {error}
        </p>
      )}
      <Button
        variant="secondary"
        icon={RefreshCw}
        loading={sending}
        disabled={secondsLeft > 0 || !captcha.ready}
        onClick={resend}
      >
        {secondsLeft > 0 ? `Wyślij ponownie (${secondsLeft} s)` : 'Wyślij ponownie'}
      </Button>
    </div>
  );
}
