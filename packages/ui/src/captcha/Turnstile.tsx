'use client';

import { useEffect, useImperativeHandle, useRef, type Ref } from 'react';

/** The part of Cloudflare's `window.turnstile` API the widget uses. */
interface TurnstileApi {
  render: (container: HTMLElement, options: Record<string, unknown>) => string | undefined;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

let scriptPromise: Promise<TurnstileApi> | null = null;

/** Loads Cloudflare's script once per page, however many widgets ask for it. */
function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  scriptPromise ??= new Promise<TurnstileApi>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error('Turnstile not loaded')));
    script.onerror = () => {
      scriptPromise = null; // let the next widget try again
      script.remove();
      reject(new Error('Turnstile script failed to load'));
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export interface TurnstileHandle {
  /** Asks for a new token; a token is single-use, so call it after every request that sent one. */
  reset: () => void;
}

export interface TurnstileProps {
  siteKey: string;
  /** A fresh token, or null when it expires, fails or the widget goes away. */
  onToken: (token: string | null) => void;
  /** Called when the challenge or the script fails, so the form can say why it can't be sent. */
  onError?: () => void;
  /** Label shown in Cloudflare's analytics, e.g. "login". */
  action?: string;
  className?: string;
  ref?: Ref<TurnstileHandle>;
}

/**
 * Cloudflare Turnstile challenge. It stays invisible unless Cloudflare wants the person to tick a box; the token
 * it produces goes to Supabase Auth as `captchaToken`, and Supabase checks it with Cloudflare.
 */
export function Turnstile({ siteKey, onToken, onError, action, className, ref }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<string | null>(null);
  const callbacks = useRef({ onToken, onError });
  useEffect(() => {
    callbacks.current = { onToken, onError };
  });

  useImperativeHandle(ref, () => ({
    reset: () => {
      callbacks.current.onToken(null);
      if (widgetRef.current && window.turnstile) window.turnstile.reset(widgetRef.current);
    },
  }));

  useEffect(() => {
    let cancelled = false;
    loadTurnstile()
      .then((turnstile) => {
        if (cancelled || !containerRef.current) return;
        widgetRef.current =
          turnstile.render(containerRef.current, {
            sitekey: siteKey,
            action,
            language: 'pl',
            theme: 'light',
            appearance: 'interaction-only',
            callback: (token: string) => callbacks.current.onToken(token),
            'expired-callback': () => callbacks.current.onToken(null),
            'error-callback': () => {
              callbacks.current.onToken(null);
              callbacks.current.onError?.();
            },
          }) ?? null;
      })
      .catch(() => {
        if (!cancelled) callbacks.current.onError?.();
      });
    return () => {
      cancelled = true;
      if (widgetRef.current && window.turnstile) window.turnstile.remove(widgetRef.current);
      widgetRef.current = null;
      callbacks.current.onToken(null);
    };
  }, [siteKey, action]);

  return <div ref={containerRef} className={className} />;
}
