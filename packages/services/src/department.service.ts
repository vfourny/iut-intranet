import type { prisma } from '@iut-intranet/db'
import type { DepartmentCode } from '@iut-intranet/db/enums'
import type { DepartmentModel } from '@iut-intranet/db/models'
import type { ConnectDepartmentsInput } from '@iut-intranet/helpers/schemas/department'

export class DepartmentService {
  constructor(private prisma: prisma) {}

  /**
   * Connects a user to one or more departments, replacing any existing assignments.
   * @param {ConnectDepartmentsInput} payload - The user id and department codes to connect
   * @returns {Promise<UserModel>} The updated user
   * @throws Throws if the user doesn't exist
   */
  public async connectToUser(payload: ConnectDepartmentsInput) {
    await this.prisma.userDepartment.deleteMany({
      where: { userId: payload.userId },
    })

    return this.prisma.user.update({
      data: {
        departments: {
          create: payload.departmentCodes.map((code) => ({
            department: { connect: { code } },
          })),
        },
      },
      where: { id: payload.userId },
    })
  }

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
