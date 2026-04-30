import { betterAuthInstance } from '@iut-intranet/auth'
import { prisma } from '@iut-intranet/db'

import { AuthService } from '@/auth.service'
import { UserService } from '@/user.service'

const userService = new UserService(betterAuthInstance, prisma)
const authService = new AuthService(betterAuthInstance, userService)

export { authService, userService }
export type { AuthService, UserService }
