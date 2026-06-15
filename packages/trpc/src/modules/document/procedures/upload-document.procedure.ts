import { uploadDocumentInputSchema } from '@iut-intranet/helpers/schemas/document'

import { authenticatedProcedure } from '@/procedures'

export const uploadDocumentProcedure = authenticatedProcedure
  .input(uploadDocumentInputSchema)
  .mutation(async ({ ctx, input }) => {
    return await ctx.services.document.upload(input)
  })
