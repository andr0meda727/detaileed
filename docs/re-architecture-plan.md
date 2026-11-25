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
| 7: studio marketplace   | done (merged to `main`); maps, public profile, booking-request inbox              |
| 8: customer site        | done (merged to `main`); `apps/web` Next.js, map search, studio pages, requests   |
| 9: planning             | done (merged to `main`); bays, hours, closures, day board, slots in bookings      |
| 10: inventory ledger    | done (merged to `main`); history, deliveries, recipes, consumption, forecast      |
| 11: grafit redesign     | done on `redesign/grafit` (final PR to `main`); Grafit look, themes, mock API     |

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

> Later change (branch `refactor/monorepo-structure`): `_auth` is now `_signed-in`, and login, set-password and
> accept-invitation sit in an `(auth)` route group. URLs are unchanged; see `docs/architecture.md`.

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

- Final layout: see `docs/architecture.md`. No legacy `views/`, `services/`, `hooks/`, `apiClient.ts` or `types.ts` remain.
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

> Later change (branch `refactor/monorepo-structure`): `packages/ui/src` is grouped into `components/`, `toast/`,
> `captcha/`, `hooks/`, `map/` and `styles/theme.css`; the package exports are unchanged.

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

The backend (`detaileed-api`, see its `docs/api-reference.md`, `api-conventions.md` and `marketplace-roadmap.md`) now
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

