'use client';

import { Alert, Turnstile, type UseTurnstile } from '@detaileed/ui';

/** The Turnstile widget of a form, and what to do when it can't load. Renders nothing when captcha is off. */
export function CaptchaField({ captcha }: { captcha: UseTurnstile }) {
  return (
    <>
      {captcha.widgetProps && <Turnstile {...captcha.widgetProps} className="flex justify-center" />}
      {captcha.failed && (
        <Alert tone="danger">
          Nie udało się załadować weryfikacji. Odśwież stronę albo wyłącz blokowanie skryptów.
        </Alert>
      )}
    </>
  );
}
