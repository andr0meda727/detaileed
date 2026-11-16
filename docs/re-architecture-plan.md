# Detaileed: re-architecture execution plan (Phases 1–4, with 5–7 outlined)

## Context

Phase 0 (hygiene) is done: 9 commits on `refactor/phase-0-hygiene` (env-based API URL, local Tailwind v3 build, ESLint/Prettier, strict TS, CLAUDE.md). Next we turn the repo into a pnpm + Turborepo monorepo, generate the API client from OpenAPI, add a real router and reorganise the dashboard into feature slices. This removes the "hard to find things / fragile" problems and prepares a home for the public marketplace (`apps/web`, Next.js) later.

User decisions: **pnpm**; **merge each phase into local `main` (fast-forward, no push), then branch the next phase from `main`**; **stay on Tailwind v3** until Phase 5. Rules from `CLAUDE.md`: small, single-purpose commits; moves in their own commits; every commit builds and passes lint, typecheck and tests; before each commit run prettier and eslint --fix on the changed files, then `lint`, `typecheck`, `test` (and `build` for config/deps/routing/styles); no pushing.

## Status

| Phase                   | State                                                                             |
| ----------------------- | --------------------------------------------------------------------------------- |
| 0: hygiene              | done (merged to `main`)                                                           |
| 1: monorepo             | done (merged to `main`)                                                           |
| 2: generated API client | done (merged to `main`); views move to the generated hooks per feature in Phase 4 |
| 3: router               | done (merged to `main`)                                                           |
| 4: feature slices       | done (merged to `main`); import rules enforced by ESLint                          |
| 5: design system        | done (merged to `main`); Tailwind v4, `@detaileed/ui` with theme + components     |
| 6: foundations          | done (merged to `main`); spec refresh, studio time zone, vehicle size, services   |
| 7–10: backend catch-up  | planned (see "Catching up with the backend")                                      |

Update this table when a phase is merged. Implement phases in order, following the commit lists below.

## Phase 1: monorepo (branch `refactor/phase-1-monorepo`)

Target layout:

```
apps/dashboard/        index.html, package.json (@detaileed/dashboard), vite.config.ts, tsconfig.json,
                       tailwind.config.js, postcss.config.js, eslint.config.js, Dockerfile, nginx.conf,
                       .env.example, metadata.json, src/ (all app code + images), tests/
packages/config/       tsconfig.base.json, eslint.js, prettier.json  (@detaileed/config)
root:                  package.json (scripts only), pnpm-workspace.yaml, turbo.json, .gitignore,
                       .dockerignore, .prettierrc.json → from config, CLAUDE.md, docs/, README.md, v6.json (until Phase 2)
```

Commits:

1. **`refactor: move dashboard app into apps/dashboard`**: `git mv` the source dirs (`App.tsx index.tsx index.css apiClient.ts types.ts constants.ts vite-env.d.ts components contexts features hooks services utils views images`) to `apps/dashboard/src/`, and the app configs (`index.html package.json vite.config.ts tsconfig.json tailwind.config.js postcss.config.js eslint.config.js Dockerfile nginx.conf .env.example metadata.json tests`) to `apps/dashboard/`. Physically move the untracked `.env` and `.env.local` too. The only content edits are the path fixes needed to keep it building (small enough that git still detects renames): `index.html` script `src="/src/index.tsx"`; `@` alias → `./src` in `vite.config.ts` and `tsconfig.json`; tailwind `content` globs → `./src/**`; test imports `../../x` → `@/x`. Verify with `npm i && npm run build/test/lint/typecheck` inside `apps/dashboard`.
2. **`build: switch to pnpm workspaces and turborepo`**: root `package.json` (`private`, `packageManager: pnpm@<ver>`, scripts `dev/build/test/lint/typecheck/format` → `turbo run …`), `pnpm-workspace.yaml` (`apps/*`, `packages/*`), `turbo.json` (tasks build [outputs `dist/**`], test, lint, typecheck, dev [persistent, no cache], generate), and a rename of the dashboard package to `@detaileed/dashboard`. Run `pnpm import` from the old `package-lock.json` (keeps the resolved versions), then delete `package-lock.json`. `.gitignore` gets `.turbo`.
3. **`chore: add shared config package`**: `packages/config` with `tsconfig.base.json` (the current compilerOptions, strict), `eslint.js` (the current flat config exported as a function/array), and `prettier.json`. The dashboard `tsconfig.json`, `eslint.config.js` and root Prettier config extend or import it. Lint and typecheck results stay identical.
4. **`build: build dashboard docker image from monorepo`**: `apps/dashboard/Dockerfile` becomes multi-stage: `turbo prune @detaileed/dashboard --docker` → `pnpm install --frozen-lockfile` → `pnpm turbo build --filter=@detaileed/dashboard` → nginx stage copies `apps/dashboard/dist`. Root `.dockerignore`. In the workflow: `context: .`, `file: apps/dashboard/Dockerfile`, `paths:` = `apps/dashboard/**`, `packages/**`, `pnpm-lock.yaml`, `turbo.json`, workflow file. **The image name stays `detaileed-frontend`** so the deployment keeps working.
5. **`ci: add pr checks workflow`**: `.github/workflows/ci.yml` runs on PRs and pushes: pnpm setup, `pnpm install --frozen-lockfile`, `pnpm turbo lint typecheck test build`.
6. **`docs: update CLAUDE.md for monorepo`**: switch commands to pnpm/turbo (`pnpm --filter @detaileed/dashboard …`), describe the layout, mark Phase 1 done.

