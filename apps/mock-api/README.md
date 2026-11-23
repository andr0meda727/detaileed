# @detaileed/mock-api

A fake Detaileed API and Supabase sign-in with Polish sample data, so both apps run locally without the real backend:
for previews, screenshots and trying flows. It is a plain Node server (`node:http`, run with `tsx`), keeps everything in
memory and is never deployed; no app depends on it, so the Docker images leave it out.

## Run it

```sh
pnpm dev:mock                                            # mock on :5180, dashboard on :3000, customer site on :3001
pnpm --filter @detaileed/mock-api dev:mock --port 5180   # only the mock (watch mode); MOCK_API_PORT works too
pnpm --filter @detaileed/dashboard dev:mock --port 3010  # the dashboard against the mock (vite --mode mock)
pnpm --filter @detaileed/web dev:mock --port 3011        # the customer site against the mock
curl -X POST http://localhost:5180/__mock/reset          # throw away every change, rebuild the sample data
```

The apps read `apps/dashboard/.env.mock` and `apps/web/.env.mock` (both point at `http://localhost:5180`, without a
captcha key); they win over your `.env.local`. To run the mock on another port, change those files or set the variables
in your shell.

## Demo accounts

Password `demo1234` for all three.

| Email                           | Who                       | What they see                                                                                                            |
| ------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `wlasciciel@demo.detaileed.com` | Tomasz Wiśniewski, owner  | **Auto Spa Mokotów** (busy: bookings, requests, stock, team, public profile) and **Auto Spa Wola** (new and empty)       |
| `pracownik@demo.detaileed.com`  | Kamil Nowak, employee     | Auto Spa Mokotów with an employee's rights; an invitation to Auto Spa Wola at `/accept-invitation?token=demo-invitation` |
| `klient@demo.detaileed.com`     | Marta Zielińska, customer | profile, two cars, requests in every status (one at another studio), two visits to review                                |

Sign-up works too: a new account is confirmed and signed in straight away. Emails are never sent; the links Supabase
would email (password reset, confirmation, team invitations) are printed in the mock's console.

## What it serves

- `/auth/v1/*`: enough of Supabase Auth for `@supabase/supabase-js` and `@supabase/ssr`: password, refresh-token and
  PKCE sign-in, get and update the user, sign-out, sign-up, recover, resend, reauthenticate, settings and the email
  link (`/verify`). Tokens are signed JWTs with `exp`, `sub`, `email` and `role: authenticated`; errors have Supabase's
  shape (`error_code`, `msg`).
- `/api/*`: every method and path of `packages/api-client/openapi.json` (a test checks this), answering with the
  generated models. The API checks the token and `X-Studio-Id` like the real one, and errors are ProblemDetails with
  the `code`s the apps turn into messages (`BAY_TAKEN`, `LISTING_NOT_FOUND`, `CUSTOMER_GARAGE_FULL`, …).
- CORS for any `http://localhost:*` origin.

The data is in Europe/Warsaw and dated from today: about eight weeks of past visits and three weeks ahead, so today's
schedule, the day board, upcoming bookings and free slots are always filled. Changes (new bookings, completing a visit,
accepting a request, a review…) stay until the mock restarts or `POST /__mock/reset`. A small planner books bays with
the studio's buffers and durations, so free slots and conflicts behave like the real API.

## Code

```
src/server.ts         entry point (port from --port, MOCK_API_PORT or 5180)
src/app.ts            HTTP server: CORS, JSON, route matching, errors
src/auth/             fake Supabase: accounts, signed tokens, /auth/v1 routes
src/routes/           API handlers by area (studios, clients, bookings, planning, inventory, team, marketplace, …)
src/store/            in-memory state, access checks, the planner and the stock ledger
src/fixtures/         sample data: seed() builds the fixed records, populate() generates bookings, requests, stock
tests/                Vitest: sign-in with the real Supabase client, the spec coverage, data and mutations
```

## Adding data or an endpoint

- **More sample data:** add rows to the tables in `src/fixtures/*` (studios and clients in `studios.ts`, the price list
  and bays in `services.ts`, materials and recipes in `inventory.ts`, requests in `requests.ts`, other studios and
  reviews in `marketplace.ts`). Use `stableId('kind:key')` for ids, so links survive restarts, and `at(today, days,
'HH:mm')` for dates. Generated bookings come from `fixtures/bookings.ts` (fixed random seed).
- **A new endpoint:** after the spec changes (`pnpm generate`), the spec test lists what is missing. Add a
  `route(method, path, handler)` to the area's file in `src/routes/` with the path exactly as the spec writes it, and
  return the generated model with `satisfies` so the shape stays checked. Throw `problem(status, code, detail)` for
  errors.
- **New state:** add the record type to `src/store/types.ts`, a field to `MockState` in `src/fixtures/seed.ts`, and seed
  it there.
