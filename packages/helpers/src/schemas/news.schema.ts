import { DepartmentCode, NewsStatus } from '@iut-intranet/db/enums'
import { z } from 'zod'

import { newsIdSchema } from '@/schemas/brand.schema'
import { paginationSchema, searchSchema } from '@/schemas/common.schema'
import { uploadObjectInputSchema } from '@/schemas/storage.schema'

// ── Inputs (écriture) ─────────────────────────────────────────────────────────

const newsWriteSchema = z.object({
  content: z.string().trim().min(1, 'Une news doit avoir un contenu'),
  cover: uploadObjectInputSchema.optional(),
  publishedAt: z.coerce.date().nullable().optional(),
  status: z.enum(NewsStatus).default(NewsStatus.DRAFT),
  targetDepartmentCodes: z.array(z.string()).default([]),
  title: z.string().trim().min(1, 'Une news doit avoir un titre'),
})

const normalizePublishedAt = <
  T extends { status?: NewsStatus; publishedAt?: Date | null },
>(
  data: T,
) => ({
  ...data,
  publishedAt:
    data.status === NewsStatus.DRAFT || data.status === NewsStatus.PUBLISHED
      ? null
      : data.publishedAt,
})

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

export const updateNewsInputSchema = newsWriteSchema
  .partial()
  .extend({
    newsId: newsIdSchema,
  })
  .strict()
  .refine(scheduledHasPublishedAt, {
    message: 'Une news programmée doit avoir une date de publication',
    path: ['publishedAt'],
  })
  .transform(normalizePublishedAt)
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
    status: z.enum(NewsStatus),
  })
  .strict()
export type ListVisibleNewsInput = z.infer<typeof listVisibleNewsInputSchema>
