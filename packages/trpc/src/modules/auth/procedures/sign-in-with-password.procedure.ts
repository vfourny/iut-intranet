import { signInWithPasswordInputSchema } from '@iut-intranet/helpers/schemas/auth'

import { publicProcedure } from '@/procedures'
import { formatResponseHeaders } from '@/utils'

export const signInWithPasswordProcedure = publicProcedure
  .input(signInWithPasswordInputSchema)
  .mutation(async ({ ctx, input }) => {
    const { services } = ctx
    const { body, headersResponse } = await services.auth.signInWithPassword(
      input,
      ctx.headers,
    )

    formatResponseHeaders(ctx.res, headersResponse)

    const { user } = body
    return {
      user,
    }
  })