0. `build: update the api spec` (copy `detaileed-api/docs/openapi.json`, `pnpm generate`; `timeZone` on listing and
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

> Later change (branch `refactor/english-urls`): paths and query parameters are now English (`/sign-in`, `/sign-up`,
> `/account/{cars,bookings,reviews,security}`, `/studio/[id]/book`, `?category&size&services`); the Polish ones below
> are gone (no redirects: there were no users yet). The page text stays Polish. All paths are lowercase.
> Later still (branch `refactor/monorepo-structure`): pages sit in the route groups `(public)`, `(auth)` and
> `(customer)`, `src/lib` + `src/components` became `src/shared/{lib,ui}`, and features have `index.ts` entries
> enforced by ESLint; see `docs/architecture.md`.

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

Notes from doing it:

- No dev rewrite of `/api` was needed: the backend's CORS already allows `http://localhost:3001`.
- `@detaileed/domain` also took the API error messages (`apiErrors`) and the shared listing model (`listing`, with
  `priceFor` and `servicesByCategory`); `@detaileed/ui` got `StarRating`, `useIsClient` (portals wait for the
  browser) and labelled `FormInput`s (the label had no `htmlFor`).
- The deploy is a separate workflow (`web-publish.yml`, image `detaileed-web`, its own concurrency group) reusing the
  dashboard's Supabase secrets and `VITE_API_URL`; new repo variables: `WEB_SITE_URL`, `DASHBOARD_URL` (both optional).
- Backend gap: request history (`/api/me/booking-requests`) and pending reviews don't carry the studio's time zone,
  so the account pages show times in `Europe/Warsaw`. Adding `timeZone` to `BookingRequestDto` would fix it.

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

Notes from doing it: stock is read-only when editing an item and the inline stock edit is gone (every change goes
through the ledger); the size factors sit in the settings tab now called "Magazyn". Not done: the dashboard home's
stock alerts still list items below their minimum; showing the forecast's `runsOutAt` there is a small follow-up.

Not in the API yet (from the backend reference): editing a studio's name/phone/address, `statusId` on bookings.

## Phase 11: Grafit redesign (integration branch `redesign/grafit`)

A visual rebuild of both apps and `packages/ui`. The "Forest & Cream" look (DM Sans / DM Serif Display / Syne, green,
cream and amber) gives way to **Grafit**, the direction the user picked from three mockups: monochrome greys, Geist +
Geist Mono, inverted primary buttons, thin borders, no gradients. Reference markup: `docs/design/grafit-mockup/`.

User decisions:

- One look for the dashboard, the customer site and `/for-studios` (the landing goes last).
- Light and dark themes, following the OS by default, with a switch (dashboard user menu, site header) saved per device.
- Every PR targets `redesign/grafit`; the coordinator merges them after green CI and a review. The user reviews one final
  PR `redesign/grafit` → `main` (merging it deploys both apps).
- A mock API with Polish sample data and a fake Supabase sign-in comes first, so every screen can be opened and
  screenshotted in both themes without the real backend; screenshots go into the PR descriptions.
- The work is split between Orca workers (Claude), each in its own worktree and branch, at most about four at once.

### Rules for every task

- **Visual changes only**: behaviour and API calls stay the same. Out of scope: a global search (it was only in the
  mockup), new features, rewording beyond sentence-case labels ("Nowa rezerwacja", not "Dodaj Rezerwację") and dropping
  filler such as the fake "Live Mode" pill. Bug or accessibility fixes in code you are restyling anyway are welcome,
  in their own commits.
- **Only edit the paths your task owns** (task table below). Feature tasks never edit `packages/ui`, `apps/*/src/app`,
  `shared/ui`, routes, `pnpm-lock.yaml` or `apps/mock-api`. Need a shared component, a fixture or a dependency that
  isn't there? Ask the coordinator (`ask`); don't build a private copy.
- **Keep props stable** where other tasks use a component: `GlobalHeader` (11 screens), `CreateBookingModal` and
  `CreateClientModal` (6 screens each) and every existing `@detaileed/ui` component.
- **The old palette stayed defined** (`green-deep`, `cream*`, `amber`, the old fonts and utilities) until T13, so screens
  not migrated yet kept working; migrated code used only the new tokens. T13 removed them.
- AGENTS.md applies in full: small Conventional Commits with the exact subjects below, file moves in their own commits,
  prettier + eslint `--fix` on the changed files, lint, typecheck, test and build green. Commits end with
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`; PR bodies end with
  `🤖 Generated with [Claude Code](https://claude.com/claude-code)`.
- Stage explicit paths only (`git add <files>`); never commit a line-ending-only change.

### Design system (T2a–T2c)

Semantic tokens in `packages/ui/src/styles/theme.css`: `@theme { --color-<name>: var(--<name>) }`, light values on
`:root`, dark values on `[data-theme='dark']`, the same dark values under
`@media (prefers-color-scheme: dark) { :root:not([data-theme]) { … } }` for pages without the script, and
`@custom-variant dark (&:where([data-theme='dark'], [data-theme='dark'] *));`. The base border colour is `border`.

| Token (utility)                                | Use                                       | Dark                                      | Light                       |
| ---------------------------------------------- | ----------------------------------------- | ----------------------------------------- | --------------------------- |
| `background`                                   | page                                      | #0a0a0a                                   | #ffffff                     |
| `subtle`                                       | sidebar, table head, segmented track      | #0f0f0f                                   | #fafafa                     |
| `surface`                                      | cards, inputs, menus, dialogs             | #141414                                   | #ffffff                     |
| `muted`                                        | hover and selected fill, skeleton         | #1c1c1c                                   | #f4f4f5                     |
| `border` / `border-strong`                     | dividers, cards / inputs, outline buttons | #262626 / #383838                         | #e7e7e7 / #d4d4d4           |
| `foreground`                                   | main text                                 | #ededed                                   | #0a0a0a                     |
| `muted-foreground`                             | secondary text                            | #a3a3a3                                   | #525252                     |
| `faint`                                        | meta text, table head, placeholders       | #8f8f8f                                   | #666666                     |
| `primary` / `primary-foreground`               | main button, active pill (inverted)       | #ededed / #0a0a0a                         | #0a0a0a / #ffffff           |
| `ring`                                         | focus ring (2px, offset 2px)              | #a3a3a3                                   | #525252                     |
| `success` / `success-soft`                     | status                                    | #4ade80 / rgba(74,222,128,.12)            | #15803d / #ecfdf3           |
| `info` / `info-soft`                           | status                                    | #7cb4ff / rgba(96,165,250,.12)            | #1d4ed8 / #eff6ff           |
| `warning` / `warning-soft`                     | status                                    | #fbbf24 / rgba(251,191,36,.12)            | #a16207 / #fefce8           |
| `danger` / `danger-soft` / `danger-foreground` | errors, destructive actions               | #f87171 / rgba(248,113,113,.12) / #0a0a0a | #b91c1c / #fef2f2 / #ffffff |
| `star`                                         | rating stars                              | #fbbf24                                   | #d97706                     |
| `overlay`                                      | dialog backdrop                           | rgba(0,0,0,.6)                            | rgba(0,0,0,.4)              |

Type, shape and motion:

- `font-sans` = Geist, `font-mono` = Geist Mono; times, money and counts use `font-mono tabular-nums`; weights 400, 500
  and 600 only.
- `text-xs` meta and table heads, `text-sm` dashboard body and controls, `text-base` site body, page titles
  `text-2xl font-semibold tracking-tight`, the studio name on the site `text-4xl`. No `text-[9–11px] uppercase
tracking-widest` labels.
- Controls 36px high with `rounded-md`; cards and dialogs `rounded-lg` with a 1px border; no shadows on cards (one soft
  shadow on menus and dialogs); status badges are pills with a dot; tables have row borders only.
- 150 ms colour transitions only: no hover lifts, scaling or gradients; respect `prefers-reduced-motion`.
- Dashboard: 240px sidebar (`subtle`, right border), a slim top bar, content up to about 1180px with 28px padding.
  Site: 56px header, 1160px column. Everything works at 390px wide.
- The plain classes in `theme.css` (`.skeleton`, `.floating-card`, …) move into `@layer components` or `@utility`, so
  utilities override them again.

Themes: `packages/ui/src/theme/` exports `THEME_STORAGE_KEY = 'detaileed-theme'` (values `system`, `light`, `dark`),
`themeInitScript` (inline: reads the stored choice, resolves `matchMedia('(prefers-color-scheme: dark)')`, sets
`document.documentElement.dataset.theme` and `style.colorScheme`), `useTheme()` (`useSyncExternalStore` over storage and
the media query: `{ theme, resolved, setTheme }`) and `ThemeSwitch` (Systemowy / Jasny / Ciemny). The dashboard keeps an
inline copy of the script in `index.html` `<head>` with a test that it equals `themeInitScript`; the site renders it
with `dangerouslySetInnerHTML` in the root layout's `<head>` (`suppressHydrationWarning` on `<html>`). Maps pick the
OpenFreeMap positron or dark style from `useTheme().resolved` (the env style URL still overrides both), Turnstile uses
`theme: 'auto'`, Recharts reads CSS variables.

Fonts: the dashboard self-hosts `@fontsource-variable/geist` and `@fontsource-variable/geist-mono` (imported in
`main.tsx`); the site uses `next/font/google` `Geist` and `Geist_Mono` (subsets `latin`, `latin-ext`) as
`--font-geist-sans` / `--font-geist-mono`, mapped in `globals.css`. The old fonts stayed loaded until T13 removed them.

Components: `packages/ui` gets `radix-ui`, `clsx` and `tailwind-merge` (v3), and `cn()` in `src/lib/cn.ts` (tested with
the custom tokens).

- Restyled with backward-compatible props: `Button` (primary, secondary = outline, ghost, danger; `success` kept as an
  alias; new size `sm`; icon-only needs `aria-label`), `Badge` (tones neutral, info, success, warning, danger; `brand` →
  neutral, `amber` → warning; the `color` prop for API status colours becomes the dot), `FormInput` (error linked with
  `aria-describedby`), `Select` (stays native), `FormSection` (a card with a header), `EmptyState`, `LoadingSpinner`
  (its props work; `role=status`), `Skeleton`, `StarRating`, toasts (`aria-live`, labelled close, longer), `Modal` (on
  Radix Dialog: same props plus `description`, focus trap), `MapView` / `MapPicker` (pins, both styles), `Turnstile`.
- New, each with a test: `Card`, `PageHeader`, `Stat`, `Table` parts, `Tabs`, `SegmentedControl`, `Checkbox`, `Switch`,
  `RadioCardGroup`, `DropdownMenu`, `Tooltip`, `ConfirmDialog`, `Textarea`, `FieldError`, `Alert` (`role=alert` when
  danger), `Pagination`, `Avatar`, `Kbd`, `SearchInput`, `LicensePlate`, `Logo` (mark + wordmark in `currentColor`),
  `ThemeSwitch`.
- `docs/design-system.md` is the guide for everyone: tokens and when to use them, typography, layout patterns (page
  header, list or table, card, form, empty, loading and error states), status → tone map, do's and don'ts.

### Mock API (T1, `apps/mock-api`)

- `@detaileed/mock-api` (private): Node 22 + `tsx`, `node:http` with a small route table, no framework; port 5180
  (`MOCK_API_PORT`); CORS for any `http://localhost:*` origin (headers `Authorization`, `Content-Type`, `X-Studio-Id`,
  `apikey`, `x-client-info`, credentials). No app depends on it, so `turbo prune` leaves it out of the Docker images.
- Fake Supabase under `/auth/v1`: `POST /token?grant_type=password|refresh_token|pkce`, `GET`/`PUT /user`,
  `POST /logout`, `/signup`, `/recover`, `/resend`, `GET /reauthenticate`, `GET /settings`; JWT-shaped tokens (`exp`,
  `sub`, `email`, `role: authenticated`); Supabase's error shape (`invalid_grant`). Demo accounts, password `demo1234`:
  `wlasciciel@demo.detaileed.com` (owns a full studio and an empty one, for empty states), `pracownik@demo.detaileed.com`
  (employee), `klient@demo.detaileed.com` (customer with cars, requests and pending reviews).
- Every path in `packages/api-client/openapi.json` has a handler; data typed with the generated models (`satisfies`),
  Polish, in Europe/Warsaw, dated relative to today (so "today" screens are always full); mutations change an
  in-memory store, `POST /__mock/reset` restores it; errors are ProblemDetails with the codes the UI handles. A test
  checks that every method and path of the spec has a handler.
- `apps/dashboard/.env.mock` is loaded by `vite --mode mock` (mode files beat `.env.local`); `apps/web/.env.mock` is
  loaded by `apps/web/scripts/dev-mock.mjs` (`process.loadEnvFile`, then `next dev -p <port>`; process env beats
  `.env.local`). `dev:mock` scripts in the mock API and both apps (`--port` works), root `pnpm dev:mock` =
  `turbo run dev:mock`; `.gitignore` gets `!.env.mock` (`.dockerignore` already drops `.env.*`).
- `scripts/publish-screenshots.mjs` commits PNGs to the orphan branch `screenshots` (folder per task) with git plumbing
  (temporary index, `commit-tree`, push with retries) and prints Markdown image links
  (`https://github.com/andr0meda727/detaileed/blob/screenshots/<path>?raw=true`; take the owner and name from
  `gh repo view`, the repo has moved before). The repo is public: mock data only,
  never real data. T1 also publishes a baseline of every route in the old look (`baseline/`) for before/after pairs.

### Screenshots and ports

After T1 is merged the coordinator runs one shared mock API on :5180; workers don't start their own (ask for fixture
changes). Each worker runs only its own app, on its own ports, so parallel workers don't collide (3000/3001 stay free
for the user):

