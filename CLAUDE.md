# Detaileed: studio management dashboard

React 19 + TypeScript (strict) + Vite SPA for car-detailing studios. Data comes from a separate .NET API (OpenAPI spec: `v6.json`), auth is Supabase, server state is TanStack React Query, forms use react-hook-form + zod, styling is Tailwind (v3 build, design tokens in `index.css`). UI text is Polish.

## After every change (required)

Run these before calling a task done, and fix whatever they report:

1. `npx prettier --write <changed files>`: format only the files you touched. The codebase hasn't been fully formatted yet, so don't run `npm run format` on everything unless asked.
2. `npx eslint --fix <changed files>`, then `npm run lint`. It must report **0 errors**. Don't add new warnings to files you touch, and clean up existing warnings (e.g. unused imports) in code you're already editing.
3. `npm run typecheck`: must pass.
4. `npm test`: must pass. Add or update tests in `tests/` when you change logic.
5. `npm run build`: run after changes to config, dependencies, routing or styles.

Never silence a rule with `eslint-disable` or `@ts-ignore`/`@ts-expect-error` without a comment explaining why.

## Commits

- Commit after each small, self-contained change. Never bundle a whole phase or unrelated changes into one commit.
- One logical change per commit (e.g. "add dependency", "add config", "fix bug", "move files" are separate commits). File moves/renames go in their own commit, without content changes, so history and blame survive.
- Each commit should leave the app building, with lint and tests green (run the checks above before committing).
- Work on a branch (e.g. `refactor/phase-1-monorepo`), not directly on `main`; pushing to `main` deploys.
- Message style: short, lowercase, imperative, with an optional conventional prefix (`fix:`, `feat:`, `refactor:`, `chore:`, `build:`, `docs:`, `test:`).
- Don't push unless asked.

## Commands

| Command                                   | Purpose                                                      |
| ----------------------------------------- | ------------------------------------------------------------ |
| `npm run dev`                             | dev server on :3000 (`/api` is proxied to api.detaileed.com) |
| `npm run build`                           | production build                                             |
| `npm test` / `npm run test:watch`         | Vitest (jsdom)                                               |
| `npm run lint`                            | ESLint (flat config in `eslint.config.js`)                   |
| `npm run typecheck`                       | `tsc --noEmit`                                               |
| `npm run format` / `npm run format:check` | Prettier                                                     |

Env vars: see `.env.example`; local overrides go in `.env.local` (git-ignored). `VITE_API_URL` sets the backend base URL.

## Code conventions

- **Server data goes through React Query hooks only.** Don't add new `services/*` functions or `apiGet` calls in components. (`services/*` and the localStorage cache in `apiClient.ts` are legacy and being removed.)
- **Toasts:** use `addToast` from `contexts/ToastContext.tsx`. `components/ui/useToast.tsx` is deprecated.
- **API errors:** use `getApiErrorMessage` from `utils/errorHandler.ts`. Never leave an empty `catch`.
- **Modals:** use `components/ui/Modal.tsx`.
- **Roles:** use the helpers in `utils/studioRole.ts` and the `StudioRole` type.
- **Forms:** zod schemas live in `utils/validations.ts`. Use react-hook-form + `zodResolver`.
- Keep components under ~250 lines; split big views into smaller components.
- Prefer deriving state over `useEffect` + `setState` (the `react-hooks/set-state-in-effect` rule is a warning for now and will become an error).

## Architecture direction (re-architecture in progress)

The work is done in phases; don't jump ahead unless asked:

0. Hygiene (env-based API URL, Tailwind build, ESLint/Prettier, strict TS): done
1. pnpm + Turborepo monorepo: `apps/dashboard` (this app), later `apps/web` (Next.js public marketplace), `packages/{api-client,ui,config}`
2. API client generated from the OpenAPI spec (Orval + React Query); remove `services/*`, the hand-written hooks and the DTOs in `types.ts`
3. TanStack Router (file-based) replaces the `useState<ViewType>` switch in `App.tsx`; the studio comes from the URL (`/s/$studioId/...`)
4. Feature slices: `features/<name>/{api,components,hooks,model,index.ts}`. Imports flow `app → routes → features → shared`, and other code may import a feature only through its `index.ts`
5. Shared design system in `packages/ui`
6. Public marketplace (`apps/web`, Next.js SSR/ISR)

New code should already follow the feature-slice layout where practical (see `features/bookings/`). Architecture notes: `docs/frontend-architecture.md`; manual regression checklist: `docs/refactor-baseline-checklist.md`.
