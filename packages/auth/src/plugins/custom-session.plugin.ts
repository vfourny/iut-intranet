import { prisma } from '@iut-intranet/db'
import { getSignedObjectUrl } from '@iut-intranet/providers/s3'
import { customSession } from 'better-auth/plugins'

export const customSessionPluginConfig = customSession(async ({ session }) => {
  const user = await prisma.user.findUniqueOrThrow({
    include: { departments: true },
    where: { id: session.userId },
  })

  return {
    user: {
      ...user,
      image: user.image ? await getSignedObjectUrl(user.image) : null,
    },
  }
})
