import { authenticatedProcedure } from '@/procedures'

export const getMeWithDepartmentProcedure = authenticatedProcedure.query(
  async ({ ctx }) => {
    return ctx.services.user.getByIdWithDepartment(ctx.user.id)
  },
)
