# Build context: repository root
#   docker build -f apps/dashboard/Dockerfile .

FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /repo

# 1. Keep only the dashboard and the workspace packages it depends on
FROM base AS prune
COPY . .
RUN npx -y turbo@2.11.10 prune @detaileed/dashboard --docker

# 2. Install dependencies (cached layer: only changes when package.json files / lockfile change)
FROM base AS build
COPY --from=prune /repo/out/json/ .
RUN pnpm install --frozen-lockfile

# 3. Build
COPY --from=prune /repo/out/full/ .

ARG VITE_SUPABASE_URL
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL

ARG VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY
ENV VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=$VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN pnpm turbo run build --filter=@detaileed/dashboard

# 4. Serve static files
FROM nginx:1.27-alpine AS final
WORKDIR /usr/share/nginx/html

RUN rm -rf ./* /etc/nginx/conf.d/default.conf

COPY apps/dashboard/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/apps/dashboard/dist ./

RUN chown -R nginx:nginx /usr/share/nginx/html \
    && chown -R nginx:nginx /var/cache/nginx \
    && chown -R nginx:nginx /var/log/nginx \
    && touch /var/run/nginx.pid \
    && chown -R nginx:nginx /var/run/nginx.pid

USER nginx

EXPOSE 80

ENTRYPOINT ["nginx", "-g", "daemon off;"]