Verify: `pnpm i`, `pnpm turbo build lint typecheck test` green; `pnpm dev` serves the app the same as before; `docker build -f apps/dashboard/Dockerfile .` works, and running the container serves the app (SPA fallback OK). Then merge to `main`.

## Phase 2: generated API client (branch `refactor/phase-2-api-client`)

1. **`refactor: move openapi spec into packages/api-client`**: `git mv v6.json packages/api-client/openapi.json` (pure move).
2. **`feat: scaffold api-client package with fetcher`**: `packages/api-client` (`@detaileed/api-client`, exports `src/index.ts`). `src/fetcher.ts` ports from `apps/dashboard/src/apiClient.ts`: `ApiError`, `extractApiError`, `handleResponse` (204/empty body), and the header building (Bearer token, `X-Studio-Id`), all through `configureApiClient({ baseUrl, getToken, getStudioId })`, so the package doesn't import Supabase or React context and can run on a Next.js server later. Unit tests for the fetcher (vitest, mocked `fetch`): headers, 204, JSON and text errors.
3. **`feat: generate typed react-query client with orval`**: `orval.config.ts` (input `openapi.json`, `mode: 'tags-split'`, `client: 'react-query'`, `mutator: src/fetcher.ts`), script `generate`, and a turbo `generate` task that runs before `build`/`typecheck`. **The generated code is committed** (simpler Docker/CI). The CI step runs `generate` and fails if `git diff` shows changes. If Orval chokes on OpenAPI 3.1, fall back to `@hey-api/openapi-ts` with its TanStack Query plugin (same mutator idea).
4. **`refactor: wire dashboard to api-client config`**: in the dashboard, `src/shared/api.ts` calls `configureApiClient` with the Supabase token and the selected studio (`getSelectedStudioId` from `contexts/StudioContext.tsx`). **Base URL semantics:** spec paths already contain `/api/...`, so `VITE_API_URL` becomes the **origin** (`''` in dev → Vite proxy `^/api/.*`; prod default `https://api.detaileed.com`). The legacy `apiClient.ts` derives its base as `${origin}/api` so both coexist. Update `.env.example`, CLAUDE.md, and the CI var note. (Check: what does `.env.local`'s `http://localhost:3000` point at? The spec's `servers` says `localhost:5174`; confirm with the user when we get here.)
5. **`refactor: map mutation errors to toasts globally`**: a `QueryClient` with `MutationCache({ onError })` using `getApiErrorMessage` (`utils/errorHandler.ts`) plus the toast, with a `meta.skipGlobalError` opt-out for forms that show errors inline.
6. **`refactor: drop localStorage api cache`**: remove `CACHE_PREFIX`/`onCacheHit` from `apiClient.ts`, its callers, and the cleanup in `App.tsx` `handleLogout`.

