import { listVisibleArticlesForUser } from '@iut-intranet/helpers/schemas/article'

import { authenticatedProcedure } from '@/procedures'

export const listVisibleArticlesForUserProcedure = authenticatedProcedure
  .input(listVisibleArticlesForUser)
  .query(({ ctx, input }) => {
    return ctx.services.article.listVisibleForUser(input.userId)
  })
