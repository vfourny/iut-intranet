import { updateEventFormulaireInputSchema } from '@iut-intranet/helpers/schemas/event'
import { TRPCError } from '@trpc/server'

import { authenticatedProcedure } from '@/procedures'

export const updateEventProcedure = authenticatedProcedure
  .input(updateEventFormulaireInputSchema)
  .mutation(async ({ ctx, input }) => {
    const event = await ctx.services.event.getById(input.id)
    if (event.organizerId !== ctx.user.id && ctx.user.role !== 'ADMIN') {
      throw new TRPCError({ code: 'FORBIDDEN' })
    }
    return ctx.services.event.updateEvent(event.id, input)
  })
