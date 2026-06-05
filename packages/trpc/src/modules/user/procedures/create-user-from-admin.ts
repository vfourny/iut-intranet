import { createUserInputSchema } from '@iut-intranet/helpers/schemas/user'

import { adminProcedure } from '@/procedures'

export const createUserFromAdmin = adminProcedure
  .input(createUserInputSchema)
  .mutation(async ({ ctx, input }) => {
    return ctx.services.user.create(input)
  })
