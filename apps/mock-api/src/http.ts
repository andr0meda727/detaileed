/** Errors and replies shared by the route handlers. */

/** Thrown by a handler; the server answers with `status` and `body` as JSON. */
export class HttpError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, body: unknown) {
    super(`HTTP ${status}`);
    this.status = status;
    this.body = body;
  }
}

const TITLES: Record<number, string> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
  422: 'Unprocessable Entity',
};

/**
 * ProblemDetails like the .NET API's: the apps switch on `code` and show `detail` (Polish) to the user.
 * Usage: `throw problem(404, 'BOOKING_NOT_FOUND', 'Nie znaleziono rezerwacji.')`.
 */
export function problem(status: number, code: string, detail: string): HttpError {
  return new HttpError(status, {
    type: `https://tools.ietf.org/html/rfc9110#section-15.${status >= 500 ? 6 : 5}`,
    title: TITLES[status] ?? 'Error',
    status,
    detail,
    code,
  });
}

/** A validation failure: request property path (`Name`, `Vehicle.LicensePlate`) to Polish messages. */
export function validationProblem(errors: Record<string, string[]>): HttpError {
  return new HttpError(400, {
    type: 'https://tools.ietf.org/html/rfc9110#section-15.5.1',
    title: 'One or more validation errors occurred.',
    status: 400,
    code: 'VALIDATION_FAILED',
    errors,
  });
}

/** A handler's answer with a status other than 200, or with no body. */
export class Reply {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, body?: unknown) {
    this.status = status;
    this.body = body;
  }
}

/** 200 with an empty body, as the API answers commands without a result. */
export const empty = () => new Reply(200);
/** 204 No Content. */
export const noContent = () => new Reply(204);
