import { getNewsByIdInputSchema } from '@iut-intranet/helpers/schemas/news'

import { authenticatedProcedure } from '@/procedures'

export const getNewsByIdProcedure = authenticatedProcedure
  .input(getNewsByIdInputSchema)
  .query(({ ctx, input }) => {
    return ctx.services.news.getById(input.newsId)
  })
