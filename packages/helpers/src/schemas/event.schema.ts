import { z } from 'zod'

export const getEventByIdInputSchema = z.object({
  eventId: z.cuid(),
})
