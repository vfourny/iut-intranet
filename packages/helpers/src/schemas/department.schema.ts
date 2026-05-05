import { z } from 'zod'

export const getDepartmentByIdInputSchema = z.object({
  departmentId: z.string(),
})
