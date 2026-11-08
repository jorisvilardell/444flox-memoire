FROM node:26-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.31-alpine
COPY --from=build /app/dist /usr/share/nginx/html
# The stock entrypoint envsubsts /etc/nginx/templates/*.template into conf.d (PORT defaults via ENV below).
COPY docker/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY docker/40-runtime-config.sh /docker-entrypoint.d/40-runtime-config.sh
RUN chmod +x /docker-entrypoint.d/40-runtime-config.sh
ENV PORT=8080 API_URL=http://localhost:3333
EXPOSE 8080
