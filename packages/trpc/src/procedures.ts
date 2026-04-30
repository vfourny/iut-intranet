import { errorMiddleware } from '@/middlewares/error.middleware'
import { requireAdminMiddleware } from '@/middlewares/require-admin.middleware'
import { requireAuthMiddleware } from '@/middlewares/require-auth.middleware'
import { procedure } from '@/trpc'

export const publicProcedure = procedure.concat(errorMiddleware)
export const authenticatedProcedure = publicProcedure.concat(
  requireAuthMiddleware,
)
export const adminProcedure = authenticatedProcedure.concat(
  requireAdminMiddleware,
)
