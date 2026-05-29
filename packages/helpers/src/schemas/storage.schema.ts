import z from 'zod'

export const avatarContentTypeSchema = z.enum([
  'image/jpeg',
  'image/png',
  'image/webp',
])

export const uploadAvatarInputSchema = z.object({
  base64: z.string().min(1),
  contentType: avatarContentTypeSchema,
})
