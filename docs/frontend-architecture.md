# Dashboard architecture

How `apps/dashboard/src` is organised, and the rules that keep it that way. ESLint enforces the import rules
(`featureSlices` in `packages/config/eslint.js`), so a violation fails `pnpm lint` and CI.

## Layers

```
src/
  app/        composition root: router, auth guards, api client setup, layout (Sidebar)
  routes/     TanStack Router file routes; thin: guards, search params, which screen to render
  features/   one folder per business area, each with an index.ts
  shared/     generic code with no business knowledge: lib/, ui/, hooks/, queryClient.ts
  App.tsx, index.tsx, routeTree.gen.ts   entry points (routeTree.gen.ts is generated, committed)
```

Imports flow one way: `app → routes → features → shared`.

- `shared` never imports a feature, a route or `app`.
- A feature imports `shared`, and other features **only through their `index.ts`**. Everything else in a
  feature folder is private to it.
- Routes and `app` import features through `index.ts` too.
- Nothing calls `fetch` directly; requests go through `@detaileed/api-client` (generated hooks, or `apiFetch`
  for endpoints not in the spec yet).

## A feature

```
features/<name>/
  api/          React Query hooks on top of the generated client (queries, mutations, invalidation)
  components/   screens and the components they are built from
  hooks/        UI hooks used by several components of the feature
  model/        types, pure functions (filters, formatting, normalisers), zod form schemas; unit tested
  index.ts      the public API: what other features, routes and app may use
```

Features: `auth`, `studios`, `bookings`, `clients` (clients and their vehicles), `services`, `inventory`,
`team`, `settings` (the studio settings screen, composed of tabs from services, inventory and team),
`reports`, `dashboard-home`, `marketplace` (the studio's public profile on the customer map: listing form, pin, publish),
`booking-requests` (requests customers send from the map: list, plan, accept/reject; pending count in the sidebar).

## Data

- Server state lives in React Query only. Each feature's `api/` wraps the generated functions and owns the
  query keys it invalidates. Generated query keys start with the API path (`['/api/Bookings', …]`), so
  invalidating that prefix refreshes every list of that resource.
- Responses are normalised in the feature's `model/` (`toBooking`, `toInventoryItem`, `toEmployee`): the API
  may send decimals and ids as strings, and money is in złoty (`formatPln` in `@detaileed/domain/money`).
- Paged lists that a screen computes over (stats, calendars) load every page with
  `shared/lib/paging.ts#fetchAllPages`. Prefer server-side filtering and paging for new screens.
- Mutation errors are toasted globally (`shared/queryClient.ts`); a mutation whose screen shows the error
  itself sets `meta: { skipGlobalError: true }`. Turn API errors into text with `getApiErrorMessage`.
- The current studio comes from the URL (`/s/$studioId`). The layout route checks it against the user's
  studios and makes it the active one (`features/studios/model/activeStudio.ts`), which the api client sends as
  `X-Studio-Id`. Components read it with `useStudio()`.

## UI state

- URL state (filters worth sharing) goes in the route's `validateSearch`.
- Derive values instead of syncing them with `useEffect` + `setState` (an ESLint error). To reset a form
  when a modal opens, remount it with a new `key`.
- Generic UI comes from `@detaileed/ui` (`packages/ui`): `Button`, `Badge`, `Modal`, `FormInput`, `FormSection` (steps of a
  longer form), `Skeleton`, `EmptyState`, `LoadingSpinner`, `useToast`. `shared/ui` keeps only dashboard-specific UI.
- Styling: Tailwind v4. Tokens, base styles and shared utilities live in `packages/ui/src/theme.css`, which every app
  imports after `tailwindcss` (and adds `@source` for the package so its classes are generated). Use tokens, not hex.
- Picking a client/vehicle (or creating a client with a vehicle) inside another form: `ClientVehiclePicker`
  from `features/clients`. Nested parts that cannot be a `<form>` submit with `handleSubmit` on a button.
- Keep components under about 250 lines.

## Tests

`apps/dashboard/tests` mirrors `src`. Pure functions in `model/` get unit tests; route guards are tested
through a memory router (`tests/app/routes.test.tsx`).
