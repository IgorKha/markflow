FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

FROM deps AS build
COPY . .
RUN npm run build

FROM nginx:1.29-alpine AS runtime
ARG APP_VERSION=0.1.0
ARG VCS_REF=local
LABEL org.opencontainers.image.title="markflow" \
  org.opencontainers.image.description="Online Markdown editor with Mermaid and LaTeX support" \
  org.opencontainers.image.authors="IgorKha https://github.com/IgorKha" \
  org.opencontainers.image.version="$APP_VERSION" \
  org.opencontainers.image.revision="$VCS_REF"

COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
