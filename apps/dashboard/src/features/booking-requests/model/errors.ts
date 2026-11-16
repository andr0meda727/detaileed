import { ApiError } from '@detaileed/api-client';
import { getApiErrorMessage } from '@detaileed/domain/apiErrors';

/** Messages for the request-specific error codes; others fall back to the API's own text. */
const MESSAGES: Record<string, string> = {
  BOOKING_REQUEST_ALREADY_DECIDED: 'To zapytanie zostało już rozpatrzone (lub klient je wycofał). Odśwież listę.',
  BOOKING_REQUEST_NOT_FOUND: 'Nie znaleziono zapytania w tym studiu.',
  NO_BAY_AVAILABLE: 'O tej godzinie nie ma wolnego stanowiska. Wybierz inny termin z propozycji.',
  BAY_TAKEN: 'Wybrane stanowisko jest już zajęte w tym czasie. Wybierz inne stanowisko lub termin.',
};

export function requestErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError && error.code && MESSAGES[error.code]) return MESSAGES[error.code];
  return getApiErrorMessage(error, fallback);
}
