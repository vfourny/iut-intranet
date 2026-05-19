import { getByIdInputSchema } from '@iut-intranet/helpers/schemas/article'

import { authenticatedProcedure } from '@/procedures'

export const getArticleByIdProcedure = authenticatedProcedure
  .input(getByIdInputSchema)
  .query(({ ctx, input }) => {
    return ctx.services.article.getById(input.articleId)
  })
