import type { z } from 'zod'

import type {
  getEventByIdInputSchema,
  listVisibleEventsForUserInputSchema,
} from '@/schemas/event.schema'

export type getEventByIdInput = z.infer<typeof getEventByIdInputSchema>

export type listVisibleEventsForUserInput = z.infer<
  typeof listVisibleEventsForUserInputSchema
>
