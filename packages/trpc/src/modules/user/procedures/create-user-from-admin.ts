import { createUserSchema } from '@iut-intranet/helpers/schemas/user'

import { adminProcedure } from '@/procedures'

export const createUserFromAdmin = adminProcedure
  .input(createUserSchema)
  .mutation(async ({ ctx, input }) => {
    return ctx.services.user.create(ctx.user.id, input)
  })
