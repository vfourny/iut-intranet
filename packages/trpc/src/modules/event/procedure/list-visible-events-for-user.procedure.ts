import { listVisibleEventsForUserInputSchema } from '@iut-intranet/helpers/schemas/event'

import { authenticatedProcedure } from '@/procedures'

export const listVisibleEventsForUserProcedure = authenticatedProcedure
  .input(listVisibleEventsForUserInputSchema)
  .query(({ ctx, input }) => {
    return ctx.services.event.listVisibleEventsForUser(input.userId)
  })
