import { forgotPasswordInputSchema } from '@iut-intranet/helpers/schemas/auth'

import { publicProcedure } from '@/procedures'

export const forgotPasswordProcedure = publicProcedure
  .input(forgotPasswordInputSchema)
  .mutation(async ({ ctx, input }) => {
    await ctx.services.auth.forgotPassword(input.email, '/reset-password')
  })
