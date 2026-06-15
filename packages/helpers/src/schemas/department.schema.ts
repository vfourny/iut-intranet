import { DepartmentCode } from '@iut-intranet/db'
import z from 'zod'

export const connectDepartmentsInputSchema = z.object({
  departmentCodes: z.array(z.nativeEnum(DepartmentCode)),
  userId: z.string(),
})

export type ConnectDepartmentsInput = z.infer<
  typeof connectDepartmentsInputSchema
>
