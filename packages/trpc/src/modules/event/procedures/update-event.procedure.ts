import { updateEventInputSchema } from '@iut-intranet/helpers/schemas/event'

import { authenticatedProcedure } from '@/procedures'

export const updateEventProcedure = authenticatedProcedure
  .input(updateEventInputSchema)
  .mutation(({ ctx, input }) =>
    ctx.services.event.updateEvent(input, {
      id: ctx.user.id,
      role: ctx.user.role,
    }),
  )
