import { getEventByIdInputSchema } from '@iut-intranet/helpers/schemas/event'

import { adminProcedure } from '@/procedures'

export const getEventByIdProcedure = adminProcedure
  .input(getEventByIdInputSchema)
  .query(({ ctx, input }) => {
    return ctx.services.event.getById(input.id)
  })
