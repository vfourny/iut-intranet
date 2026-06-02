import type z from 'zod'

import type { uploadAvatarInputSchema } from '@/schemas/storage.schema'

export type uploadAvatarInput = z.infer<typeof uploadAvatarInputSchema>
