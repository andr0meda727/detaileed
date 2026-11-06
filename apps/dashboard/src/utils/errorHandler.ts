import { ApiError } from '../apiClient';

export function getApiErrorMessage(error: unknown, defaultMessage = 'Wystąpił nieznany błąd'): string {
    if (error instanceof ApiError) {
        // Spróbuj wyciągnąć błędy walidacji, typowe dla .NET ValidationProblemDetails
        if (error.data) {
            if (error.data.errors && typeof error.data.errors === 'object') {
                const messages = Object.values(error.data.errors)
                    .flat()
                    .filter(msg => typeof msg === 'string');
                
                if (messages.length > 0) {
                   return messages.join('\n');
                }
            }

            // Fallback na inne standardowe pola JSON i tłumaczenie powszechnych zwrotów generycznych w .NET
            let fallbackText = '';
            if (typeof error.data.message === 'string') fallbackText = error.data.message;
            else if (typeof error.data.title === 'string') fallbackText = error.data.title;

            if (fallbackText) {
                const low = fallbackText.toLowerCase();
                if (low.includes('an unexpected server error') || low.includes('internal server error')) {
                    return 'Błąd wewnętrzny serwera.';
                }
                if (low.includes('one or more validation errors occurred')) {
                    return 'Sprawdź poprawność wprowadzonych danych.';
                }
                return fallbackText;
            }
        }

        // Awaryjne tłumaczenie standardowych statusów HTTP
        switch (error.status) {
            case 400: return 'Błędne zapytanie. Sprawdź wprowadzane dane.';
            case 401: return 'Zaloguj się ponownie, sesja wygasła.';
            case 403: return 'Brak uprawnień do wykonania tej akcji.';
            case 404: return 'Zasób nie został odnaleziony.';
            case 409: return 'Wystąpił konflikt danych.';
            case 500: return 'Błąd wewnętrzny serwera.';
        }

        return error.message || defaultMessage;
    }

    if (error instanceof Error) {
        // Czasami błędy sieciowe łapią się jako 'TypeError: Failed to fetch'
        if (error.message.toLowerCase().includes('failed to fetch')) {
            return 'Błąd połączenia. Sprawdź dostęp do internetu.';
        }
        return error.message;
    }

    if (typeof error === 'string') {
        return error;
    }

    return defaultMessage;
}
