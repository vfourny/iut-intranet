import { authenticatedProcedure } from '@/procedures'

export const listEventsProcedure = authenticatedProcedure.query(
  async ({ ctx }) => {
    return await ctx.services.event.list()
  },
)
