import { ApiError } from '@detaileed/api-client';

const STATUS_MESSAGES: Record<number, string> = {
  400: 'Błędne zapytanie. Sprawdź wprowadzane dane.',
  401: 'Zaloguj się ponownie, sesja wygasła.',
  403: 'Brak uprawnień do wykonania tej akcji.',
  404: 'Zasób nie został odnaleziony.',
  409: 'Wystąpił konflikt danych.',
  500: 'Błąd wewnętrzny serwera.',
};

function apiErrorMessage(error: ApiError): string | undefined {
  // Validation problem details: { errors: { "Name": ["..."] } }
  const validation = Object.values(error.errors ?? {})
    .flat()
    .filter((msg) => typeof msg === 'string');
  if (validation.length > 0) return validation.join('\n');

  // The API puts a user-facing (Polish) message in `detail`.
  if (error.detail) return error.detail;

  // Generic English titles from ASP.NET are not shown to users.
  const title = typeof error.data === 'object' ? error.data.title : undefined;
  if (title && !/validation errors occurred|unexpected|internal server error/i.test(title)) return title;

  return STATUS_MESSAGES[error.status] ?? (error.status >= 500 ? STATUS_MESSAGES[500] : undefined);
}

export function getApiErrorMessage(error: unknown, defaultMessage = 'Wystąpił nieznany błąd'): string {
  if (error instanceof ApiError) {
    return apiErrorMessage(error) ?? defaultMessage;
  }

  if (error instanceof Error) {
    // Network failures surface as 'TypeError: Failed to fetch'.
    if (error.message.toLowerCase().includes('failed to fetch')) {
      return 'Błąd połączenia. Sprawdź dostęp do internetu.';
    }
    return error.message;
  }

  if (typeof error === 'string') return error;

  return defaultMessage;
}
