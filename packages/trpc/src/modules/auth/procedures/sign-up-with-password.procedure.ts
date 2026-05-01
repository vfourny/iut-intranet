import { signUpWithPasswordInputSchema } from '@iut-intranet/helpers/schemas/auth'

import { publicProcedure } from '@/procedures'
import { formatResponseHeaders } from '@/utils'

export const signUpWithPasswordProcedure = publicProcedure
  .input(signUpWithPasswordInputSchema)
  .mutation(async ({ ctx, input }) => {
    const { services } = ctx
    const { body, headersResponse } = await services.auth.signUpWithPassword(
      input,
      ctx.headers,
    )

    formatResponseHeaders(ctx.res, headersResponse)

    const { user } = body
    return {
      user,
    }
  })
