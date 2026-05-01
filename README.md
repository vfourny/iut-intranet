# IUT Intranet

Intranet de l'IUT — monorepo Turbo regroupant l'API tRPC, le front Vue 3 et les packages partagés.

## Stack

- **Node** `22.22.2` (épinglé via `.nvmrc` et `engines`)
- **npm workspaces** + **Turbo** pour l'orchestration des tâches
- **API** : Express 5, tRPC v11, Prisma 7 (Postgres 15), better-auth, pino
- **Web** : Vue 3, Vite, Pinia + Pinia Colada, PrimeVue, Tailwind, vee-validate, vue-i18n
- **Tooling** : ESLint, Prettier, syncpack, commitlint, husky, lint-staged

## Structure du monorepo

```
apps/
  api/                Serveur Express + tRPC
  web/                Front Vue 3 (Vite)
packages/
  trpc/               Router tRPC racine + contexte
  auth/               Setup better-auth
  db/                 Schéma Prisma + client généré
  helpers/            Helpers transverses (env, errors, schemas, types)
  configs/            Configs partagées (eslint, prettier, tsconfig, logger, commitlint)
  bruno/              Collection de tests API Bruno
docker/               Compose Postgres local + Dockerfile prod
docs/                 Cahier des charges + MCD
```

## Prérequis

- Node `22.22.2` (utiliser `nvm use`)
- npm `10.9.7`
- Docker (pour la base Postgres locale)

## Installation

Deux options : installation locale **ou** Dev Container (recommandé pour démarrer rapidement avec un environnement isolé).

### Option 1 — Locale

```bash
nvm use
npm install
cp .env.sample .env
```

Renseigner `BETTER_AUTH_SECRET` dans `.env` (les autres valeurs par défaut conviennent en local).

### Option 2 — Dev Container (VS Code / JetBrains)

Le repo fournit un Dev Container clé en main (`.devcontainer/`) qui provisionne Node, le projet et une base Postgres dans des conteneurs.

Prérequis : Docker + l'extension **Dev Containers** (VS Code) ou le support **Dev Containers** dans les IDE JetBrains.

1. `cp .env.sample .env` et renseigner `BETTER_AUTH_SECRET`.
2. Ouvrir le projet dans l'IDE et lancer **« Reopen in Container »** (VS Code) ou **« New Dev Container »** (JetBrains).
3. À la première création, `npm run db:deploy` est exécuté automatiquement (`postCreateCommand`).
4. Une fois dans le conteneur : `npm install` puis `npm run dev`.

Ports forwardés : `8000` (API), `5432` (Postgres). La base tourne dans le service `postgres-dev` du compose ; pas besoin de lancer `npm run db:start`.

## Lancer le projet (installation locale)

```bash
npm run db:start        # démarre Postgres dans Docker
npm run db:generate     # génère le client Prisma
npm run db:migrate -- init   # applique les migrations (au premier run)
npm run dev             # lance API + Web en watch
```

- API : http://localhost:8000
- Web : http://localhost:5173

## Commandes utiles

| Commande                            | Description                                      |
| ----------------------------------- | ------------------------------------------------ |
| `npm run dev`                       | Lance toutes les apps en mode watch              |
| `npm run build`                     | Build de production                              |
| `npm run ts:check`                  | Type-check global                                |
| `npm run lint` / `npm run lint:fix` | Lint global                                      |
| `npm run format`                    | Formatte le repo avec Prettier                   |
| `npm run syncpack:check`            | Vérifie l'uniformité des versions de dépendances |
| `npm run db:start` / `db:down`      | Démarre / arrête Postgres local                  |
| `npm run db:migrate -- <name>`      | Crée et applique une migration                   |
| `npm run db:reset`                  | Reset complet de la base                         |
| `npm run db:studio`                 | Ouvre Prisma Studio                              |

Cibler un seul package : `npx turbo <task> --filter=@iut-intranet/<pkg>`.

## Conventions

- **Versions exactes uniquement** (pas de `^` ni `~`) — vérifié par syncpack.
- **Conventional Commits** appliqués via commitlint + husky.
- **Pre-commit** : ESLint sur le staged TS/JS et Prettier sur le reste (lint-staged).
