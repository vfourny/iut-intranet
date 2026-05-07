import { getUserByIdInputSchema } from '@iut-intranet/helpers/schemas/user'

import { authenticatedProcedure } from '@/procedures'

export const getUserByIdProcedure = authenticatedProcedure
  .input(getUserByIdInputSchema)
  .query(async ({ ctx, input }) => {
    return ctx.services.user.getById(input.userId)
  })
