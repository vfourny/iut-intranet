import { updateMeInputSchema } from '@iut-intranet/helpers/schemas/user'

import { authenticatedProcedure } from '@/procedures'

export const updateMeProcedure = authenticatedProcedure
  .input(updateMeInputSchema)
  .mutation(({ ctx, input }) => {
    return ctx.services.user.updateUser(input, ctx.user.id)
  })
