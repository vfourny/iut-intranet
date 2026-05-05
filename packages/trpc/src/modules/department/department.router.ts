import { getDepartmentById } from '@/modules/department/procedures/get-department-by-id.procedure'
import { router } from '@/trpc'

export const departmentRouter = router({
  getById: getDepartmentById,
})
