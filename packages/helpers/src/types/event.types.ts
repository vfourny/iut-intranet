import type { z } from 'zod'

import type {
  getEventByIdInputSchema,
  getVisibleEventsForUserInputSchema,
} from '@/schemas/event.schema'

export type getEventByIdInput = z.infer<typeof getEventByIdInputSchema>

export type getVisibleEventsForUserInput = z.infer<
  typeof getVisibleEventsForUserInputSchema
>
