import { deleteEventInputSchema } from '@iut-intranet/helpers/schemas/event'

import { authenticatedProcedure } from '@/procedures'

export const deleteEventProcedure = authenticatedProcedure
  .input(deleteEventInputSchema)
  .mutation(({ ctx, input }) =>
    ctx.services.event.deleteEvent(input.eventId, {
      id: ctx.user.id,
      role: ctx.user.role,
    }),
  )
