# Detaileed

A platform for car-detailing studios. Studios run their day in the dashboard (bookings, clients, services,
inventory, planning, team, reports); customers find studios on a map, compare prices for their car and send booking
requests on the customer site. The backend is a separate .NET API (`detaileed-api`); sign-in uses Supabase.

| App              | What                                                 | Where             | Dev port |
| ---------------- | ---------------------------------------------------- | ----------------- | -------- |
| `apps/dashboard` | studio management SPA (Vite, React, TanStack Router) | app.detaileed.com | 3000     |
| `apps/web`       | customer site (Next.js App Router)                   | detaileed.com     | 3001     |

The landing page for studio owners is part of the customer site, at
[detaileed.com/for-studios](https://detaileed.com/for-studios).

Shared packages: `packages/ui` (design system), `packages/domain` (pure helpers), `packages/api-client` (generated
from the API's OpenAPI spec), `packages/config` (TypeScript, ESLint, Prettier).

## Getting started

Requirements: Node.js 22+ and pnpm (the version is pinned in `package.json`; `corepack enable` picks it up).

```sh
pnpm install
cp apps/dashboard/.env.example apps/dashboard/.env.local   # then fill in the Supabase values
cp apps/web/.env.example apps/web/.env.local
pnpm dev                                                    # all apps
```

Use pnpm only: npm or yarn would create a second lockfile.

## Commands

| Command                                       | Purpose                                                           |
| --------------------------------------------- | ----------------------------------------------------------------- |
| `pnpm dev`                                    | dev servers for both apps                                         |
| `pnpm check`                                  | lint + typecheck + test + build, the same as CI                   |
| `pnpm test`                                   | Vitest in every package                                           |
| `pnpm generate`                               | regenerate the API client from `packages/api-client/openapi.json` |
| `pnpm --filter @detaileed/dashboard <script>` | run a script in one package                                       |

## Docs

- [`AGENTS.md`](AGENTS.md): conventions and the checks to run after every change.
- [`docs/architecture.md`](docs/architecture.md): how the apps and packages are organised.
- [`docs/regression-checklist.md`](docs/regression-checklist.md): manual click-through before bigger merges.
- [`docs/re-architecture-plan.md`](docs/re-architecture-plan.md): the plan the current structure came from.

Pushing to `main` deploys both apps (GitHub Actions build the Docker images); work on a branch and open a PR.
