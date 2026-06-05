import { createEventInputSchema } from '@iut-intranet/helpers/schemas/event'

import { authenticatedProcedure } from '@/procedures'

export const createEventProcedure = authenticatedProcedure
  .input(createEventInputSchema)
  .mutation(({ ctx, input }) => {
    return ctx.services.event.createEvent(input, ctx.user.id)
  })