| Task           | T1   | T2a  | T2b  | T2c  | T3   | T4   | T5   | T6   | T7   | T8   | T9   | T10  | T11  | T12a | T12b | T13  |
| -------------- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| Dashboard port | 3010 | 3020 | 3030 | 3040 | 3050 |      | 3070 | 3080 | 3090 | 3100 | 3110 | 3120 |      |      |      | 3150 |
| Web port       | 3011 | 3021 | 3031 | 3041 |      | 3061 |      |      |      |      |      |      | 3131 | 3141 | 3143 | 3151 |

Capture with Orca's embedded browser (orca-cli skill): each screen you own at 1440×900 and 390×844, dark and light (set
`localStorage['detaileed-theme']` and reload), signed in as the matching demo account. Name files
`<task>/<app>-<screen>-<theme>-<desktop|phone>.png` (e.g. `t5/dashboard-bookings-dark-desktop.png`), publish them with the
script and put before/after pairs in the PR body.

### Tasks

| Id   | Owns                                                                                                                                                                                                                                                                     | Needs merged  | Branch                            |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------- | --------------------------------- |
| T0   | coordinator: this plan, `.gitattributes`, mockup reference                                                                                                                                                                                                               | –             | `redesign/grafit`                 |
| T1   | `apps/mock-api/**`, `apps/*/.env.mock`, the `dev:mock` scripts, `apps/web/scripts/**`, `scripts/publish-screenshots.mjs`, `turbo.json`, root `package.json`, `.gitignore`, lockfile, AGENTS.md (commands table, env notes)                                               | T0            | `feat/phase-11-mock-api`          |
| T2a  | `packages/ui/src/{styles,theme,lib}/**`, `packages/ui/package.json`, font and theme bootstrap (`apps/dashboard/{index.html,package.json,src/main.tsx}`, `apps/web/src/app/{layout.tsx,globals.css}`), lockfile, AGENTS.md (UI and colour rules), `docs/design-system.md` | T0            | `feat/phase-11-tokens`            |
| T2b  | `packages/ui`: existing components except `Modal`, new non-Radix components, `map/`, `captcha/`, `toast/`, their tests and sections of `docs/design-system.md`                                                                                                           | T2a           | `feat/phase-11-ui-basics`         |
| T2c  | `packages/ui`: `radix-ui`, `Modal`, `ConfirmDialog`, `Tabs`, `SegmentedControl`, `Checkbox`, `Switch`, `RadioCardGroup`, `DropdownMenu`, `Tooltip`, `ThemeSwitch`, their tests and sections of `docs/design-system.md`, lockfile                                         | T2a           | `feat/phase-11-ui-radix`          |
| T3   | dashboard `src/app/layout/**`, `src/routes/_signed-in/s/$studioId/route.tsx` (markup only), `src/routes/__root.tsx`, `src/shared/ui/**`, `src/shared/assets/**`, `index.html` (favicon)                                                                                  | T1, T2b, T2c  | `feat/phase-11-dashboard-shell`   |
| T4   | web `src/app/**` (layouts, chrome, not-found, error), `src/shared/ui/**`, `src/features/{auth,account}/**`, `public/**`, their tests                                                                                                                                     | T1, T2b, T2c  | `feat/phase-11-web-shell`         |
| T5   | dashboard `src/features/bookings/**` + tests                                                                                                                                                                                                                             | T1, T2b, T2c  | `feat/phase-11-bookings`          |
| T6   | dashboard `src/features/inventory/**` + tests                                                                                                                                                                                                                            | T1, T2b, T2c  | `feat/phase-11-inventory`         |
| T7   | dashboard `src/features/{clients,team}/**` + tests                                                                                                                                                                                                                       | T1, T2b, T2c  | `feat/phase-11-clients-team`      |
| T8   | dashboard `src/features/{dashboard-home,reports}/**` + tests                                                                                                                                                                                                             | T1, T2b, T2c  | `feat/phase-11-home-reports`      |
| T9   | dashboard `src/features/{auth,studios}/**` + tests                                                                                                                                                                                                                       | T1, T2b, T2c  | `feat/phase-11-auth-studios`      |
| T10  | dashboard `src/features/{settings,services,marketplace,planning,booking-requests}/**` + tests                                                                                                                                                                            | T1, T2b, T2c  | `feat/phase-11-settings-planning` |
| T11  | web `src/features/{search,studio,booking}/**` + tests                                                                                                                                                                                                                    | T1, T2b, T2c  | `feat/phase-11-web-pages`         |
| T12a | web `src/features/for-studios/components/*.tsx` (not `demo/`), `styles/landing.css`, `model/content.ts`                                                                                                                                                                  | T3, T4, T8    | `feat/phase-11-landing`           |
| T12b | web `src/features/for-studios/components/demo/**`, `model/{demoData,demoFormat}.ts`                                                                                                                                                                                      | T3, T4, T8    | `feat/phase-11-landing-demo`      |
| T13  | removing the old palette, fonts and utilities; the colour lint rule (`packages/config/eslint.js`); AGENTS.md; `docs/**`                                                                                                                                                  | all the above | `chore/phase-11-cleanup`          |

