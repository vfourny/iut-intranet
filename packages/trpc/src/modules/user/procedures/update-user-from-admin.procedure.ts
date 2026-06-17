import { updateUserFromAdminInputSchema } from '@iut-intranet/helpers/schemas/user'

import { authenticatedProcedure } from '@/procedures'

export const updateUserFromAdmin = authenticatedProcedure
  .input(updateUserFromAdminInputSchema)
  .mutation(({ ctx, input }) => {
    return ctx.services.user.update(ctx.user.id, input)
  })
