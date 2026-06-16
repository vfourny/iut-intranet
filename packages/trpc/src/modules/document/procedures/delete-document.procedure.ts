import { deleteDocumentInputSchema } from '@iut-intranet/helpers/schemas/document'

import { authenticatedProcedure } from '@/procedures'

export const deleteDocumentProcedure = authenticatedProcedure
  .input(deleteDocumentInputSchema)
  .mutation(async ({ ctx, input }) => {
    return await ctx.services.document.delete(ctx.user.id, input.key)
  })
