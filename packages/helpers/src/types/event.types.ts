import type { Prisma } from '@iut-intranet/db'
import type { z } from 'zod'

import type {
  createEventFormulaireInputSchema,
  getEventByIdInputSchema,
  getVisibleEventsForUserInputSchema,
} from '@/schemas/event.schema'

export type getEventByIdInput = z.infer<typeof getEventByIdInputSchema>

export type getVisibleEventsForUserInput = z.infer<
  typeof getVisibleEventsForUserInputSchema
>

export type EventWithDepartment = Prisma.EventGetPayload<{
  include: { department: true }
}>

export type createEventFormulaireInput = z.infer<
  typeof createEventFormulaireInputSchema
>
