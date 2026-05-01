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
      user: session.user,
    },
  })
})
