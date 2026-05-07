import { z } from 'zod'

export const getEventByIdInputSchema = z.object({
  id: z.string(),
})
