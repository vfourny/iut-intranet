import { getDepartmentByIdInputSchema } from '@iut-intranet/helpers/schemas/department'

import { authenticatedProcedure } from '@/procedures'

export const getDepartmentById = authenticatedProcedure
  .input(getDepartmentByIdInputSchema)
  .query(async ({ ctx, input }) => {
    return ctx.services.department.getById(input.departmentId)
  })
