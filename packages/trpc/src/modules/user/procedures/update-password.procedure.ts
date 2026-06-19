import { updatePasswordInputSchema } from '@iut-intranet/helpers/schemas/user'

import { authenticatedProcedure } from '@/procedures'

export const updatePasswordProcedure = authenticatedProcedure
  .input(updatePasswordInputSchema)
  .mutation(({ ctx, input }) => {
    return ctx.services.user.updatePassword(input, ctx.headers)
  })
