import { ArticleStatus } from '@iut-intranet/db'
import z from 'zod'

export const createArticleInputSchema = z.object({
  authorId: z.cuid(),
  content: z.record(z.string(), z.unknown()),
  coverUrl: z.string().optional(),
  createAt: z.date(),
  excerpt: z.string().optional(),
  publishedAt: z.date(),
  status: z.enum(ArticleStatus),
  targetDepartmentIds: z.array(z.string()).default([]),
  title: z.string(),
  updateAt: z.date(),
})

export const updateArticleInputSchema = createArticleInputSchema.partial()

export const getByIdInputSchema = z.object({
  articleId: z.cuid(),
})

export const deleteArticleInputSchema = getByIdInputSchema

export const listVisibleArticlesForUser = z.object({
  userId: z.cuid(),
})
