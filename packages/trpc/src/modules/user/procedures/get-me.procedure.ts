import { authenticatedProcedure } from '@/procedures'

export const getMeProcedure = authenticatedProcedure.query(async ({ ctx }) => {
  return ctx.services.user.getById(ctx.user.id)
})
