'use client';

import { Turnstile, type UseTurnstile } from '@detaileed/ui';

/** The Turnstile widget of a form, and what to do when it can't load. Renders nothing when captcha is off. */
export default function CaptchaField({ captcha }: { captcha: UseTurnstile }) {
  return (
    <>
      {captcha.widgetProps && <Turnstile {...captcha.widgetProps} className="flex justify-center" />}
      {captcha.failed && (
        <p role="alert" className="text-sm text-red-600 bg-red-50 rounded-xl p-3">
          Nie udało się załadować weryfikacji. Odśwież stronę albo wyłącz blokowanie skryptów.
        </p>
      )}
    </>
  );
}
