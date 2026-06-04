import type { News } from '@iut-intranet/db'
import { createNewsInputSchema } from '@iut-intranet/helpers/schemas/news'

import { authenticatedProcedure } from '@/procedures'

export const createNewsProcedure = authenticatedProcedure
  .input(createNewsInputSchema)
  .mutation(({ ctx, input }): Promise<News> => {
    return ctx.services.news.create(input, ctx.user.id)
  })
