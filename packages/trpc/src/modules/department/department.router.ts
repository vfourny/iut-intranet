import { getDepartmentsProcedure } from '@/modules/department/procedure/get-department.procedure'
import { router } from '@/trpc'

export const departmentRouter = router({
  list: getDepartmentsProcedure,
})
