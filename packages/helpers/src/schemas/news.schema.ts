import { DepartmentCode, NewsStatus } from '@iut-intranet/db/enums'
import { z } from 'zod'

import { newsIdSchema } from '@/schemas/brand.schema'
import { paginationSchema, searchSchema } from '@/schemas/common.schema'
import { uploadObjectInputSchema } from '@/schemas/storage.schema'
import { resolvePublishedAt } from '@/utils/news.util'

// ── Inputs (écriture) ─────────────────────────────────────────────────────────

const newsWriteSchema = z.object({
  content: z.string().trim().min(1, 'Une news doit avoir un contenu'),
  cover: uploadObjectInputSchema.optional(),
  publishedAt: z.coerce.date().nullable().optional(),
  status: z.enum(NewsStatus).default(NewsStatus.DRAFT),
  targetDepartmentCodes: z.array(z.enum(DepartmentCode)).default([]),
  title: z.string().trim().min(1, 'Une news doit avoir un titre'),
})

const normalizePublishedAt = <
  T extends { status?: NewsStatus; publishedAt?: Date | null },
>(
  data: T,
) => {
  // Pas de nouveau statut (update partiel) → on ne touche pas à publishedAt ni n'injecte la clé.
  if (data.status === undefined) return data

  return {
    ...data,
    // PUBLISHED → null : la date est pilotée par le service (horloge), le schéma défère.
    publishedAt: resolvePublishedAt(data.status, data.publishedAt, null),
  }
}

const scheduledHasPublishedAt = (data: {
  status?: NewsStatus
  publishedAt?: Date | null
}) => data.status !== NewsStatus.SCHEDULED || !!data.publishedAt

export const createNewsInputSchema = newsWriteSchema
  .strict()
  .refine(scheduledHasPublishedAt, {
    message: 'Une news programmée doit avoir une date de publication',
    path: ['publishedAt'],
  })
  .transform(normalizePublishedAt)
export type CreateNewsInput = z.infer<typeof createNewsInputSchema>

// Pas de refine/transform ici : la cohérence statut↔date dépend de l'état
// stocké (statut mergé + publishedAt déjà en base), que le schéma ne connaît
// pas. Le service la pilote via resolvePublishedAt + validateStatus.
export const updateNewsInputSchema = newsWriteSchema
  .partial()
  .extend({
    newsId: newsIdSchema,
  })
  .strict()
export type UpdateNewsInput = z.infer<typeof updateNewsInputSchema>

// ── Inputs (lecture) ──────────────────────────────────────────────────────────

export const getNewsByIdInputSchema = z
  .object({
    newsId: newsIdSchema,
  })
  .strict()
export type GetNewsByIdInput = z.infer<typeof getNewsByIdInputSchema>

export const listVisibleNewsInputSchema = paginationSchema
  .extend({
    departmentCodes: z.array(z.enum(DepartmentCode)).default([]),
    search: searchSchema,
    status: z
      .array(z.enum(NewsStatus))
      .min(1, 'Au moins un statut doit être sélectionné'),
  })
  .strict()
export type ListVisibleNewsInput = z.infer<typeof listVisibleNewsInputSchema>
