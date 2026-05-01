# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

Turbo monorepo on npm workspaces, Node `22.22.2` (pinned in `.nvmrc` and `engines`). Single API app (`apps/api`) with shared packages under `packages/*`. Express 5 + tRPC v11 server, Prisma 7 (Postgres), better-auth, pino. ESM throughout (`"type": "module"`).

## Common commands

All scripts go through Turbo at the repo root:

- `npm run dev` — `turbo watch dev`; runs every package's dev task with watching. The API uses `tsx watch`.
- `npm run build` — production build. Depends on `db:generate` running first (see Architecture).
- `npm run ts:check` / `npm run lint` / `npm run lint:fix` — type-check and lint everything.
- `npm run format` — builds `@iut-intranet/configs` first (Prettier config is consumed from its `dist/`), then runs Prettier.
- `npm run syncpack:check` — enforces uniform exact (no `^`/`~`) versions across packages for prod/dev deps. Internal `@iut-intranet/*` deps are ignored.

Database (all delegate to the `@iut-intranet/db` package via Turbo filters):

- `npm run db:start` / `npm run db:down` — local Postgres 15 in Docker (`docker/local.compose.yml`). Data persists in `.cache/db_data_local`.
- `npm run db:generate` — `prisma generate` (output goes to `packages/db/src/generated`, not `node_modules`).
- `npm run db:migrate -- <name>` — `prisma migrate dev --name <name>`. Note the `--` is required because the script is `prisma migrate dev --name`.
- `npm run db:deploy` / `npm run db:push` / `npm run db:reset` / `npm run db:seed` / `npm run db:studio`.

Running a single package's task: `npx turbo <task> --filter=@iut-intranet/<pkg>` (e.g. `--filter=@iut-intranet/api`). There is no test runner configured yet.

## Architecture

### Workspace layout

```
apps/api                Express + tRPC HTTP server (only deployable today)
packages/trpc           Root tRPC router + context (re-exported as @iut-intranet/trpc)
packages/auth           better-auth setup (scaffolded; src/index.ts is empty)
packages/db             Prisma schema + generated client (scaffolded; schema is empty)
packages/helpers        Cross-cutting helpers: env (zod), errors (AppError)
packages/configs        Shared eslint / prettier / commitlint / tsconfig / pino logger
packages/bruno          Bruno API test collection
docker/                 Postgres compose files + production Dockerfile
docs/                   Specification (Cahier des charges) + MCD diagrams
```

### Request flow

`apps/api/src/index.ts` is the single entry point. It mounts:

1. `createHttpLogger()` from `@iut-intranet/configs/logger` (pino-http).
2. CORS restricted to `APP_URL` with credentials enabled.
3. `GET /health`.
4. `/trpc` via `createExpressMiddleware` from `@trpc/server/adapters/express`, using `appRouter` from `@iut-intranet/trpc` and `createContext` from `@iut-intranet/trpc/context`.

The tRPC context (`packages/trpc/src/context.ts`) is `{ logger, req, res }`. `appRouter` (`packages/trpc/src/index.ts`) is currently empty — add procedures by extending it. Use `publicProcedure` from `packages/trpc/src/trpc.ts`. Throw `AppError(code, message)` from `@iut-intranet/helpers/errors` for tRPC error codes.

### Build chain (Turbo `dependsOn`)

The non-obvious dependency: every `build`, `dev`, `preview`, and `ts:check` transitively depends on `^db:generate` because the Prisma client output lives **inside the db package source** (`packages/db/src/generated`), not in `node_modules`. If you see "Cannot find module" referencing the generated client, run `npm run db:generate` first.

Each package builds with `tsc && tsc-alias` (path-alias rewriting) and emits to `dist/`. `@iut-intranet/configs` is special: most of its subpath exports (`/eslint/*`, `/prettier`, `/commitlint`, `/tsconfig/*`) resolve to `dist/` only, so it must be built before tools that consume them — that's why `npm run format` builds `@iut-intranet/configs` first.

### Environment variables

Validated via zod in `packages/helpers/src/env.ts`. Use `getEnv('KEY1', 'KEY2', ...)` to read a strongly-typed subset. **When adding a new env var:** update the `envSchema` there _and_ add the key to `globalEnv` in `turbo.json` so Turbo's cache invalidates correctly. `.env.sample` documents the expected keys.

### Conventions enforced by tooling

- **Exact versions only** — `.syncpackrc.json` sets `"range": ""` for dev/prod deps. Never use `^` or `~` when adding dependencies.
- **Conventional commits** — commitlint config extends `@iut-intranet/configs/commitlint`, run via husky `commit-msg`. Husky `pre-commit` runs `lint-staged` (eslint --fix on TS/JS, prettier on everything else).
- **ESLint config** — packages extend `@iut-intranet/configs/eslint/node` (which itself extends `@vfourny/node-toolkit/eslint/node` and disables `no-redeclare`). The API allows `console` in `src/index.ts` only.
- **TS path aliases** — packages use `@/*` aliases that point to `src/*`; `tsc-alias` rewrites them on build.

### Status of scaffolded packages

`packages/auth/src/index.ts` and `packages/db/src/index.ts` are placeholder `export {}` files; the Prisma schema has no models yet. better-auth and Prisma are installed but not wired up. Expect to bootstrap these when adding auth or persistence features — don't assume existing models or auth helpers exist.
