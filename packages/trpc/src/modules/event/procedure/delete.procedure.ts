import { deleteEventInputSchema } from '@iut-intranet/helpers/schemas/event'

import { authenticatedProcedure } from '@/procedures'

export const deleteEventProcedure = authenticatedProcedure
  .input(deleteEventInputSchema)
  .mutation(({ ctx, input }) => {
    return ctx.services.event.deleteEvent(input.id)
  })
