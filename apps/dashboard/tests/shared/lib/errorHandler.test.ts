import { describe, expect, it } from 'vitest';
import { ApiError } from '@detaileed/api-client';
import { getApiErrorMessage } from '@/shared/lib/errorHandler';

describe('getApiErrorMessage', () => {
  it('joins validation messages', () => {
    const error = new ApiError(400, {
      title: 'One or more validation errors occurred.',
      errors: { Name: ['A'], Phone: ['B'] },
    });
    expect(getApiErrorMessage(error)).toBe('A\nB');
  });

  it('prefers the problem detail', () => {
    const error = new ApiError(404, {
      title: 'Not Found',
      detail: 'Nie znaleziono rezerwacji',
      code: 'BOOKING_NOT_FOUND',
    });
    expect(getApiErrorMessage(error)).toBe('Nie znaleziono rezerwacji');
  });

  it('hides generic server titles behind a status message', () => {
    expect(getApiErrorMessage(new ApiError(500, { title: 'An unexpected server error occurred.' }))).toBe(
      'Błąd wewnętrzny serwera.',
    );
    expect(getApiErrorMessage(new ApiError(403, 'forbidden text'))).toBe('Brak uprawnień do wykonania tej akcji.');
  });

  it('maps network failures and falls back to the default', () => {
    expect(getApiErrorMessage(new TypeError('Failed to fetch'))).toBe('Błąd połączenia. Sprawdź dostęp do internetu.');
    expect(getApiErrorMessage(new ApiError(418), 'x')).toBe('x');
    expect(getApiErrorMessage(null, 'x')).toBe('x');
  });
});
