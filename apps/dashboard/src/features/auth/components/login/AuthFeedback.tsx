import React from 'react';
import { Turnstile, type UseTurnstile } from '@detaileed/ui';

export interface AuthFeedbackProps {
  captcha: UseTurnstile;
  error: string;
}

/** The captcha widget, its loading failure and the last error, shown above a form's submit button. */
export const AuthFeedback: React.FC<AuthFeedbackProps> = ({ captcha, error }) => (
  <>
    {captcha.widgetProps && <Turnstile {...captcha.widgetProps} className="flex justify-center" />}
    {captcha.failed && (
      <div className="p-4 bg-red-50 text-red-500 text-xs font-bold rounded-2xl border border-red-100 text-center">
        Nie udało się załadować weryfikacji. Odśwież stronę albo wyłącz blokowanie skryptów.
      </div>
    )}

    {error && (
      <div className="p-4 bg-red-50 text-red-500 text-xs font-bold rounded-2xl border border-red-100 text-center">
        {error}
      </div>
    )}
  </>
);
