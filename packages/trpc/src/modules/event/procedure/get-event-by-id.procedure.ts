import { getEventByIdInputSchema } from '@iut-intranet/helpers/schemas/event'

import { authenticatedProcedure } from '@/procedures'

export const getEventByIdProcedure = authenticatedProcedure
  .input(getEventByIdInputSchema)
  .query(({ ctx, input }) => {
    return ctx.services.event.getById(input.eventId)
  })
