'use client';

import { useCallback, useRef, useState } from 'react';
import type { TurnstileHandle, TurnstileProps } from './Turnstile';

export interface UseTurnstile {
  /** False when no site key is configured: no widget, and auth calls go without a token. */
  enabled: boolean;
  /** The current token, to pass as Supabase's `captchaToken`. */
  token: string | undefined;
  /** True when the form may be sent: captcha is off, or a token is waiting. */
  ready: boolean;
  /** True when the challenge could not run (blocked script, failed check). */
  failed: boolean;
  /** Get a new token after a request used this one. */
  reset: () => void;
  /** Props for `<Turnstile>`; null when captcha is off. */
  widgetProps: TurnstileProps | null;
}

/** State for one Turnstile widget in a form. An empty `siteKey` turns captcha off (e.g. local development). */
export function useTurnstile(siteKey: string | undefined, action?: string): UseTurnstile {
  const handle = useRef<TurnstileHandle>(null);
  const [token, setToken] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const enabled = Boolean(siteKey);

  const onToken = useCallback((next: string | null) => {
    setToken(next);
    if (next) setFailed(false);
  }, []);
  const onError = useCallback(() => setFailed(true), []);
  const reset = useCallback(() => handle.current?.reset(), []);

  return {
    enabled,
    token: token ?? undefined,
    ready: !enabled || token !== null,
    failed,
    reset,
    widgetProps: siteKey ? { siteKey, action, onToken, onError, ref: handle } : null,
  };
}
