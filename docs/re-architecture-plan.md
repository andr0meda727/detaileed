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

### Phase 7: marketplace, studio side (branch `feat/phase-7-studio-marketplace`)

1. `packages/ui`: `MapView`/`MapPicker` on MapLibre GL with OpenFreeMap tiles (free, no key; swappable style URL in an
   env var). Shared with `apps/web`.
2. Public profile tab in studio settings (owner edits, staff read): name, description, address, city, phone, pin on
   the map; publish/unpublish with `LISTING_HAS_NO_SERVICES` explained; rating and review count.
3. Booking requests inbox (`/s/$studioId/requests`): list with a status filter (pending first), details (customer, car,
   services with estimate, notes), accept (optional time, price, bay) and reject (reason). With planning on, the
   request plan (does the preferred time fit, closest alternatives, competing requests). Pending count in the sidebar.

### Phase 8: customer marketplace (`apps/web`, branch `feat/phase-8-web`)

1. Scaffold Next.js (App Router, standalone output, Tailwind v4 + `@detaileed/ui` theme, `@detaileed/api-client` with a
   server-side fetcher), lint/typecheck/test in turbo, Dockerfile and CI like the dashboard.
2. Map search (`/`): visible-area search, category and vehicle-size filters, pins and a list with rating and "from"
   price; the URL keeps the map area and filters.
3. Studio page (`/studio/[id]`, ISR 60 s, JSON-LD `AutoRepair`, metadata): profile, services with prices for the
   chosen size, live estimate, reviews ("show more" by cursor), free times when the studio plans.
4. Customer auth: Supabase sign-up/sign-in (`@supabase/ssr`), profile (`/api/me/profile`) required before booking.
5. Booking request flow: services + car (garage or one-off) + time (free slots or a preferred time) + notes; errors
   mapped from codes (`BOOKING_REQUEST_LIMIT`, `OUTSIDE_OPENING_HOURS`, …).
6. Account: garage (`/api/me/vehicles`), request history with withdraw, reviews to write and the review form.
7. `sitemap.xml`/`robots.txt`, error and not-found pages.

### Phase 9: planning (branch `feat/phase-9-planning`)

1. Bays (owner) in studio settings.
2. Schedule: opening hours per day (several periods), buffer, slot step, lead time, size multipliers, closures.
3. Day board (`/s/$studioId/board?date=`): bays as lanes, bookings, free gaps, utilisation, unassigned bookings and
   the day's pending requests.
4. Booking form: free slots for the chosen services and car size (`/api/availability`), bay choice, `NO_BAY_AVAILABLE`
   and `BAY_TAKEN` handled; bookings show their bay and end time.

### Phase 10: inventory ledger (branch `feat/phase-10-inventory`)

1. Item history and movements (delivery, stocktake) instead of editing the stock number.
2. Materials per service (recipes) and size factors (owner).
3. What a completed visit used (consumption per booking, actual amounts).
4. Forecast (days left, runs out at) and estimate accuracy.

Not in the API yet (from the backend reference): editing a studio's name/phone/address, `statusId` on bookings,
links from booking-request emails into the frontend.

## Critical files

`apps/dashboard/src/App.tsx`, `apiClient.ts`, `contexts/StudioContext.tsx`, `components/Sidebar.tsx`, `views/**`, `vite.config.ts`, `tsconfig.json`, `Dockerfile`, `.github/workflows/docker-publish.yml`, `v6.json`.
Reuse: `utils/errorHandler.ts#getApiErrorMessage`, `utils/studioRole.ts`, `utils/selection.ts`, `utils/validations.ts`, `features/bookings/utils/buildBookingCreateDto.ts`, `hooks/useClientVehicleSearch.ts`, `components/ui/Modal.tsx`, `contexts/ToastContext.tsx`.

## Verification (every commit / phase)

- Per commit: prettier + eslint --fix on the changed files; `pnpm turbo lint typecheck test` (+ `build` when relevant).
- Per phase, before merging to `main`: full build, a Docker build where the Dockerfile changed, and the manual regression in `docs/refactor-baseline-checklist.md` (the user runs `pnpm dev` and clicks through; I can't log in to Supabase myself).
