import { uploadImageInputSchema } from '@iut-intranet/helpers/schemas/image'

import { authenticatedProcedure } from '@/procedures'

export const uploadArticleCoverProcedure = authenticatedProcedure
  .input(uploadImageInputSchema)
  .mutation(({ ctx, input }): Promise<string> => {
    return ctx.services.article.uploadCover(input)
  })