Order (at most about four workers at once): T1 + T2a; then T2b + T2c; then T3, T4, T5, T6; then T7–T11 as slots free;
then T12a + T12b; then T13; then the coordinator opens the final PR `redesign/grafit` → `main`.

### Commits per task

T0 (coordinator, on `redesign/grafit`):

1. `chore: keep the generated route tree in lf line endings`
2. `docs: add the grafit mockup as a design reference`
3. `docs: plan phase 11, the grafit redesign`

T1, mock API:

1. `build(mock-api): add the mock api package`
2. `feat(mock-api): fake supabase sign-in for demo accounts`
3. `feat(mock-api): studio, client and vehicle data`
4. `feat(mock-api): bookings, services and planning data`
5. `feat(mock-api): inventory, team and reports data`
6. `feat(mock-api): marketplace, booking requests and public studios`
7. `feat(mock-api): customer account endpoints`
8. `test(mock-api): cover sign-in and every endpoint in the spec`
9. `build: run both apps against the mock api with dev:mock`
10. `build: script to publish pr screenshots to the screenshots branch`
11. `docs: describe the mock api and the demo accounts`

T2a, tokens, themes and fonts:

1. `build: align tailwind versions across the apps`
2. `build(ui): add clsx and tailwind-merge`
3. `feat(ui): add a cn helper for class names`
4. `feat(ui): grafit colour tokens with light and dark themes`
5. `fix(ui): move theme classes into tailwind layers`
6. `feat(ui): theme preference hook and no-flash script`
7. `build(dashboard): self-host the geist fonts`
8. `feat(dashboard): apply the saved theme before first paint`
9. `build(web): load the geist fonts with next/font`
10. `feat(web): apply the saved theme before first paint`
11. `docs: document the grafit tokens and point the guide at them`

