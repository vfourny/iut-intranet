import {
  getByIdInputSchema,
  updateArticleInputSchema,
} from '@iut-intranet/helpers/schemas/article'

import { authenticatedProcedure } from '@/procedures'

export const updateArticleProcedure = authenticatedProcedure
  .input(getByIdInputSchema.merge(updateArticleInputSchema))
  .mutation(({ ctx, input }) => {
    return ctx.services.article.update(input, ctx.user.id)
  })
