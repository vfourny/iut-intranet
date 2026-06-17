import { z } from 'zod'

import { uploadObjectInputSchema } from '@/schemas/storage.schema'

// ── Upload ─────────────────────────────────────────────────────────

export const uploadDocumentInputSchema = uploadObjectInputSchema.extend({
  originalName: z.string().min(1),
})
export type UploadDocumentInput = z.infer<typeof uploadDocumentInputSchema>

// ── Delete ─────────────────────────────────────────────────────────

export const deleteDocumentInputSchema = z.object({
  key: z.string().min(1),
})
export type DeleteDocumentInput = z.infer<typeof deleteDocumentInputSchema>