T2b, basic components:

1. `feat(ui): restyle button for grafit`
2. `feat(ui): restyle badge with status tones`
3. `feat(ui): restyle form fields and add textarea and field error`
4. `feat(ui): add card, page header and stat`
5. `feat(ui): add table parts`
6. `feat(ui): add alert, pagination, avatar, kbd and licence plate`
7. `feat(ui): add a search input`
8. `feat(ui): restyle empty state, spinner, skeleton and stars`
9. `feat(ui): restyle toasts and announce them`
10. `feat(ui): map pins and map styles for both themes`
11. `feat(ui): follow the theme in the captcha widget`
12. `feat(ui): add the detaileed logo`
13. `docs: document the basic grafit components`

T2c, interactive components:

1. `build(ui): add radix-ui`
2. `feat(ui): build modal on radix dialog`
3. `feat(ui): add confirm dialog`
4. `feat(ui): add tabs and segmented control`
5. `feat(ui): add checkbox, switch and radio cards`
6. `feat(ui): add dropdown menu and tooltip`
7. `feat(ui): add a theme switch`
8. `docs: document the interactive grafit components`

T3, dashboard shell:

1. `refactor(dashboard): split the sidebar into smaller parts`
2. `feat(dashboard): grafit sidebar with studio switcher and user menu`
3. `feat(dashboard): slim top bar with breadcrumb and mobile menu button`
4. `feat(dashboard): restyle the page header`
5. `feat(dashboard): restyle the root loading, not-found and error screens`
6. `feat(dashboard): restyle the shared name form and card grid`
7. `chore(dashboard): use the new logo and favicon`

