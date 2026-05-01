import { getUserByIdInputSchema } from '@iut-intranet/helpers/schemas/user'

import { adminProcedure } from '@/procedures'

export const getUserByIdProcedure = adminProcedure
  .input(getUserByIdInputSchema)
  .query(async ({ ctx, input }) => {
    return ctx.services.user.getById(input.userId)
  })
