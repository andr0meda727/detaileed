# Build context: repository root
#   docker build -f apps/web/Dockerfile .

FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /repo
ENV NEXT_TELEMETRY_DISABLED=1

# 1. Keep only the web app and the workspace packages it depends on
FROM base AS prune
COPY . .
RUN npx -y turbo@2.11.10 prune @detaileed/web --docker

# 2. Install dependencies (cached layer: only changes when package.json files / lockfile change)
FROM base AS build
COPY --from=prune /repo/out/json/ .
RUN pnpm install --frozen-lockfile

# 3. Build (NEXT_PUBLIC_* values are inlined into the client bundle)
COPY --from=prune /repo/out/full/ .

ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_DASHBOARD_URL
ARG NEXT_PUBLIC_MAP_STYLE_URL
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=$NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY \
    NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_DASHBOARD_URL=$NEXT_PUBLIC_DASHBOARD_URL \
    NEXT_PUBLIC_MAP_STYLE_URL=$NEXT_PUBLIC_MAP_STYLE_URL \n    NEXT_PUBLIC_TURNSTILE_SITE_KEY=$NEXT_PUBLIC_TURNSTILE_SITE_KEY

RUN pnpm turbo run build --filter=@detaileed/web

# 4. Run the standalone server (it holds only the files the app needs)
FROM node:22-alpine AS final
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

COPY --from=build --chown=node:node /repo/apps/web/.next/standalone ./
COPY --from=build --chown=node:node /repo/apps/web/.next/static ./apps/web/.next/static
COPY --from=build --chown=node:node /repo/apps/web/public ./apps/web/public

USER node
EXPOSE 3000

CMD ["node", "apps/web/server.js"]
