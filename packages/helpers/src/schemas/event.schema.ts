import { z } from 'zod'

export const getEventByIdInputSchema = z.object({
  eventId: z.cuid(),
})

export const listVisibleEventsForUserInputSchema = z.object({
  userId: z.cuid(),
})
