import { authenticatedProcedure } from '@/procedures'
import { formatResponseHeaders } from '@/utils'

export const signOutProcedure = authenticatedProcedure.mutation(
  async ({ ctx }) => {
    const { services } = ctx
    const { headersResponse, success } = await services.auth.signOut(
      ctx.headers,
    )

    formatResponseHeaders(ctx.res, headersResponse)

    return { success }
  },
)
