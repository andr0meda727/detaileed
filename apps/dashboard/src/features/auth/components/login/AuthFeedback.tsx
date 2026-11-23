import React from 'react';
import { Alert, Turnstile, type UseTurnstile } from '@detaileed/ui';

export interface AuthFeedbackProps {
  captcha: UseTurnstile;
  error: string;
}

/** The captcha widget, its loading failure and the last error, shown above a form's submit button. */
export const AuthFeedback: React.FC<AuthFeedbackProps> = ({ captcha, error }) => (
  <>
    {captcha.widgetProps && <Turnstile {...captcha.widgetProps} className="flex justify-center" />}
    {captcha.failed && (
      <Alert tone="danger">Nie udało się załadować weryfikacji. Odśwież stronę albo wyłącz blokowanie skryptów.</Alert>
    )}
    {error && <Alert tone="danger">{error}</Alert>}
  </>
);
