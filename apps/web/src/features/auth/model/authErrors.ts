/**
 * Why a link from an email didn't work. Links are one-time, expire, and (PKCE) work only in the browser that asked
 * for them.
 */
export const LINK_EXPIRED =
  'Link wygasł, został już użyty albo otwarto go w innej przeglądarce niż ta, w której o niego poproszono.';

/** Polish messages for the Supabase auth errors a customer can run into; anything else gets a generic text. */
const MESSAGES: Record<string, string> = {
  invalid_credentials: 'Nieprawidłowy e-mail lub hasło.',
  email_not_confirmed: 'Najpierw potwierdź adres e-mail: kliknij link, który wysłaliśmy.',
  user_already_exists: 'Konto z tym adresem e-mail już istnieje. Zaloguj się.',
  email_exists: 'Konto z tym adresem e-mail już istnieje. Zaloguj się.',
  weak_password: 'Hasło jest zbyt słabe. Użyj co najmniej 8 znaków, wielkiej litery i cyfry.',
  over_email_send_rate_limit: 'Wysłaliśmy już e-mail. Odczekaj chwilę i spróbuj ponownie.',
  captcha_failed: 'Nie udało się potwierdzić, że nie jesteś robotem. Spróbuj ponownie.',
  over_request_rate_limit: 'Zbyt wiele prób. Odczekaj chwilę i spróbuj ponownie.',
  email_address_invalid: 'Ten adres e-mail jest nieprawidłowy.',
  same_password: 'Nowe hasło musi się różnić od obecnego.',
  reauthentication_not_valid: 'Kod jest nieprawidłowy albo wygasł. Wyślij nowy kod.',
  // A link from an email that expired, was used, or is opened in another browser than the one that asked for it
  otp_expired: LINK_EXPIRED,
  flow_state_expired: LINK_EXPIRED,
  flow_state_not_found: LINK_EXPIRED,
  bad_code_verifier: LINK_EXPIRED,
};

export function authErrorMessage(error: { code?: string; message?: string } | null | undefined): string {
  if (!error) return 'Coś poszło nie tak. Spróbuj ponownie.';
  if (error.code && MESSAGES[error.code]) return MESSAGES[error.code];
  // Older Supabase responses carry only a message.
  if (error.message?.includes('Invalid login credentials')) return MESSAGES.invalid_credentials;
  if (error.message?.includes('Email not confirmed')) return MESSAGES.email_not_confirmed;
  if (error.message?.includes('already registered')) return MESSAGES.user_already_exists;
  return 'Coś poszło nie tak. Spróbuj ponownie.';
}
