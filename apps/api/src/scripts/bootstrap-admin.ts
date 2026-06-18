import { randomBytes } from 'node:crypto'

import { betterAuthInstance } from '@iut-intranet/auth'
import { createLogger } from '@iut-intranet/configs/logger'
import { prisma } from '@iut-intranet/db'
import { UserRole } from '@iut-intranet/db/enums'
import { getServerEnv } from '@iut-intranet/helpers/env'
import { MIN_PASSWORD_LENGTH } from '@iut-intranet/helpers/schemas/auth'

const logger = createLogger('bootstrap-admin')

const ADMIN_FIRST_NAME = 'Admin'
const ADMIN_LAST_NAME = 'ADMIN'

/**
 * Provisions the first ADMIN account in an environment that has none.
 *
 * Idempotent and safe to run on every deploy: it no-ops as soon as an admin
 * exists, so it never touches data managed afterwards through the app. The
 * account goes through better-auth (argon2 hash + `account` row + schema field
 * mapping) rather than a raw insert, mirroring `UserService.create`.
 */
async function bootstrapAdmin() {
  const { ADMIN_EMAIL, ADMIN_PASSWORD } = getServerEnv(
    'ADMIN_EMAIL',
    'ADMIN_PASSWORD',
  )

  if (!ADMIN_EMAIL) {
    logger.warn('ADMIN_EMAIL is not set — skipping admin bootstrap.')
    return
  }

  if (ADMIN_PASSWORD && ADMIN_PASSWORD.length < MIN_PASSWORD_LENGTH) {
    throw new Error(
      `ADMIN_PASSWORD must be at least ${MIN_PASSWORD_LENGTH} characters long.`,
    )
  }

  const adminCount = await prisma.user.count({
    where: { role: UserRole.ADMIN },
  })
  if (adminCount > 0) {
    logger.info('An admin already exists — nothing to do.')
    return
  }

  // No admin yet: promote the account already owning that email if there is one,
  // otherwise provision a fresh one with a random password.
  const existing = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL },
  })
  if (existing) {
    await prisma.user.update({
      data: { role: UserRole.ADMIN },
      where: { id: existing.id },
    })
    logger.info({ email: ADMIN_EMAIL }, 'Existing user promoted to ADMIN.')
    return
  }

  // Prefer the password provided via env; otherwise generate one and surface it
  // once in the logs.
  const isGenerated = !ADMIN_PASSWORD
  const password = ADMIN_PASSWORD ?? randomBytes(12).toString('base64url')

  await betterAuthInstance.api.createUser({
    body: {
      data: { firstName: ADMIN_FIRST_NAME, role: UserRole.ADMIN },
      email: ADMIN_EMAIL,
      name: ADMIN_LAST_NAME,
      password,
    },
  })

  if (isGenerated) {
    logger.info(
      { email: ADMIN_EMAIL, password },
      'Admin created with a generated password. Copy it now — it will NOT be ' +
        'shown again. Sign in and change it from the app.',
    )
    return
  }

  logger.info(
    { email: ADMIN_EMAIL },
    'Admin created with the password from ADMIN_PASSWORD. ' +
      'Sign in and change it from the app.',
  )
}

bootstrapAdmin()
  .catch((error) => {
    logger.error(error, 'Bootstrap admin failed.')
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
