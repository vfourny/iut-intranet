import { definePackageProject } from '@iut-intranet/configs/vitest'

export default definePackageProject(import.meta.dirname, {
  // Les tests de services partagent une vraie base Postgres : on désactive le
  // parallélisme entre fichiers pour éviter les courses sur l'état partagé.
  fileParallelism: false,
  name: 'services',
  setupFiles: ['./tests/setup.ts'],
})
