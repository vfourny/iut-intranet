import { z } from 'zod'

export const getEventByIdInputSchema = z.object({
  eventId: z.string(),
})

export const listVisibleEventsForUserInputSchema = z.object({
  userId: z.cuid(),
})

export const createEventFormulaireInputSchema = z.object({
  departmentIds: z.array(z.cuid()).min(1),
  description: z.string().max(2000).optional(),
  endAt: z.coerce.date(),
  isPublic: z.boolean().default(false),
  location: z.string().min(1),
  organizerId: z.cuid(),
  startAt: z.coerce.date(),
  titre: z.string().max(200).min(1),
})

export const updateEventFormulaireInputSchema = createEventFormulaireInputSchema
  .partial()
  .omit({ organizerId: true })
  .extend({ id: z.string() })
  .refine((data) => !data.endAt || !data.startAt || data.endAt > data.startAt, {
    message: 'La date de fin doit être après la date de début',
    path: ['endAt'],
  })

export const deleteEventInputSchema = z.object({
  id: z.cuid(),
})
