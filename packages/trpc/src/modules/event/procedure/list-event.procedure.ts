import { adminProcedure } from '@/procedures'

export const listEventProcedure = adminProcedure.query(async ({ ctx }) => {
  return await ctx.services.event.list()
})
