import { DepartmentCode, NewsStatus } from '@iut-intranet/db/enums'
import { z } from 'zod'

import { buildPaginationSchema, searchSchema } from '@/schemas/common.schema'
import { uploadObjectInputSchema } from '@/schemas/storage.schema'

const DEFAULT_NEWS_PAGE_SIZE = 12

// ── Identifiant ───────────────────────────────────────────────────────────────
// Id mono-domaine (référencé uniquement ici) : brandé sur place plutôt que dans
// `brand.schema`, qui ne garde que les ids transverses (cf. sa doc).

export const newsIdSchema = z.cuid().brand<'NewsId'>()
export type NewsId = z.infer<typeof newsIdSchema>

// ── Inputs (écriture) ─────────────────────────────────────────────────────────

// `.strict()` se propage à `updateNewsInputSchema` via `.partial().extend()`.
export const createNewsInputSchema = z
  .object({
    // Contenu riche sérialisé en HTML par l'éditeur PrimeVue (Quill) côté front.
    content: z.string(),
    // La couverture est envoyée d'un bloc avec la news : le fichier est uploadé
    // côté procédure, pas pré-uploadé via une mutation dédiée.
    cover: uploadObjectInputSchema.optional(),
    targetDepartmentCodes: z.array(z.string()).default([]),
    title: z.string(),
  })
  .strict()
export type CreateNewsInput = z.infer<typeof createNewsInputSchema>

export const updateNewsInputSchema = createNewsInputSchema.partial().extend({
  // `undefined` laisse la couverture inchangée, `null` la supprime, un fichier
  // la remplace.
  cover: uploadObjectInputSchema.nullable().optional(),
  newsId: newsIdSchema,
  publishedAt: z.coerce.date().nullable(),
  status: z.enum(NewsStatus),
})
export type UpdateNewsInput = z.infer<typeof updateNewsInputSchema>

// ── Inputs (lecture) ──────────────────────────────────────────────────────────

export const getNewsByIdInputSchema = z
  .object({
    newsId: newsIdSchema,
  })
  .strict()
export type GetNewsByIdInput = z.infer<typeof getNewsByIdInputSchema>

// L'utilisateur cible est dérivé de la session côté procédure ; l'input ne porte
// que les critères de liste (statut, recherche, filtres, pagination).
export const listVisibleNewsInputSchema = buildPaginationSchema(
  DEFAULT_NEWS_PAGE_SIZE,
)
  .extend({
    departmentCodes: z.array(z.enum(DepartmentCode)).default([]),
    search: searchSchema,
    status: z.enum(NewsStatus),
  })
  .strict()
export type ListVisibleNewsInput = z.infer<typeof listVisibleNewsInputSchema>
