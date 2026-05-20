import {
  getByIdInputSchema,
  updateArticleInputSchema,
} from '@iut-intranet/helpers/schemas/article'

import { authenticatedProcedure } from '@/procedures'

export const updateArticleProcedure = authenticatedProcedure
  .input(getByIdInputSchema.merge(updateArticleInputSchema))
  .mutation(({ ctx, input }) => {
    const { articleId, ...data } = input
    return ctx.services.article.update(articleId, data)
  })
