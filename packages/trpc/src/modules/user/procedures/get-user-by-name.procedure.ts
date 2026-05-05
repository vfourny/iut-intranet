import { getUserByNameInputSchema } from '@iut-intranet/helpers/schemas/user'

import { authenticatedProcedure } from '@/procedures'

export const getUsersByName = authenticatedProcedure
  .input(getUserByNameInputSchema)
  .query(async ({ ctx, input }) => {
    return ctx.services.user.getByName(input.name)
  })
