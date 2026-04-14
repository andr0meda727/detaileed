FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

COPY . .

ARG VITE_SUPABASE_URL
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL

ARG VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY
ENV VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=$VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY

RUN npm run build

FROM nginx:1.27-alpine AS final
WORKDIR /usr/share/nginx/html

RUN rm -rf ./* /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist ./

RUN chown -R nginx:nginx /usr/share/nginx/html \
    && chown -R nginx:nginx /var/cache/nginx \
    && chown -R nginx:nginx /var/log/nginx \
    && touch /var/run/nginx.pid \
    && chown -R nginx:nginx /var/run/nginx.pid

USER nginx

EXPOSE 80

ENTRYPOINT ["nginx", "-g", "daemon off;"]
