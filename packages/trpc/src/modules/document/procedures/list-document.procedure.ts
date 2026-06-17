import { authenticatedProcedure } from '@/procedures'

export const listDocumentProcedure = authenticatedProcedure.query(
  async ({ ctx }) => {
    return await ctx.services.document.list()
  },
)
