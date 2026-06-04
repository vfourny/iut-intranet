import { authenticatedProcedure } from '@/procedures'

export const listHighlightProcedure = authenticatedProcedure.query(
  async ({ ctx }) => {
    return await ctx.services.highlight.list()
  },
)
