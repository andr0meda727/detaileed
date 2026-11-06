# Detaileed: re-architecture execution plan (Phases 1–4, with 5–7 outlined)

## Context

Phase 0 (hygiene) is done: 9 commits on `refactor/phase-0-hygiene` (env-based API URL, local Tailwind v3 build, ESLint/Prettier, strict TS, CLAUDE.md). Next we turn the repo into a pnpm + Turborepo monorepo, generate the API client from OpenAPI, add a real router and reorganise the dashboard into feature slices. This removes the "hard to find things / fragile" problems and prepares a home for the public marketplace (`apps/web`, Next.js) later.

User decisions: **pnpm**; **merge each phase into local `main` (fast-forward, no push), then branch the next phase from `main`**; **stay on Tailwind v3** until Phase 5. Rules from `CLAUDE.md`: small, single-purpose commits; moves in their own commits; every commit builds and passes lint, typecheck and tests; before each commit run prettier and eslint --fix on the changed files, then `lint`, `typecheck`, `test` (and `build` for config/deps/routing/styles); no pushing.

## Status

| Phase                   | State                                                                                        |
| ----------------------- | -------------------------------------------------------------------------------------------- |
| 0: hygiene              | done (merged to `main`)                                                                      |
| 1: monorepo             | done (merged to `main`)                                                                      |
| 2: generated API client | **on hold until the backend API is finished**; re-check the spec (`v6.json`) before starting |
| 3–7                     | not started                                                                                  |

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

## Phase 4: feature slices (one branch per feature, e.g. `refactor/phase-4-bookings`)

Layout `apps/dashboard/src/{app,routes,features,shared}`; each feature has `api/ components/ hooks/ model/ index.ts`. Per feature:

1. a **move-only commit** (`git mv` into `features/<name>/…`, fixing import paths only)
2. a commit switching its data access to the generated hooks, deleting its `services/*Service.ts` + `hooks/use*.ts` + DTOs from `types.ts`
3. split commits for oversized components (target ≤ 250 lines)
4. `index.ts` public API, with routes importing only from it

Order: `shared` (utils, ToastContext, delete the deprecated `components/ui/useToast.tsx`) → `studios`+`auth` → `bookings` (`buildBookingCreateDto`, `CreateBookingModal`, `useClientVehicleSearch`, booking parts of `Dashboard.tsx`/`TasksView.tsx`) → `clients`+`vehicles` → `services` → `inventory` → `team` → `reports` → `dashboard-home` → delete the empty legacy dirs + `apiClient.ts`. The last commit adds `eslint-plugin-boundaries` (`app → routes → features → shared`, features only via `index.ts`, no `fetch` outside `api-client`), makes `react-hooks/set-state-in-effect` an error, and rewrites `docs/frontend-architecture.md`.

## Later phases (detailed plan when we reach them)

- **Phase 5**: `packages/ui` (Modal, FormInput, Skeleton, EmptyState, Spinner, Toast, StatCard + Button/Input/Select/Badge/StarRating), Tailwind v4 upgrade (the user runs `npx @tailwindcss/upgrade`), and a shared `theme.css`.
- **Phase 6**: `apps/web` Next.js marketplace (ISR studio/city pages, SSR search, JSON-LD, sitemap, MapLibre, `@supabase/ssr` cookies on `.detaileed.com`, standalone Docker image). Needs the Phase 7 endpoints.
- **Phase 7 (backend, done by the user)**: `/api/public/studios` (geo + filters), `/api/public/studios/{slug}`, reviews, cities, slug/lat-lng/rating fields, revalidate webhook.

## Critical files

`apps/dashboard/src/App.tsx`, `apiClient.ts`, `contexts/StudioContext.tsx`, `components/Sidebar.tsx`, `views/**`, `vite.config.ts`, `tsconfig.json`, `Dockerfile`, `.github/workflows/docker-publish.yml`, `v6.json`.
Reuse: `utils/errorHandler.ts#getApiErrorMessage`, `utils/studioRole.ts`, `utils/selection.ts`, `utils/validations.ts`, `features/bookings/utils/buildBookingCreateDto.ts`, `hooks/useClientVehicleSearch.ts`, `components/ui/Modal.tsx`, `contexts/ToastContext.tsx`.

## Verification (every commit / phase)

- Per commit: prettier + eslint --fix on the changed files; `pnpm turbo lint typecheck test` (+ `build` when relevant).
- Per phase, before merging to `main`: full build, a Docker build where the Dockerfile changed, and the manual regression in `docs/refactor-baseline-checklist.md` (the user runs `pnpm dev` and clicks through; I can't log in to Supabase myself).
