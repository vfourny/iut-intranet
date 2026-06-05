import { listVisibleEventsInputSchema } from '@iut-intranet/helpers/schemas/event'

import { authenticatedProcedure } from '@/procedures'

export const listVisibleEventsProcedure = authenticatedProcedure
  .input(listVisibleEventsInputSchema)
  .query(({ ctx, input }) => {
    return ctx.services.event.listVisible(input, {
      id: ctx.user.id,
      role: ctx.user.role,
    })
  })
