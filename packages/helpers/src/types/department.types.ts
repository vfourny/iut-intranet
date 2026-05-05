import type { z } from 'zod'

import type { getDepartmentByIdInputSchema } from '@/schemas/department.schema'

export type getDepartmentByIdInput = z.infer<
  typeof getDepartmentByIdInputSchema
>
