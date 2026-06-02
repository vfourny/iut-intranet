import z from 'zod'

/**
 * Taille max d'un upload image (avatar, couverture d'article, carrousel).
 * Source unique partagée par le back (garde-fou S3) et le front (FileUpload),
 * pour qu'ils ne puissent pas diverger.
 */
export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024

export const avatarContentTypeSchema = z.enum([
  'image/jpeg',
  'image/png',
  'image/webp',
])

export const uploadAvatarInputSchema = z.object({
  base64: z.string().min(1),
  contentType: avatarContentTypeSchema,
})
