import { createEventFormulaireInputSchema } from '@iut-intranet/helpers/schemas/event'

import { authenticatedProcedure } from '@/procedures'

export const createEventProcedure = authenticatedProcedure
  .input(createEventFormulaireInputSchema)
  .mutation(({ ctx, input }) => {
    return ctx.services.event.createEvent({
      ...input,
      organizerId: ctx.user.id,
    })
  })
