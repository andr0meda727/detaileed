import { ApiError } from '@detaileed/api-client';
import { getApiErrorMessage } from '@detaileed/domain/apiErrors';

/** What the customer reads when a saved car can't be used or added, by the API's error code. */
export const GARAGE_MESSAGES: Record<string, string> = {
  CUSTOMER_VEHICLE_NOT_FOUND: 'Nie znaleziono wybranego auta. Wybierz je ponownie.',
  CUSTOMER_GARAGE_FULL: 'W garażu jest już 10 aut. Usuń któreś, aby dodać nowe.',
  CUSTOMER_VEHICLE_EXISTS: 'Auto z tym numerem rejestracyjnym jest już w garażu.',
};

export function garageErrorMessage(error: unknown, fallback = 'Nie udało się zapisać auta.'): string {
  if (error instanceof ApiError && error.code && GARAGE_MESSAGES[error.code]) return GARAGE_MESSAGES[error.code];
  return getApiErrorMessage(error, fallback);
}
