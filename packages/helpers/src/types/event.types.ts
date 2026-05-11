import type { z } from 'zod'

import type { getEventByIdInputSchema } from '@/schemas/event.schema'

export type getEventByIdInput = z.infer<typeof getEventByIdInputSchema>
