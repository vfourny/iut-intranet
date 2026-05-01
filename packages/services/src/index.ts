import { betterAuthInstance } from '@iut-intranet/auth'
import { prisma } from '@iut-intranet/db'

import { AuthService } from '@/auth.service'
import { DepartmentService } from '@/department.service'
import { UserService } from '@/user.service'

const userService = new UserService(betterAuthInstance, prisma)
const departmentService = new DepartmentService(prisma)
const authService = new AuthService(
  betterAuthInstance,
  userService,
  departmentService,
)

export { authService, departmentService, userService }
export type { AuthService, DepartmentService, UserService }
