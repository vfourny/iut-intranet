import { z } from 'zod'

export const getEventByIdInputSchema = z.object({
  eventId: z.cuid(),
})

export const getVisibleEventsForUserInputSchema = z.object({
  userId: z.cuid(),
})
