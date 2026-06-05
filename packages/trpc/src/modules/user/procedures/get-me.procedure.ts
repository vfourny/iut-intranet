import { authenticatedProcedure } from '@/procedures'

export const getMeProcedure = authenticatedProcedure.query(({ ctx }) => {
  return ctx.services.user.getById(ctx.user.id)
})
