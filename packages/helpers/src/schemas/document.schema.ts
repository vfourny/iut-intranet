import type { z } from 'zod'

import { uploadObjectInputSchema } from '@/schemas/storage.schema'

// ── Upload (à la une) ─────────────────────────────────────────────────────────

export const uploadDocumentInputSchema = uploadObjectInputSchema
export type UploadDocumentInput = z.infer<typeof uploadDocumentInputSchema>
