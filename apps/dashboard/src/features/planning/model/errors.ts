import { ApiError } from '@detaileed/api-client';
import { getApiErrorMessage } from '@detaileed/domain/apiErrors';

const MESSAGES: Record<string, string> = {
  BAY_LIMIT_REACHED: 'Studio może mieć najwyżej 20 aktywnych stanowisk.',
  BAY_HAS_UPCOMING_BOOKINGS: 'Na tym stanowisku są jeszcze nadchodzące rezerwacje. Przenieś je lub odwołaj najpierw.',
  BAY_NOT_FOUND: 'Nie znaleziono stanowiska. Odśwież stronę.',
  OVERLAPPING_OPENING_PERIODS: 'Godziny otwarcia w jednym dniu nachodzą na siebie.',
  INVALID_OPENING_PERIOD: 'Godzina zamknięcia musi być późniejsza niż otwarcia.',
  TOO_MANY_OPENING_PERIODS: 'Za dużo przedziałów godzin w jednym dniu.',
  INVALID_PLANNING_RULES: 'Sprawdź zasady planowania: bufor, krok startu, wyprzedzenie i mnożniki.',
  CLOSURE_NOT_FOUND: 'Nie znaleziono tego dnia zamknięcia.',
};

export function planningErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError && error.code && MESSAGES[error.code]) return MESSAGES[error.code];
  return getApiErrorMessage(error, fallback);
}
