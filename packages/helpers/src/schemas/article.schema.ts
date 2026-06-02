import { ArticleStatus, DepartmentCode } from '@iut-intranet/db/enums'
import z from 'zod'

const editorJsBlockSchema = z.object({
  data: z.record(z.string(), z.unknown()),
  id: z.string().optional(),
  type: z.string(),
})

export const editorJsContentSchema = z.object({
  blocks: z.array(editorJsBlockSchema),
  time: z.number().optional(),
  version: z.string().optional(),
})

export const articleSchema = z.object({
  author: z.object({
    firstName: z.string(),
    lastName: z.string(),
  }),
  content: editorJsContentSchema,
  coverUrl: z.string().nullable(),
  excerpt: z.string().nullable(),
  id: z.string().cuid(),
  publishedAt: z.coerce.date().nullable(),
  status: z.enum(ArticleStatus),
  targetDepartments: z.array(
    z.object({
      code: z.enum(DepartmentCode),
    }),
  ),
  title: z.string(),
})

export const createArticleInputSchema = z.object({
  authorId: z.string().cuid(),
  content: editorJsContentSchema,
  coverUrl: z.string().optional(),
  createAt: z.coerce.date(),
  targetDepartmentIds: z.array(z.string()).default([]),
  title: z.string(),
  updateAt: z.coerce.date(),
})

export const updateArticleInputSchema = createArticleInputSchema
  .partial()
  .extend({
    articleId: z.string(),
    publishedAt: z.coerce.date().nullable(),
    status: z.enum(ArticleStatus),
  })
  .omit({ createAt: true })

export const getByIdInputSchema = z.object({
  articleId: z.string().cuid(),
})

export const deleteArticleInputSchema = getByIdInputSchema

export const listVisibleArticlesForUser = z.object({
  status: z.enum(ArticleStatus),
  userId: z.string().cuid(),
})
