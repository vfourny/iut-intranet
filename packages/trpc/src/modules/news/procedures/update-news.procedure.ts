import { updateNewsInputSchema } from '@iut-intranet/helpers/schemas/news'

import { authenticatedProcedure } from '@/procedures'

export const updateNewsProcedure = authenticatedProcedure
  .input(updateNewsInputSchema)
  .mutation(({ ctx, input }) => {
    return ctx.services.news.update(input, ctx.user.id)
  })
