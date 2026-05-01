import { resetPasswordInputSchema } from '@iut-intranet/helpers/schemas/auth'

import { publicProcedure } from '@/procedures'

export const resetPasswordProcedure = publicProcedure
  .input(resetPasswordInputSchema)
  .mutation(async ({ ctx, input }) => {
    const { services } = ctx
    const isPasswordReset = await services.auth.resetPassword(input)
    return {
      success: isPasswordReset,
    }
  })
