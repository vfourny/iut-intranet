import { authenticatedProcedure } from '@/procedures'

export const listImageProcedure = authenticatedProcedure.query(
  async ({ ctx }) => {
    return await ctx.services.image.list()
  },
)
