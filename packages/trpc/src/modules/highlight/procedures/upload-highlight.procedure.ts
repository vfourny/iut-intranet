import { uploadHighlightInputSchema } from '@iut-intranet/helpers/schemas/highlight'

import { authenticatedProcedure } from '@/procedures'

export const uploadHighlightProcedure = authenticatedProcedure
  .input(uploadHighlightInputSchema)
  .mutation(async ({ ctx, input }) => {
    return await ctx.services.highlight.upload(input)
  })
