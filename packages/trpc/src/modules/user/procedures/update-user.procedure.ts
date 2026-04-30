import { updateUserInputSchema } from '@iut-intranet/helpers/schemas/user'

import { adminProcedure } from '@/procedures'

export const updateUserProcedure = adminProcedure
  .input(updateUserInputSchema)
  .mutation(async ({ ctx, input }) => {
    return ctx.services.user.update(input, ctx.headers)
  })
