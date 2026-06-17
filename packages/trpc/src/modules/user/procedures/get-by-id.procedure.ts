import { getByIdInputSchema } from '@iut-intranet/helpers/schemas/user'

import { adminProcedure } from '@/procedures'

export const getByIdProcedure = adminProcedure
  .input(getByIdInputSchema)
  .query(({ ctx, input }) => {
    return ctx.services.user.getById(input.userId)
  })
