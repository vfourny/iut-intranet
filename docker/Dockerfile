# syntax=docker/dockerfile:1
FROM node:22.22.2-slim AS base
WORKDIR /app

# --- deps: install workspace dependencies. Used by the dev container and as
# the base layer for production builds. ---
FROM base AS deps
COPY package.json package-lock.json turbo.json ./
COPY --parents packages/*/package.json apps/*/package.json ./
RUN npm ci && npm cache clean --force && mkdir -p /app/.turbo && chown -R node:node /app
USER node

# --- builder: build every package with turbo. ---
FROM deps AS builder
ARG PUBLIC_API_URL
ARG PUBLIC_APP_URL
ENV PUBLIC_API_URL=${PUBLIC_API_URL} \
    PUBLIC_APP_URL=${PUBLIC_APP_URL}
COPY --chown=node:node . .
RUN npx turbo db:generate && npx turbo build

# --- api: production runtime for the Express + tRPC server. ---
FROM builder AS api
ENV NODE_ENV=production
CMD ["node", "apps/api/dist/index.js"]

# --- web: production runtime for the Vite app (vite preview).
# Host + port are driven by vite.config.ts (preview.host / preview.port via APP_PORT).
FROM builder AS web
ENV NODE_ENV=production
WORKDIR /app/apps/web
CMD ["npx", "vite", "preview"]
