import { deleteUserInputSchema } from '@iut-intranet/helpers/schemas/user'

import { adminProcedure } from '@/procedures'

export const deleteUserProcedure = adminProcedure
  .input(deleteUserInputSchema)
  .mutation(async ({ ctx, input }) => {
    return ctx.services.user.delete(input.userId, ctx.headers)
  })
