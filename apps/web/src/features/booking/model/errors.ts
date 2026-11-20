import { ApiError } from '@detaileed/api-client';
import { getApiErrorMessage } from '@detaileed/domain/apiErrors';
import { GARAGE_MESSAGES } from '@/features/account/model/errors';

/** What the customer reads when sending a request fails, by the API's error code. */
const MESSAGES: Record<string, string> = {
  BOOKING_REQUEST_LIMIT:
    'Masz już 3 zapytania czekające na odpowiedź tego studia. Poczekaj na odpowiedź albo wycofaj jedno.',
  OUTSIDE_OPENING_HOURS: 'Studio nie pracuje o tej porze. Wybierz jeden z wolnych terminów.',
  BOOKING_REQUEST_TOO_SOON: 'Ten termin jest zbyt bliski. Wybierz jeden z późniejszych wolnych terminów.',
  CUSTOMER_PROFILE_REQUIRED: 'Uzupełnij imię i telefon, aby studio mogło się z Tobą skontaktować.',
  STUDIO_NOT_FOUND: 'To studio nie przyjmuje teraz zapytań.',
  BOOKING_REQUEST_UNKNOWN_SERVICES: 'Część wybranych usług nie jest już dostępna. Odśwież stronę i wybierz ponownie.',
  // A request can add the car to the garage or pick a saved one
  ...GARAGE_MESSAGES,
};

export function bookingErrorMessage(error: unknown, fallback = 'Nie udało się wysłać zapytania.'): string {
  if (error instanceof ApiError && error.code && MESSAGES[error.code]) return MESSAGES[error.code];
  return getApiErrorMessage(error, fallback);
}
