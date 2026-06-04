import type { prisma } from '@iut-intranet/db'
import type { DepartmentCode } from '@iut-intranet/db/enums'
import type { DepartmentModel } from '@iut-intranet/db/models'
import type { DepartmentId } from '@iut-intranet/helpers/schemas/department'

export class DepartmentService {
  constructor(private prisma: prisma) {}

  /**
   * Fetches a department by its business code (e.g. INFO, GACO). Throws if none
   * matches.
   */
  public async getByCode(code: DepartmentCode): Promise<DepartmentModel> {
    return this.prisma.department.findUniqueOrThrow({
      where: { code },
    })
  }

  /**
   * Fetches a department by id. Throws if none matches.
   */
  public async getById(departmentId: DepartmentId): Promise<DepartmentModel> {
    return this.prisma.department.findUniqueOrThrow({
      where: { id: departmentId },
    })
  }
}