Migrating views to generated hooks happens per feature in Phase 4. Verify: `pnpm generate` is deterministic; all checks green; manual smoke test (login → studio → bookings list → create booking).

## Phase 3: router (branch `refactor/phase-3-router`)

Use TanStack Router, file-based (`@tanstack/react-router`, `@tanstack/router-plugin/vite`, devtools in dev only). Commits:

1. `build: add tanstack router` (deps + vite plugin + empty `src/routes/__root.tsx` + `src/app/router.tsx`; the old App is still rendered by the root route, so behaviour doesn't change yet)
2. `feat: add auth context and public auth routes`: `login`, `set-password` (replaces the hash sniffing in `App.tsx`), `accept-invitation` (`?token` via zod `validateSearch`; the "Zaloguj się" flow becomes navigation to `/login?redirect=...`). Router context `{ queryClient, auth }`; `onAuthStateChange` → `router.invalidate()`.
3. `feat: add authenticated layout and studio selection route`: `_auth.tsx` (`beforeLoad` redirect), `_auth/studios.tsx`.
4. `feat: add studio layout route with sidebar links`: `_auth/s.$studioId.tsx` holds the Sidebar (`<Link activeProps>`) and the mobile menu state; it also syncs the `$studioId` param into `StudioContext`, which keeps the `resetQueries` behaviour; `getSelectedStudioId` reads the active studio.
5. One commit per screen or small group: dashboard (index), tasks, clients, inventory (`?category&q`), reports (`?from&to`), team (`beforeLoad` role guard via `utils/studioRole.ts`), settings/studio, settings/user, archived (it gets a route; it's currently unreachable).
6. `refactor: remove view switch from App`: delete `ViewType`, `renderView`, the `onNavigate`/`onOpenMenu` props; `App.tsx` becomes about 20 lines rendering `<RouterProvider>`; `/` redirects to the last studio or `/studios`.
7. `test: render smoke test through memory router`

Verify each screen by URL, refresh, back/forward, the employee `/team` redirect, the invite link and password recovery; nginx fallback in the Docker image.

**As built:** the screen routes landed in one commit together with the removal of the view switch, because the old sidebar and the new routes could not coexist. Only the inventory category (`?category`) and the report range (`?from&to`) are in the URL; search boxes and the tasks tab still use component state. `/studios` renders without the sidebar.

## Phase 4: feature slices (one branch per feature, e.g. `refactor/phase-4-bookings`)

Layout `apps/dashboard/src/{app,routes,features,shared}`; each feature has `api/ components/ hooks/ model/ index.ts`. Per feature:

1. a **move-only commit** (`git mv` into `features/<name>/…`, fixing import paths only)
2. a commit switching its data access to the generated hooks, deleting its `services/*Service.ts` + `hooks/use*.ts` + DTOs from `types.ts`
3. split commits for oversized components (target ≤ 250 lines)
4. `index.ts` public API, with routes importing only from it

Order: `shared` (utils, ToastContext, delete the deprecated `components/ui/useToast.tsx`) → `studios`+`auth` → `bookings` (`buildBookingCreateDto`, `CreateBookingModal`, `useClientVehicleSearch`, booking parts of `Dashboard.tsx`/`TasksView.tsx`) → `clients`+`vehicles` → `services` → `inventory` → `team` → `reports` → `dashboard-home` → delete the empty legacy dirs + `apiClient.ts`. The last commit adds `eslint-plugin-boundaries` (`app → routes → features → shared`, features only via `index.ts`, no `fetch` outside `api-client`), makes `react-hooks/set-state-in-effect` an error, and rewrites `docs/frontend-architecture.md`.

**Progress notes (Phase 4):**

- Final layout: see `docs/frontend-architecture.md`. No legacy `views/`, `services/`, `hooks/`, `apiClient.ts` or `types.ts` remain.
- The dashboard activity feed shows static sample entries; replace it when the API has an activity log.
- Paged lists: `shared/lib/paging.ts#fetchAllPages` loads every page for screens that compute over the whole list (bookings today). Replace with server-side filtering/paging per screen later.
- Money from the API is złoty (`formatPln` in `shared/lib/money.ts`); the old `/ 100` conversions were removed for bookings. Check the same for other features as they move.
- Creating a studio calls `apiFetch` directly (`features/studios/api/studioService.ts`): the endpoint is not in the API spec yet. Switch to the generated function once it is.
- `InventoryItemModal` is ~295 lines (one form); split the category picker out if it grows.
- Inventory movements, recipes, consumptions and the forecast exist in the API but have no UI yet.
- `CreateBookingModal` (bookings, ~560 lines) still needs splitting: client/vehicle picking, inline new client, services and price.
- The API spec typed `VehicleSize` and the other enums as integers although the API sends names; fixed in the backend (`Describe enums as strings in the OpenAPI spec`) and the spec updated in Phase 6.
- Booking mutations skip the global error toast (`meta.skipGlobalError`) because the screens toast themselves.

## Phase 5: design system and Tailwind v4 (branch `refactor/phase-5-ui`)

Goal: one design system that the dashboard and the future marketplace (`apps/web`) share: the tokens in
`packages/ui/src/theme.css` (Tailwind v4 `@theme`) and the generic components in `@detaileed/ui`. Tailwind is
upgraded first, so the package is written for v4 from the start.

Before the upgrade:

1. `chore: remove unused phantom-ui dependency` (never imported).
2. `refactor: delete unused StatCard` (no callers; the dashboard has its own stats cards).

Tailwind v4 (the upgrade tool needs a clean working tree; **the user runs it**:
`cd apps/dashboard && pnpm dlx @tailwindcss/upgrade`):

3. `build: upgrade dashboard to tailwind v4`: the tool's output (config → CSS `@theme`, renamed utilities such
   as `shadow-sm`→`shadow-xs`, `outline-none`→`outline-hidden`, `bg-opacity-*` → `/opacity`), reviewed, plus
   fixes for what it misses. v4 changes some defaults (border colour, ring width, button cursor); keep the old
   look where it matters with small base styles.
4. `build: use the tailwind vite plugin`: `@tailwindcss/vite` instead of PostCSS; drop `postcss.config.js` and
   `autoprefixer`.

`packages/ui` (source-only package like `api-client`: `exports` point at `src`, no build step):

5. `feat: scaffold ui package`: `@detaileed/ui` (package.json, tsconfig, eslint, vitest + jsdom), peer deps
   `react`, `lucide-react`. The dashboard depends on it (`workspace:*`).
6. `refactor: move design tokens into the ui package`: `packages/ui/src/theme.css` holds `@theme` (colours,
   fonts, keyframes/animations) and the shared utilities (`floating-card`, `skeleton`, `mesh-bg`, …). The
   dashboard's `index.css` becomes `@import "tailwindcss"; @import "@detaileed/ui/theme.css";` plus
   `@source` for the package's components.
7. `refactor: move generic components into the ui package`: `git mv` of `Modal`, `FormInput`, `FormSection`,
   `Skeleton`, `EmptyState`, `LoadingSpinner`, `Toast` + `ToastContext` + `useToast` to `packages/ui/src`, and
   imports switched to `@detaileed/ui` (move-only; app-specific `GlobalHeader`, `mobileMenu`, `cardGrid` and
   `NameForm` stay in `shared/ui`).
8. `feat: add Button and Badge to the ui package`: variants for what the screens repeat today (primary / secondary
   / ghost / danger buttons; status, role and plate badges). Tests for the variants.
9. Adoption commits, one per feature or two: replace hand-styled buttons and badges with `Button`/`Badge`.
10. `refactor: use theme tokens instead of hard-coded colours`: the `#1a2e1e`-style hex values in `className`
    and inline `style` become tokens (`bg-green-deep`, …).
11. `docs: describe the ui package and mark phase 5 done` (CLAUDE.md, frontend-architecture.md, this plan).

Deferred to Phase 6, where they are first used: `Select`, `StarRating` and other marketplace-only components.

Verify: `pnpm check`, a Docker build (the package must be part of `turbo prune`), and a visual check of every
screen by the user after step 3 and at the end. The upgrade is the risky step for the look of the app.

Notes from doing it:

- v3 never generated opacity variants of the custom colours (`bg-amber/15`, `ring-cream-warm/20`, …: plain `var()`
  colours have no alpha channel), so those tints and focus rings only appear since v4.
- Not converted on purpose: the login/auth screens and the studio-create button (bespoke look), icon-only buttons
  (a later `IconButton`), role badges and the confirm button in the status dialog (solid colours, no matching
  variant), and colours passed to SVG props (charts, icons), which stay hex.
- `ArchivedView`'s "Eksportuj" button has no handler yet.

## Catching up with the backend (phases 6–10)

The backend (`detailflow-api`, see its `docs/api-reference.md`, `api-conventions.md` and `marketplace-roadmap.md`) now
has the whole marketplace: the public map search, studio pages, reviews, price estimates and free times, customer
accounts (profile, garage, booking requests, reviews), the staff side of requests, planning (bays, opening hours,
day board, free times) and the inventory ledger (movements, recipes, consumption, forecast). The generated client
already has hooks for all of it, but the dashboard calls 34 of the 85 operations; there is no customer frontend.

Differences from what the old outline assumed: studios are addressed by id (no slugs), there is no cities endpoint
and no revalidate webhook (the public endpoints are output-cached for 60 s, so pages revalidate on a timer).

Order: foundations first, then the marketplace end to end (studios publish and answer requests, customers find
them and send requests), then planning, which makes requests precise, then the inventory extras.

### Phase 6: foundations (branch `feat/phase-6-foundations`)

1. `build: update the api spec`: the spec from the backend's Debug build, with enums typed as strings (needs the
   backend fix `Describe enums as strings in the OpenAPI spec`). Regenerate; drop the casts the integer enums
   needed (tests, `toBooking`).