T4, site shell, sign-in and account:

1. `feat(web): grafit site header and footer with a theme switch`
2. `feat(web): restyle the account menu`
3. `feat(web): restyle the not-found and error pages`
4. `feat(web): restyle the sign-in and sign-up pages`
5. `feat(web): restyle the password pages`
6. `feat(web): restyle the account layout and navigation`
7. `feat(web): restyle profile, garage and security`
8. `feat(web): restyle my requests and pending reviews`
9. `chore(web): use the new logo and favicon`

T5, bookings:

1. `feat(dashboard): restyle the bookings list and tabs`
2. `feat(dashboard): restyle the booking calendar`
3. `feat(dashboard): restyle booking cards and status badges`
4. `feat(dashboard): restyle the booking form`
5. `feat(dashboard): restyle booking details`
6. `feat(dashboard): confirm booking status changes in a dialog`
7. `feat(dashboard): restyle the booking archive`
8. `refactor(dashboard): drop unused booking status colours`

T6, inventory:

1. `feat(dashboard): restyle the inventory list and filters`
2. `feat(dashboard): restyle the inventory item form`
3. `feat(dashboard): restyle item history and stock movements`
4. `feat(dashboard): restyle the stock forecast`
5. `feat(dashboard): restyle recipes and visit consumption`
6. `feat(dashboard): restyle inventory settings`

