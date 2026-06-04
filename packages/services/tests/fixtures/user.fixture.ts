import { faker } from '@faker-js/faker'
import { betterAuthInstance } from '@iut-intranet/auth'
import { prisma } from '@iut-intranet/db'

// Mot de passe de l'admin seedé (cf. packages/db/src/seeds/user.seed.ts).
export const DEFAULT_PASSWORD = 'Password123!'
export const ADMIN_EMAIL = 'admin@iut-intranet.com'

/** Extrait le cookie de session de la réponse better-auth en en-têtes de requête. */
const toSessionHeaders = (responseHeaders: Headers): Headers => {
  const headers = new Headers()
  const cookie = responseHeaders.get('set-cookie')
  if (cookie) headers.set('cookie', cookie)
  return headers
}

/**
 * Crée un utilisateur directement via Prisma (id cuid, rattaché à un département
 * seedé) pour les tests de `UserService`. On passe par Prisma — et non par
 * l'inscription better-auth — car better-auth génère des ids non-cuid, que
 * `userIdSchema` (z.cuid) rejette (cf. la note dans `auth.service.test.ts`).
 */
export const createDbUserFixture = async () => {
  const department = await prisma.department.findFirstOrThrow()
  return prisma.user.create({
    data: {
      departmentId: department.id,
      email: faker.internet.email().toLowerCase(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName().toUpperCase(),
    },
  })
}

/** Connecte l'administrateur seedé et renvoie sa session + son modèle Prisma. */
export const getAdminUserFixture = async () => {
  const { headers: responseHeaders } = await betterAuthInstance.api.signInEmail(
    {
      body: { email: ADMIN_EMAIL, password: DEFAULT_PASSWORD },
      returnHeaders: true,
    },
  )

  const user = await prisma.user.findUniqueOrThrow({
    where: { email: ADMIN_EMAIL },
  })

  return { headers: toSessionHeaders(responseHeaders), user }
}
