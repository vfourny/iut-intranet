import { getVisibleEventsForUserInputSchema } from '@iut-intranet/helpers/schemas/event'

import { authenticatedProcedure } from '@/procedures'

export const getVisibleEventsForUserProcedure = authenticatedProcedure
  .input(getVisibleEventsForUserInputSchema)
  .query(({ ctx, input }) => {
    return ctx.services.event.getVisibleEventsForUser(input.userId)
  })
