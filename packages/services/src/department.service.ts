import type { prisma } from '@iut-intranet/db'
import type { DepartmentCode } from '@iut-intranet/db/enums'
import type { DepartmentModel } from '@iut-intranet/db/models'

export class DepartmentService {
  constructor(private prisma: prisma) {}

  /**
   * Fetches a department by its business code (e.g. INFO, GACO).
   * @param {DepartmentCode} code - The department business code
   * @returns {Promise<DepartmentModel>} The matching department
   * @throws Throws if none matches
   */
  public async getByCode(code: DepartmentCode): Promise<DepartmentModel> {
    return this.prisma.department.findUniqueOrThrow({
      where: { code },
    })
  }
}
