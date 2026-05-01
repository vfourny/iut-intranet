import type { prisma } from '@iut-intranet/db'
import type { DepartmentCode } from '@iut-intranet/db/enums'
import type { DepartmentModel } from '@iut-intranet/db/models'

export class DepartmentService {
  constructor(private prisma: prisma) {}

  /**
   * Retrieves a department by its business code
   * @param {DepartmentCode} code - Department business code (e.g. INFO, GACO)
   * @returns {Promise<DepartmentModel>} Department object
   * @throws {Error} If department does not exist
   */
  public async getByCode(code: DepartmentCode): Promise<DepartmentModel> {
    return this.prisma.department.findUniqueOrThrow({
      where: { code },
    })
  }

  /**
   * Retrieves a department by ID
   * @param {string} departmentId - Department unique identifier
   * @returns {Promise<DepartmentModel>} Department object
   * @throws {Error} If department does not exist
   */
  public async getById(departmentId: string): Promise<DepartmentModel> {
    return this.prisma.department.findUniqueOrThrow({
      where: { id: departmentId },
    })
  }

  /**
   * Retrieves all departments
   * @returns {Promise<DepartmentModel[]>} Array of all departments
   */
  public async list(): Promise<DepartmentModel[]> {
    return this.prisma.department.findMany()
  }
}
