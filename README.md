# IUT Intranet

Intranet de l'IUT — monorepo Turbo regroupant l'API tRPC, le front Vue 3 et les packages partagés.

## Stack

- **Node** `22.22.2` (épinglé via `.nvmrc` et `engines`)
- **npm workspaces** + **Turbo** pour l'orchestration des tâches
- **API** : Express 5, tRPC v11, Prisma 7 (Postgres 15), better-auth, pino
- **Web** : Vue 3, Vite, Pinia + Pinia Colada, PrimeVue, Tailwind, vee-validate, vue-i18n
- **Tooling** : ESLint, Prettier, syncpack, commitlint, husky, lint-staged

## Pourquoi un monorepo ?

API et Web vivent dans le même repo pour **partager du code typé** : les schémas Zod, les types TypeScript et le router tRPC sont définis une fois dans `packages/*` et consommés des deux côtés. Conséquence concrète : quand le back change le contrat d'un endpoint, le front pète à la compilation — pas en prod.

À ne **jamais** faire :

- dupliquer un type ou un schéma déjà présent dans `packages/helpers` côté front,
- appeler l'API en `fetch` brut (passer par le client tRPC `@/lib/trpc`),
- écrire un libellé en dur dans un composant Vue (passer par `@/langs/fr`).

## Structure du monorepo

```
apps/
  api/                Serveur Express + tRPC (le déployable backend)
  web/                Front Vue 3 (Vite) — voir section dédiée ci-dessous
packages/
  trpc/               Router tRPC racine + middlewares + contexte (consommé par l'api ET le web pour le typage)
  auth/               Setup better-auth (instance, plugins, types de session)
  db/                 Schéma Prisma + client généré dans src/generated
  services/           Couche métier (AuthService, UserService, etc.) appelée par les procedures tRPC
  helpers/            Code transverse non métier : env (zod), errors, schemas Zod partagés, types, utils
  configs/            Configs partagées (eslint, prettier, tsconfig, logger pino, commitlint)
  emails/             Templates d'emails Handlebars + sender
  bruno/              Collection de tests API Bruno
docker/               Compose Postgres local + Dockerfile prod
docs/                 Cahier des charges + MCD
```

Règle : **la logique métier vit dans `packages/services`**, les procedures tRPC ne font qu'appeler les services et faire de la validation. Côté web, on n'appelle jamais directement un service — uniquement via le client tRPC.

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

## Architecture du front (`apps/web`)

Vue 3 + `<script setup>` + TypeScript. Vite pour le bundling, Pinia + Pinia Colada pour l'état serveur, vue-router pour la nav, vue-i18n pour les libellés, vee-validate + Zod pour les formulaires, PrimeVue + Tailwind pour l'UI.

### Arborescence commentée

```
apps/web/src/
  api/                Composables Pinia Colada qui wrappent les appels tRPC (1 fichier par domaine)
                      → ex. auth.api.ts expose useSession, useSignIn, useSignUp, useSignOut
  assets/             CSS global, fonts, images
  components/
    ui/               Briques génériques (input-field, password-field, field-wrapper, …)
    <domain>/         Composants liés à un domaine (ex. auth/auth-form-card.vue)
  composables/        Hooks Vue partagés (use-i18n.ts wrap vue-i18n avec un t() typé)
  langs/fr/           Libellés français — UN fichier par domaine + index.ts qui les agrège
                      → ex. auth.lang.ts, department.lang.ts, layout.lang.ts
  layouts/            Layouts de page (auth-layout, default-layout) — choisis via route.meta.layout
  lib/                Clients & helpers techniques externes
                      → trpc.ts : client tRPC typé depuis @iut-intranet/trpc
                      → primevue-theme.ts : preset PrimeVue
  pages/              Pages routées (1 .vue par route, suffixe -page.vue)
  plugins/            Setup des plugins Vue (i18n.ts crée l'instance vue-i18n)
  types/              Types front-only (ex. layout.type.ts)
  app.vue             Racine — sélectionne le layout selon route.meta.layout
  main.ts             Bootstrap : Pinia, PrimeVue, router, i18n + chargement initial de session
  router.ts           Routes + RouteNames (à utiliser à la place des chemins en string) + guard d'auth
```

