import { TRPCError } from '@trpc/server'

import { procedure } from '@/trpc'

export const requireAuthMiddleware = procedure.use(async ({ ctx, next }) => {
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
      activeOrganization: session.activeOrganization,
      user: session.user,
    },
  })
})
