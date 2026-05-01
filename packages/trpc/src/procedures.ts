import { errorMiddleware } from '@/middlewares/error.middleware'
import { requireAdminMiddleware } from '@/middlewares/require-admin.middleware'
import { requireAuthMiddleware } from '@/middlewares/require-auth.middleware'
import { procedure } from '@/trpc'

export const publicProcedure = procedure.use(errorMiddleware)
export const authenticatedProcedure = publicProcedure.use(requireAuthMiddleware)
export const adminProcedure = publicProcedure.use(requireAdminMiddleware)
