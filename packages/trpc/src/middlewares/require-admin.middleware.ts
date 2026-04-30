import { isAdminRole } from '@iut-intranet/helpers/utils/role'
import { TRPCError } from '@trpc/server'

import { requireAuthMiddleware } from '@/middlewares/require-auth.middleware'

export const requireAdminMiddleware = requireAuthMiddleware.unstable_pipe(
  async ({ ctx, next }) => {
    const user = ctx.user
    const isAdmin = isAdminRole(user.role)
    if (!isAdmin) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Admin access required',
      })
    }

    return next()
  },
)
