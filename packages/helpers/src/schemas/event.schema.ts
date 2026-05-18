import { z } from 'zod'

export const getEventByIdInputSchema = z.object({
  eventId: z.cuid(),
})

export const listVisibleEventsForUserInputSchema = z.object({
  userId: z.cuid(),
})

export const createEventFormulaireInputSchema = z.object({
  departmentId: z.cuid(),
  description: z.string().max(2000).optional(),
  endAt: z.coerce.date(),
  isPublic: z.boolean(),
  location: z.string().min(1),
  organizerId: z.cuid(),
  startAt: z.coerce.date(),
  titre: z.string().max(200).min(1),
})

export const updateEventFormulaireInputSchema = createEventFormulaireInputSchema
  .omit({ organizerId: true })
  .extend({ id: z.cuid() })
  .refine((data) => data.endAt > data.startAt, {
    message: 'La date de fin doit être après la date de début',
    path: ['endAt'],
  })

export const deleteEventInputSchema = z.object({
  id: z.cuid(),
})
