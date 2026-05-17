import type { Prisma } from '@iut-intranet/db'
import type { z } from 'zod'

import type {
  createEventFormulaireInputSchema,
  getEventByIdInputSchema,
  listVisibleEventsForUserInputSchema,
} from '@/schemas/event.schema'

export type getEventByIdInput = z.infer<typeof getEventByIdInputSchema>

export type listVisibleEventsForUserInput = z.infer<
  typeof listVisibleEventsForUserInputSchema
>

export type EventWithDepartment = Prisma.EventGetPayload<{
  include: { department: true }
}>

export type createEventFormulaireInput = z.infer<
  typeof createEventFormulaireInputSchema
>
