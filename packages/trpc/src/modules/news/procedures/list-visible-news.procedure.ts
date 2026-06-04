import { listVisibleNewsInputSchema } from '@iut-intranet/helpers/schemas/news'

import { authenticatedProcedure } from '@/procedures'

export const listVisibleNewsProcedure = authenticatedProcedure
  .input(listVisibleNewsInputSchema)
  .query(({ ctx, input }) => {
    return ctx.services.news.listVisible(input, ctx.user.id)
  })
