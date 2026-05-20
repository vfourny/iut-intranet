import { authenticatedProcedure } from '@/procedures'

export const listArticleProcedure = authenticatedProcedure.query(({ ctx }) => {
  return ctx.services.article.list()
})
