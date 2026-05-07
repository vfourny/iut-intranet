import { listUsersInputSchema } from '@iut-intranet/helpers/schemas/user'

import { adminProcedure } from '@/procedures'

export const listUsersProcedure = adminProcedure
  .input(listUsersInputSchema)
  .query(async ({ ctx, input }) => {
    return ctx.services.user.list(input)
  })
