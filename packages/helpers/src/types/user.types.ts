import type { DepartmentModel, UserModel } from '@iut-intranet/db/models'
import type { z } from 'zod'

import type {
  deleteUserInputSchema,
  getUserByIdInputSchema,
  getUserByNameInputSchema,
  updateUserInputSchema,
  userSchema,
} from '@/schemas/user.schema'

export type User = z.infer<typeof userSchema>

export type GetUserByIdInput = z.infer<typeof getUserByIdInputSchema>

export type GetUserByNameInput = z.infer<typeof getUserByNameInputSchema>

export type UpdateUserInput = z.infer<typeof updateUserInputSchema>

export type DeleteUserInput = z.infer<typeof deleteUserInputSchema>

export type UserWithDepartment = UserModel & {
  department: DepartmentModel | null
}
