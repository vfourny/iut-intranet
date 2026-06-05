import type { Prisma } from '@iut-intranet/db'
import { DepartmentCode } from '@iut-intranet/db/enums'
import { z } from 'zod'

import { eventIdSchema } from '@/schemas/brand.schema'

const MAX_TITLE_LENGTH = 200
const MAX_DESCRIPTION_LENGTH = 2000

// ── Lecture ───────────────────────────────────────────────────────────────────

// Fenêtre visible du calendrier (FullCalendar `datesSet`). Optionnelle : sans
// bornes, on renvoie tous les events visibles (utile au premier rendu).
export const listVisibleEventsInputSchema = z
  .object({
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
  })
  .strict()
export type ListVisibleEventsInput = z.infer<
  typeof listVisibleEventsInputSchema
>

// ── Écriture ──────────────────────────────────────────────────────────────────

// Champs d'écriture partagés par create/update. Gardé comme objet « nu » pour
// rester composable (`.omit`/`.partial`/`.extend`) : l'invariant d'ordre des
// dates est appliqué via `.refine` sur chaque schéma final, car `.refine`
// produit un `ZodEffects` qui n'est plus composable.
export const eventWriteSchema = z.object({
  // L'organisateur est dérivé de la session (ctx.user.id), jamais de l'input.
  // Un event cible un ou plusieurs départements par leur code métier ; le
  // service résout les codes vers les ids en base (le code est `@unique`),
  // comme pour les news. Au moins un département est requis.
  departmentCodes: z.array(z.enum(DepartmentCode)).min(1),
  description: z.string().max(MAX_DESCRIPTION_LENGTH).optional(),
  endAt: z.coerce.date(),
  isPublic: z.boolean().default(false),
  location: z.string().min(1),
  startAt: z.coerce.date(),
  title: z.string().max(MAX_TITLE_LENGTH).min(1),
})

// Invariant validable depuis le seul payload (aucun état externe) : il vit donc
// dans le schéma, pas dans le service. Tolère les bornes manquantes (update
// partiel) : on ne vérifie l'ordre que lorsque les deux dates sont présentes.
const endAtIsAfterStartAt = (data: { startAt?: Date; endAt?: Date }) =>
  !data.endAt || !data.startAt || data.endAt > data.startAt
const endAtIsAfterStartAtParams = {
  message: 'La date de fin doit être après la date de début',
  path: ['endAt'],
}

export const createEventInputSchema = eventWriteSchema
  .strict()
  .refine(endAtIsAfterStartAt, endAtIsAfterStartAtParams)
export type CreateEventInput = z.infer<typeof createEventInputSchema>

export const updateEventInputSchema = eventWriteSchema
  .partial()
  .extend({ id: eventIdSchema })
  .strict()
  .refine(endAtIsAfterStartAt, endAtIsAfterStartAtParams)
export type UpdateEventInput = z.infer<typeof updateEventInputSchema>

export const deleteEventInputSchema = z
  .object({
    eventId: eventIdSchema,
  })
  .strict()
export type DeleteEventInput = z.infer<typeof deleteEventInputSchema>

// ── Types issus de la base (Prisma) ───────────────────────────────────────────
// Exception : non dérivé d'un schéma zod, mais d'un payload Prisma. Reste ici
// par cohésion (tout ce qui concerne l'event au même endroit) faute d'un fichier
// de types DB dédié.

export type EventWithDepartments = Prisma.EventGetPayload<{
  include: { departments: true }
}>
