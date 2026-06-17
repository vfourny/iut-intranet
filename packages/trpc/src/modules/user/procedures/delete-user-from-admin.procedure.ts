import { deleteUserInputSchema } from '@iut-intranet/helpers/schemas/user'

import { adminProcedure } from '@/procedures'

export const deleteUser = adminProcedure
  .input(deleteUserInputSchema)
  .mutation(({ ctx, input }) => {
    return ctx.services.user.delete(input)
  })
