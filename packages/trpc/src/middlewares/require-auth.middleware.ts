import { userIdSchema } from '@iut-intranet/helpers/schemas/brand'
import { TRPCError } from '@trpc/server'

import { middleware } from '@/trpc'

export const requireAuthMiddleware = middleware(async ({ ctx, next }) => {
  const session = await ctx.services.auth.getSession(ctx.headers)
  if (!session?.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Authentication required',
    })
  }

  return next({
    ctx: {
      ...ctx,
      // `parse` valide le format (cuid) ET appose le brand `UserId`, sans cast :
      // tous les `ctx.user.id` qui alimentent les services en héritent.
      user: { ...session.user, id: userIdSchema.parse(session.user.id) },
    },
  })
})
