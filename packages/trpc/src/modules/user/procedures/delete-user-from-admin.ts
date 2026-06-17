import { deleteUserInputSchema } from '@iut-intranet/helpers/schemas/user'

import { authenticatedProcedure } from '@/procedures'

export const deleteUser = authenticatedProcedure
  .input(deleteUserInputSchema)
  .mutation(({ ctx, input }) => {
    return ctx.services.user.delete(input, ctx.user.id)
  })