2. `refactor: create studios with the generated client` (`POST /api/studios` is in the spec now; remove `apiFetch`).
3. Studio time zone (`api-conventions.md`, "Dates and times"): `shared/lib/studioTime.ts` (format a UTC moment in the
   studio's zone, turn a local date and time in that zone into UTC, the studio's "today"), tests across a DST change;
   then one commit per screen that shows or sends times (bookings, calendar, dashboard, reports, archive). Owner
   setting for the zone (`PUT /api/studios/time-zone`).
4. Vehicle size: shared labels (`Small` = "Miejskie", …), size in the client/vehicle forms and lists, sent on create.
5. Services: category, prices per vehicle size ("na zapytanie" when empty) and duration in the services settings;
   labels for categories.

Decisions for phases 7–10: the customer site lives on **detaileed.com** (+ www; the dashboard stays on
app.detaileed.com); maps use **MapLibre with OpenFreeMap** tiles (style URL in an env var). The backend changes they
need are merged on `bugs-fixing`: CORS origins from configuration (dev includes localhost:3000/3001), `timeZone` on
the public listing and availability, email links to `/s/{studioId}/requests?id=` (dashboard) and `/konto/rezerwacje`
(web). Manual step: Supabase redirect URLs for `https://detaileed.com/**`, `https://www.detaileed.com/**`,
`http://localhost:3001/**`.

