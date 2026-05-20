import type z from 'zod'

import type {
  createArticleInputSchema,
  deleteArticleInputSchema,
  getByIdInputSchema,
  updateArticleInputSchema,
} from '@/schemas/article.schema'

export type createArticleInput = z.infer<typeof createArticleInputSchema>

export type updateArticleInput = z.infer<typeof updateArticleInputSchema>

export type deleteArticleInput = z.infer<typeof deleteArticleInputSchema>

export type getByIdInput = z.infer<typeof getByIdInputSchema>