T7, clients and team:

1. `feat(dashboard): restyle the clients list and table`
2. `feat(dashboard): restyle client details`
3. `feat(dashboard): restyle the client and vehicle forms`
4. `feat(dashboard): restyle the client and vehicle picker`
5. `feat(dashboard): restyle the team screen`
6. `feat(dashboard): restyle invitations and employee settings`

T8, dashboard home and reports:

1. `feat(dashboard): restyle the dashboard greeting and stats`
2. `fix(dashboard): show today's booking status with the status badge`
3. `feat(dashboard): restyle today's schedule and upcoming bookings`
4. `feat(dashboard): theme the revenue chart`
5. `feat(dashboard): restyle quick actions, stock alerts and activity`
6. `feat(dashboard): restyle the reports screen`

T9, dashboard sign-in and studios:

1. `refactor(dashboard): split the sign-in screen into parts`
2. `feat(dashboard): restyle the sign-in screen`
3. `feat(dashboard): restyle set password and invitation screens`
4. `feat(dashboard): restyle user settings`
5. `feat(dashboard): restyle the studio picker`
6. `feat(dashboard): build the new studio form on the shared modal`
7. `feat(dashboard): restyle studio details and time zone settings`

T10, settings, services, public profile, planning and requests:

1. `feat(dashboard): restyle the studio settings tabs`
2. `feat(dashboard): restyle services settings and the service form`
3. `feat(dashboard): restyle the public profile settings`
4. `feat(dashboard): restyle the day board`
5. `feat(dashboard): restyle planning settings`
6. `feat(dashboard): restyle the booking request inbox`

T11, map search, studio page and booking:

1. `feat(web): restyle the map search and studio cards`
2. `feat(web): restyle the studio page header and reviews`
3. `feat(web): restyle services, prices and the estimate`
4. `feat(web): restyle the studio location card`
5. `feat(web): restyle the booking request form`

T12a, landing page:

1. `feat(web): grafit landing nav, hero and footer`
2. `feat(web): restyle the landing sections`
3. `refactor(web): drop landing styles the tokens replace`

T12b, landing demo:

1. `feat(web): rebuild the landing demo with the new dashboard look`
2. `refactor(web): demo data uses status tones instead of hex colours`

T13, cleanup:

1. `refactor(ui): remove the forest and cream palette and old utilities`
2. `build(dashboard): stop loading the old google fonts`
3. `build(web): stop loading the old fonts`
4. `build(config): flag hard-coded colours in class names` (ESLint `no-restricted-syntax`: hex, `rgb(`, default
   palette classes, old tokens)
