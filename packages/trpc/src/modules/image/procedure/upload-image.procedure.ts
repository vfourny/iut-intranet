import { uploadImageInputSchema } from '@iut-intranet/helpers/schemas/image'

import { authenticatedProcedure } from '@/procedures'

export const uploadImageProcedure = authenticatedProcedure
  .input(uploadImageInputSchema)
  .mutation(async ({ ctx, input }) => {
    return await ctx.services.image.upload(input)
  })