Les imports utilisent l'alias `@/*` qui pointe sur `apps/web/src/*`. Pour le code partagé du monorepo : `@iut-intranet/<package>` (ex. `@iut-intranet/helpers/schemas/auth`).

### Flux de données type

```
Page Vue (pages/<x>-page.vue)
  → utilise un composable Pinia Colada (api/<x>.api.ts)
     → appelle le client tRPC (lib/trpc.ts)
        → HTTP /trpc → procedures tRPC (packages/trpc) → service (packages/services) → DB (packages/db)
```

Tout est typé bout-en-bout : `trpc.auth.signInWithPassword.mutate(input)` propose l'autocomplétion sur `input` et type le retour.

### Conventions front à respecter

- **Pas de libellés en dur** dans les `.vue` — toujours `t('domain.key')` via `useI18n()` de `@/composables/use-i18n`. Si la clé n'existe pas, `t()` rejette à la compilation.
- **Pas de `fetch` direct** — toujours via `trpc` de `@/lib/trpc`. Si tu as besoin d'une nouvelle requête, ajoute un composable dans `api/`.
- **Schémas de validation = ceux de `@iut-intranet/helpers/schemas`** — vee-validate les consomme directement (`useForm({ validationSchema })`). Ne jamais redéfinir un schéma côté front s'il existe déjà côté shared.
- **Types réutilisés depuis `@iut-intranet/helpers/types`** (ex. `SignInWithPasswordInput`) — ne pas les retaper.
- **Routes nommées** : utiliser `RouteNames.<x>` au lieu d'écrire `'/auth/sign-in'` en dur.
- **Composants UI génériques** dans `components/ui/`, **composants métier** dans `components/<domain>/`.
- **Convention de nommage** : `kebab-case` pour les fichiers `.vue` et `.ts`, suffixe `-page.vue` pour les pages, `<domain>.api.ts` / `<domain>.lang.ts`.

### Recette : ajouter une feature côté web (de A à Z)

Exemple : ajouter une page « Mon profil » qui appelle un nouvel endpoint tRPC `user.getMe`.

1. **Schémas/types partagés** (si l'endpoint a un input ou un type spécifique) : `packages/helpers/src/schemas/<domain>.schema.ts` et/ou `packages/helpers/src/types/<domain>.types.ts`.
2. **Service métier** : `packages/services/src/<domain>.service.ts` — méthode qui parle à Prisma / better-auth.
3. **Procedure tRPC** : `packages/trpc/src/modules/<domain>/procedures/<verb>.procedure.ts` puis brancher dans `<domain>.router.ts`.
4. **Composable API front** : `apps/web/src/api/<domain>.api.ts` — `useGetMe`, `useUpdateMe`, etc. via `useQuery` / `useMutation` de `@pinia/colada`.
5. **Libellés** : ajouter `<domain>.lang.ts` dans `langs/fr/` et l'agréger dans `langs/fr/index.ts`.
6. **Page** : `pages/<domain>/<x>-page.vue` qui consomme le composable et appelle `t()` pour les libellés.
7. **Route** : ajouter dans `router.ts` (avec `meta.access` et `meta.layout`) + une entrée dans `RouteNames`.
8. **Composants** : extraire dans `components/ui/` ou `components/<domain>/` dès que ça se réutilise.

Le `npm run dev` à la racine relance tout en watch — un changement dans `packages/helpers` est tout de suite vu par `apps/web` et `apps/api`.

### Pièges fréquents

- **« Cannot find module @iut-intranet/db »** → lancer `npm run db:generate` (le client Prisma est généré dans `packages/db/src/generated`, pas dans `node_modules`).
- **`t('foo.bar')` rouge en TS** → la clé n'existe pas dans `langs/fr/`. L'ajouter dans le bon fichier `<domain>.lang.ts`.
- **Le typage tRPC est cassé côté web** → souvent un `npm run build --filter=@iut-intranet/trpc` suffit, ou redémarrer le `tsserver` de l'IDE.
- **Erreur CORS** → vérifier que `APP_URL` dans `.env` correspond bien à l'URL Vite (par défaut `http://localhost:5173`).
