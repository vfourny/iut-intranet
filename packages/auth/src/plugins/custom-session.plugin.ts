import { prisma } from '@iut-intranet/db'
import { customSession } from 'better-auth/plugins'

export const customSessionPluginConfig = customSession(async ({ session }) => ({
  user: await prisma.user.findUniqueOrThrow({ where: { id: session.userId } }),
}))
