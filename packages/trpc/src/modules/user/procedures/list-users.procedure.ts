import { listUsersInputSchema } from '@iut-intranet/helpers/schemas/user'

import { authenticatedProcedure } from '@/procedures'

export const listUsersProcedure = authenticatedProcedure
  .input(listUsersInputSchema)
  .query(async ({ ctx, input }) => {
    return ctx.services.user.list(input)
  })
