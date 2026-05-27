import { authenticatedProcedure } from '@/procedures'

export const getDepartmentsProcedure = authenticatedProcedure.query(
  ({ ctx }) => {
    return ctx.services.department.list()
  },
)