5. `docs: update the agent guide for the grafit design system`
6. `docs: describe the design system in the architecture notes`
7. `docs: regression checks for themes and phone widths`
8. `docs: mark phase 11 done`

A commit may be split further when it grows; keep the subjects in this style.

### Notes from doing it

- Every screen task (T3–T12b) was merged before T13, so removing the Forest & Cream tokens, fonts and utilities was a
  pure deletion: a grep found no users left, and the screens look the same. The unused animations (`slide-up`,
  `zoom-in`, `data-entry-fade`, the `.skeleton` shimmer) went too; only `animate-fade-in` remains.
- The pre-Grafit tone aliases (`Badge` `brand`/`amber`, `FormSection` `amber`) were only used by the gallery and
  tests by then and were dropped; `FormSection` tones are now `neutral` and `warning`.
- The colour lint rule is `no-restricted-syntax` with esquery regexes (which can't contain `/`). Palette classes and old tokens are flagged in any string, so class maps count; hex and `rgb()`
  only inside `className` and `cn()`/`clsx()` arguments, since map styles, chart data and API colours use them
  legitimately. One `:matches(...)` context per selector keeps `className={cn(...)}` from reporting twice.
- `FieldShell` used to reserve a message line under every field, which pushed inline controls off-centre (T7 hid it
  in `TeamMemberList` with a layout class, now redundant). Fields with a `label` or an `error` prop keep the line,
  so forms don't jump; other fields collapse it.

### Definition of done (every worker task)

1. `pnpm install` in the new worktree; read AGENTS.md, `docs/design-system.md` (once T2a has written it) and this
   section; rename the branch to the one in the task table (`git branch -m <branch>`).
2. Per commit: prettier on the changed files, `pnpm --filter <package> exec eslint --fix <files>`, then `pnpm lint`
   (0 errors, no new warnings), `pnpm typecheck`, `pnpm test`, `pnpm build`.
3. The files you own contain no hex colours, no `rgb(`, no default-palette classes (`slate-`, `gray-`, `red-`,
   `emerald-`, …), no old tokens and no `font-serif` / `font-syne` (grep before the PR).
4. Tests updated where visible text or structure changes. Fragile ones: `BayLane` (`left`/`width` styles, `title`),
   `ForecastView` (row text), `SetPasswordView` (password inputs, `<form>`), `FreeSlotsSection` (radio names),
   `ServiceFormModal` (placeholder order), `StudioOffer` (no link inside), `routes.test` (heading "Detaileed" on
   `/login`). Components stay under about 250 lines.
5. Screenshots of every screen you own, dark and light, desktop and phone, with before/after pairs in the PR.
6. `gh pr create --base redesign/grafit --body-file <file>`, then wait for CI (`gh pr checks --watch`); report with
   `worker_done`: PR URL, commits, check results, screenshot links. Blocked or missing something shared: `ask`.

## Critical files

`apps/dashboard/src/App.tsx`, `apiClient.ts`, `contexts/StudioContext.tsx`, `components/Sidebar.tsx`, `views/**`, `vite.config.ts`, `tsconfig.json`, `Dockerfile`, `.github/workflows/docker-publish.yml`, `v6.json`.
Reuse: `utils/errorHandler.ts#getApiErrorMessage`, `utils/studioRole.ts`, `utils/selection.ts`, `utils/validations.ts`, `features/bookings/utils/buildBookingCreateDto.ts`, `hooks/useClientVehicleSearch.ts`, `components/ui/Modal.tsx`, `contexts/ToastContext.tsx`.

## Verification (every commit / phase)

- Per commit: prettier + eslint --fix on the changed files; `pnpm turbo lint typecheck test` (+ `build` when relevant).
- Per phase, before merging to `main`: full build, a Docker build where the Dockerfile changed, and the manual regression in `docs/regression-checklist.md` (the user runs `pnpm dev` and clicks through; I can't log in to Supabase myself).
