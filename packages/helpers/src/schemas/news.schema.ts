import { DepartmentCode, NewsStatus } from '@iut-intranet/db/enums'
import { z } from 'zod'

import { newsIdSchema } from '@/schemas/brand.schema'
import { paginationSchema, searchSchema } from '@/schemas/common.schema'
import { uploadObjectInputSchema } from '@/schemas/storage.schema'

// ── Inputs (écriture) ─────────────────────────────────────────────────────────

const newsWriteSchema = z.object({
  content: z.string().trim().min(1, 'Une news doit avoir un contenu'),
  cover: uploadObjectInputSchema.optional(),
  targetDepartmentCodes: z.array(z.enum(DepartmentCode)).default([]),
  title: z.string().trim().min(1, 'Une news doit avoir un titre'),
})

const withStatusDiscriminator = <Shape extends z.ZodRawShape>(
  base: z.ZodObject<Shape>,
) =>
  z.discriminatedUnion('status', [
    // SCHEDULED est la seule variante qui porte une date ; DRAFT, PUBLISHED et
    // ARCHIVED partagent la même forme (statut seul), donc une branche unique.
    // La résolution du `publishedAt` propre à chaque statut vit dans le service.
    base
      .extend({
        publishedAt: z.coerce.date(),
        status: z.literal(NewsStatus.SCHEDULED),
      })
      .strict(),
    base
      .extend({
        status: z.enum([
          NewsStatus.DRAFT,
          NewsStatus.PUBLISHED,
          NewsStatus.ARCHIVED,
        ]),
      })
      .strict(),
  ])

export const createNewsInputSchema = withStatusDiscriminator(newsWriteSchema)
export type CreateNewsInput = z.infer<typeof createNewsInputSchema>

export const updateNewsInputSchema = withStatusDiscriminator(
  newsWriteSchema.partial().extend({ newsId: newsIdSchema }),
)
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
