import { ApiError } from '@detaileed/api-client';
import { getApiErrorMessage } from '@detaileed/domain/apiErrors';

/** Messages for the booking codes the planner can answer with. */
const MESSAGES: Record<string, string> = {
  NO_BAY_AVAILABLE: 'O tej godzinie nie ma wolnego stanowiska. Wybierz jeden z wolnych terminów.',
  BAY_TAKEN: 'Wybrane stanowisko jest już zajęte w tym czasie. Wybierz inne albo „Automatycznie”.',
  BOOKING_CLIENT_OR_VEHICLE_NOT_FOUND: 'Nie znaleziono klienta lub pojazdu. Wybierz je ponownie.',
};

export function bookingSaveErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError && error.code && MESSAGES[error.code]) return MESSAGES[error.code];
  return getApiErrorMessage(error, fallback);
}
