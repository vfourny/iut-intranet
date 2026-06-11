import { resetPasswordInputSchema } from '@iut-intranet/helpers/schemas/auth'

import { publicProcedure } from '@/procedures'

export const resetPasswordProcedure = publicProcedure
  .input(resetPasswordInputSchema)
  .mutation(async ({ ctx, input }) => {
    await ctx.services.auth.resetPassword(input.token, input.newPassword)
  })
