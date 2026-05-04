# syntax=docker/dockerfile:1
FROM node:22.22.2-slim
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app

COPY package.json package-lock.json turbo.json ./
COPY --parents packages/*/package.json apps/*/package.json ./

RUN npm ci && npm cache clean --force && mkdir -p /app/.turbo && chown -R node:node /app

USER node

COPY --chown=node:node . .
