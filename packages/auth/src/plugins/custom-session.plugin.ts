import { prisma } from '@iut-intranet/db'
import { customSession } from 'better-auth/plugins'

export const customSessionPluginConfig = customSession(async ({ session }) => {
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  })

  if (!user) {
    throw new Error('User not found')
  }

  return {
    user,
  }
})
