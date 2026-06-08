import { z } from 'zod'

export const ContentType = {
  IMAGE_JPEG: 'image/jpeg',
  IMAGE_PNG: 'image/png',
  IMAGE_WEBP: 'image/webp',
} as const
export type ContentType = (typeof ContentType)[keyof typeof ContentType]

// ── Input d'upload ────────────────────────────────────────────────────────────

export const uploadObjectInputSchema = z
  .object({
    base64: z.string().min(1),
    contentType: z.enum(ContentType),
  })
  .strict()
export type UploadFileInput = z.infer<typeof uploadObjectInputSchema>
