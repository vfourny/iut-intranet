#!/bin/sh
set -e

# Build uniquement ce dont le runtime de test a besoin :
#  - @iut-intranet/configs (consommé depuis son dist par chaque vitest.config.ts) ;
#  - le client Prisma généré.
# Tous les autres paquets internes sont résolus depuis leur source TypeScript via
# la condition d'export `source` (cf. packages/configs/src/vitest.ts) : pas de
# build complet du monorepo, et l'image de test reste découplée du build des apps.
npx turbo db:generate --filter=@iut-intranet/db
npx turbo build --filter=@iut-intranet/configs

# Migrations + seed de la base Postgres éphémère (départements, utilisateur
# admin, …) dont dépendent les tests d'intégration des services.
npx turbo db:deploy --filter=@iut-intranet/db
npx turbo db:seed --filter=@iut-intranet/db

npm run "${TEST_COMMAND:-test:exec}"
