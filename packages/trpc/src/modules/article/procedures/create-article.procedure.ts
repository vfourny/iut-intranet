import type { Article } from '@iut-intranet/db'
import { createArticleInputSchema } from '@iut-intranet/helpers/schemas/article'

import { authenticatedProcedure } from '@/procedures'

export const createArticleProcedure = authenticatedProcedure
  .input(createArticleInputSchema)
  .mutation(({ ctx, input }): Promise<Article> => {
    return ctx.services.article.create(input)
  })
