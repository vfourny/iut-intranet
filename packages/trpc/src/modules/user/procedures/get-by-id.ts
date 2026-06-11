import { getByIdInputSchema } from '@iut-intranet/helpers/schemas/user'

import { authenticatedProcedure } from '@/procedures'

export const getByIdProcedure = authenticatedProcedure
  .input(getByIdInputSchema)
  .query(({ ctx, input }) => {
    return ctx.services.user.getById(input.userId, ctx.user.id)
  })
