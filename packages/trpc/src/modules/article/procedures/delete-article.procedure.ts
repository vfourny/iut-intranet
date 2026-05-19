import { deleteArticleInputSchema } from '@iut-intranet/helpers/schemas/article'

import { authenticatedProcedure } from '@/procedures'

export const deleteArticleProcedure = authenticatedProcedure
  .input(deleteArticleInputSchema)
  .mutation(({ ctx, input }) => {
    return ctx.services.article.delete(input.articleId)
  })
