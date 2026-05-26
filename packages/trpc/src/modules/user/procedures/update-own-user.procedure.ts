import { updateOwnProfileInputSchema } from '@iut-intranet/helpers/schemas/user'

import { authenticatedProcedure } from '@/procedures'

export const updateOwnUserProcedure = authenticatedProcedure
  .input(updateOwnProfileInputSchema)
  .mutation(({ ctx, input }) => {
    return ctx.services.user.updateOwnUser(input, ctx.user.id)
  })
