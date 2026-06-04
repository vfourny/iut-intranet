import type { Prisma } from '@iut-intranet/db'
import type { z } from 'zod'

import type {
  createEventFormulaireInputSchema,
  deleteEventInputSchema,
  getEventByIdInputSchema,
  listVisibleEventsForUserInputSchema,
  updateEventFormulaireInputSchema,
} from '@/schemas/event.schema'

export type EventModel = Prisma.EventGetPayload<{
  include: {
    departments: true
    invitations: true
  }
}>

export type getEventByIdInput = z.infer<typeof getEventByIdInputSchema>

export type listVisibleEventsForUserInput = z.infer<
  typeof listVisibleEventsForUserInputSchema
>

export type EventWithDepartment = Prisma.EventGetPayload<{
  include: { departments: true }
}>

export type createEventFormulaireInput = z.infer<
  typeof createEventFormulaireInputSchema
>

export type updateEventFormulaireInput = z.infer<
  typeof updateEventFormulaireInputSchema
>

export type deleteEventInput = z.infer<typeof deleteEventInputSchema>
