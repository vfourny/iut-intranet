import { updateUserInputSchema } from '@iut-intranet/helpers/schemas/user'

import { adminProcedure } from '@/procedures'

export const updateUserProcedure = adminProcedure
  .input(updateUserInputSchema)
  .mutation(({ ctx, input }) => {
    const { userId, ...payload } = input
    return ctx.services.user.updateUser(payload, userId)
  })
