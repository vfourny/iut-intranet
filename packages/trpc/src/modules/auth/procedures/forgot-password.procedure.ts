import { forgotPasswordInputSchema } from '@iut-intranet/helpers/schemas/auth'

import { publicProcedure } from '@/procedures'

export const forgotPasswordProcedure = publicProcedure
  .input(forgotPasswordInputSchema)
  .mutation(async ({ ctx, input }) => {
    const { services } = ctx
    return await services.auth.forgotPassword(input)
  })