### Phase 7: studio side of the marketplace (branch `feat/phase-7-studio-marketplace`)

0. `build: update the api spec` (copy `detailflow-api/docs/openapi.json`, `pnpm generate`; `timeZone` on listing and
   public availability).
1. `build: add maplibre to the ui package`: `maplibre-gl` + `react-map-gl` (peer deps of `@detaileed/ui`).
2. `feat: add MapView and MapPicker to the ui package` (`packages/ui/src/map/`): `MapPicker({ value, onChange, styleUrl })`
   (click/drag a pin, "use my location"), `MapView({ pins, selectedId, onPinClick, onBoundsChange, styleUrl })`; pure
   helpers (`boundsToQuery`, rounding to 4 decimals) tested; components tested with maplibre mocked (no WebGL in jsdom).
   Apps import `maplibre-gl/dist/maplibre-gl.css`; the dashboard lazy-loads the map (`React.lazy`) to keep the bundle small.
   Env `VITE_MAP_STYLE_URL` (+ `.env.example`, Dockerfile build arg, deploy workflow var), `VITE_WEB_URL` for preview links.
3. `feat: add the marketplace listing api` (`features/marketplace/api/listing.ts`): `useListing()` (404 `LISTING_NOT_FOUND`
   → `null`, i.e. not created yet), `useSaveListing()`, `usePublishListing()`, `useUnpublishListing()`; `model/types.ts`
   (`toListing` normaliser: lat/lng/rating/count to numbers), `model/schemas.ts` (name, description ≤ 2000, address, city,
   phone with the API's phone regex, required pin), `model/listingForm.ts` (defaults/mapper) + tests.
4. `feat: edit the public profile in studio settings`: tab "Profil publiczny" in `features/settings/.../StudioSettingsView.tsx`
   (owner edits, staff read-only): form + `MapPicker`; status card (published/not, rating, review count, number of services
   with a link to the services tab); publish/unpublish with `LISTING_HAS_NO_SERVICES` explained; "Zobacz stronę" link to
   `${VITE_WEB_URL}/studio/{studioId}` when published. Component tests.
5. `feat: add the booking requests api` (`features/booking-requests/`): `useBookingRequests({ status, page })`,
   `usePendingRequestsCount()` (status=Pending, pageSize 1 → `totalCount`, refetch every 60 s), `useRequestPlan(id)`,
   `useAcceptRequest()`, `useRejectRequest()` (invalidate requests, bookings, schedule day); `model/types.ts`
   (`toBookingRequest` normaliser), `model/statuses.ts` (Pending/Accepted/Rejected/Withdrawn labels + badge tones),
   `model/errors.ts` (code → Polish message: `BOOKING_REQUEST_ALREADY_DECIDED`, `NO_BAY_AVAILABLE`, `BAY_TAKEN`,
   `BOOKING_REQUEST_NOT_FOUND`) + tests.
6. `feat: add the booking requests screen`: route `src/routes/_auth/s/$studioId/requests.tsx` with `validateSearch`
   `{ status?, id? }`; `RequestsView` (status filter, cards: customer + phone, car + size, services with prices or
   "na zapytanie", preferred time in the studio zone, estimate, notes, age); `RequestDetailsModal` opened by `?id=`:
   details; with `planningEnabled` the plan (preferred fits / outside hours, alternatives as selectable chips with bay,
   competing requests); accept form (date + time in studio zone defaulting to preferred or the picked alternative, price
   defaulting to the estimate, bay from the plan), reject form (reason ≤ 500). Accepted shows the booking. Tests.
7. `feat: show pending requests in the sidebar`: nav item "Zapytania" (`app/layout/Sidebar.tsx`) with a pending badge.
8. `docs:` CLAUDE.md/frontend-architecture (marketplace + booking-requests features, map env), plan status.

### Phase 8: customer site `apps/web` (branch `feat/phase-8-web`)

1. `refactor: move domain helpers into a shared package`: new `packages/domain` (`@detaileed/domain`, pure TS): `git mv`
   `studioTime.ts`, `vehicleSize.ts`, `serviceCategory.ts`, `money.ts` (+ their tests) from `apps/dashboard/src/shared/lib`;
   imports rewritten (move-only commit; scaffold the package in a commit before it).
2. `build: mark interactive ui components as client components`: `'use client'` at the top of `packages/ui` files that use
   hooks/handlers (Modal, Toast*, useToast, Button, Select, map/*); check the Vite build has no new warnings.
3. `feat: scaffold the web app`: Next.js 16 App Router, TypeScript strict (`@detaileed/config`), ESLint (base + Next plugin),
   Tailwind v4 via `@tailwindcss/postcss` importing `@detaileed/ui/theme.css` (+ `@source` for packages/ui), fonts with
   `next/font/google` (DM Sans, DM Serif Display, Syne), `output: 'standalone'`, `transpilePackages` for the workspace
   packages, dev port 3001, rewrite `/api/:path*` → `NEXT_PUBLIC_API_URL` in dev; turbo outputs `.next/**` (minus cache);
   vitest for model tests; `lang="pl"` layout with header/footer.
   Env: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`,
   `NEXT_PUBLIC_MAP_STYLE_URL`, `NEXT_PUBLIC_DASHBOARD_URL`, `NEXT_PUBLIC_SITE_URL`; `.env.example`.
4. `feat: wire the api client in the web app`: server side `lib/api/server.ts` (configure base URL once; public endpoints
   only, called with `{ next: { revalidate: 60 } }` to match the API's 60 s output cache; signed-in calls never run on the
   server with the global config); client `app/providers.tsx` (QueryClient with global mutation error toasts as in the
   dashboard's `shared/queryClient.ts`, `ToastProvider`, `configureApiClient` with the Supabase token).
5. `feat: customer sign-up and sign-in`: `@supabase/ssr` (`lib/supabase/{server,client}.ts`, `proxy.ts` refreshing the
   session cookie), pages `/logowanie`, `/rejestracja` (first/last name in `options.data`, email confirmation),
   `/auth/callback` route handler, sign-out; `?next=` return path. Staff accounts can sign in too.
6. `feat: map search on the home page` (`/`): client `MapSearch` with `MapView` + result list; URL state
   `?lat&lng&z&kategoria&rozmiar` (pure parse/serialize in `model/searchParams.ts`, tested); search on map move (debounced,
   `useGetApiPublicStudios` with bounds, keep previous data); pins with "od X zł"; cards with rating, categories, from price
   for the chosen size; filters (category, vehicle size); "Moja lokalizacja"; empty and error states. Default view: Poland.
7. `feat: studio page` (`/studio/[id]`, server component, revalidate 60, `notFound()` on 404): header (name, city, address,
   phone, rating), small map, services by category with the price for the chosen size (client size picker, default
   Medium), live estimate (`POST .../estimate`), reviews with "Pokaż więcej" (cursor, `useInfiniteQuery`), CTA to book;
   `generateMetadata` (title, description, OpenGraph), JSON-LD `AutoRepair` (address, geo, aggregateRating). Times in the
   listing's `timeZone` (fallback Europe/Warsaw).
8. `feat: booking request flow` (`/studio/[id]/rezerwuj`, signed in, else redirect to `/logowanie?next=`): profile check
   (404 `CUSTOMER_PROFILE_NOT_FOUND` → inline profile form), services (preselected from the studio page), car (garage pick
   or one-off car with size), time (planning on: public availability slots for 14 days grouped by studio day; off: date +
   time as preferred time), notes, summary with estimate → `POST /api/me/booking-requests`; code → message map
   (`BOOKING_REQUEST_LIMIT`, `OUTSIDE_OPENING_HOURS`, `BOOKING_REQUEST_TOO_SOON`, `CUSTOMER_PROFILE_REQUIRED`,
   `STUDIO_NOT_FOUND`, `BOOKING_REQUEST_UNKNOWN_SERVICES`, `CUSTOMER_VEHICLE_NOT_FOUND`); success → `/konto/rezerwacje`.
   Pure helpers (slot grouping by day in zone, request body mapper) tested; step components tested with mocked hooks.
9. `feat: customer account` (`/konto` layout, signed in): `/konto` profile (name, phone), `/konto/samochody` garage CRUD
   (max 10, `CUSTOMER_GARAGE_FULL`, `CUSTOMER_VEHICLE_EXISTS`), `/konto/rezerwacje` history (status badges, studio link,
   preferred time, estimate, accepted booking time/price, rejection reason, withdraw while pending), `/konto/opinie`
   (pending visits → rating 1–5 + comment; `REVIEW_ALREADY_EXISTS`, `REVIEW_PERIOD_OVER`). One commit per page.
10. `feat: sitemap, robots and error pages`: `sitemap.ts` (published studios via public search over a world bounding box,
    paged), `robots.ts`, `not-found.tsx`, `error.tsx`, loading states.
11. `build: web docker image and deploy`: `apps/web/Dockerfile` (turbo prune → build → standalone `node` runner),
    workflow job for image `detaileed-web` with `NEXT_PUBLIC_*` build args; `pnpm check` covers lint/typecheck/test/build.
12. `docs:` CLAUDE.md (apps/web layout, commands, env), frontend-architecture, plan status.

### Phase 9: planning in the dashboard (branch `feat/phase-9-planning`)

1. `feat: add the planning api` (`features/planning/api`): bays (list/create/rename/delete), schedule (get/put),
   closures (add/remove), day board, staff availability; normalisers in `model/` + tests.
2. `feat: manage bays` (settings tab "Planowanie", owner edits): list, add, rename, deactivate (`BAY_HAS_UPCOMING_BOOKINGS`,
   `BAY_LIMIT_REACHED` 20).
3. `feat: edit opening hours and planning rules`: per weekday several periods (add/remove, copy Monday to weekdays),
   buffer, slot step (15/30/60), lead hours, size multipliers; `model/scheduleForm.ts` (`HH:mm` ↔ `HH:mm:ss`, overlap check
   client-side) + tests; API codes `OVERLAPPING_OPENING_PERIODS`, `INVALID_OPENING_PERIOD`, `TOO_MANY_OPENING_PERIODS`,
   `INVALID_PLANNING_RULES` shown on the form. Empty hours = planning off (explain it).
4. `feat: manage closures` (date + reason list, add/remove).
5. `feat: day board` (route `/s/$studioId/board?date=`, sidebar "Grafik"): day navigation in studio days, bay lanes on a
   time axis (earliest opening → latest closing), booking blocks, free gaps, utilisation %, unassigned bookings, pending
   requests linking to `/requests?id=`; pure layout model (moment → minutes from the studio day start) tested.
6. `feat: free slots and bays in the booking form`: when planning is on, `BookingScheduleSection` lists slots from
   `/api/availability` for the chosen services and the picked car's size; picking one sets date/time and `bayId`; optional
   bay select; `NO_BAY_AVAILABLE`/`BAY_TAKEN` messages; booking schema gains `bayId`.
7. `feat: show bays and end times on bookings` (card, details: `bay.name`, `endsAt` in studio zone).
8. `docs:` + plan status.

### Phase 10: inventory ledger (branch `feat/phase-10-inventory`)

1. `feat: add the inventory ledger api`: movements (list paged, add), recipes, size factors, consumption (+ correct),
   accuracy, forecast; normalisers + tests.
2. `feat: item history with deliveries and stocktakes`: item details modal with movement history and two forms
   (Purchase quantity + note, Stocktake counted quantity); stock is read-only on edit (changes go through movements).
3. `feat: materials per service` (owner): "Materiały" section in the service form (item + quantity for a Medium car).
4. `feat: material size factors` (owner, inventory settings).
5. `feat: what a visit used`: in booking details of completed bookings, consumption table (norm, estimated, actual) with
   editable actual amounts (`CONSUMPTION_NOT_FOUND` = not recorded yet).
6. `feat: stock forecast and estimate accuracy`: inventory tab "Prognoza" (days left, runs out at in studio zone, planned
   use, stock after planned) and an accuracy table; dashboard stock alerts use `runsOutAt`.
7. `docs:` + plan status.

Not in the API yet (from the backend reference): editing a studio's name/phone/address, `statusId` on bookings.

## Critical files

`apps/dashboard/src/App.tsx`, `apiClient.ts`, `contexts/StudioContext.tsx`, `components/Sidebar.tsx`, `views/**`, `vite.config.ts`, `tsconfig.json`, `Dockerfile`, `.github/workflows/docker-publish.yml`, `v6.json`.
Reuse: `utils/errorHandler.ts#getApiErrorMessage`, `utils/studioRole.ts`, `utils/selection.ts`, `utils/validations.ts`, `features/bookings/utils/buildBookingCreateDto.ts`, `hooks/useClientVehicleSearch.ts`, `components/ui/Modal.tsx`, `contexts/ToastContext.tsx`.

## Verification (every commit / phase)

- Per commit: prettier + eslint --fix on the changed files; `pnpm turbo lint typecheck test` (+ `build` when relevant).
- Per phase, before merging to `main`: full build, a Docker build where the Dockerfile changed, and the manual regression in `docs/refactor-baseline-checklist.md` (the user runs `pnpm dev` and clicks through; I can't log in to Supabase myself).
