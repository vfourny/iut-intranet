import type { uploadImageInputSchema } from '@iut-intranet/helpers/schemas/image'
import type z from 'zod'

export type uploadImageInput = z.infer<typeof uploadImageInputSchema>
