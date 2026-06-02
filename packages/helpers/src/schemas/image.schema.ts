import { uploadAvatarInputSchema } from '@iut-intranet/helpers/schemas/storage'
import z from 'zod'

export const uploadImageInputSchema = uploadAvatarInputSchema.extend({
  name: z.string(),
})
