import type { z } from 'zod'

import { uploadObjectInputSchema } from '@/schemas/storage.schema'

// ── Upload (à la une) ─────────────────────────────────────────────────────────

export const uploadHighlightInputSchema = uploadObjectInputSchema
export type UploadHighlightInput = z.infer<typeof uploadHighlightInputSchema>
