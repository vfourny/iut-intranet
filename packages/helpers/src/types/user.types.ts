import type { z } from 'zod'

import type {
  deleteUserInputSchema,
  getUserByIdInputSchema,
  updateUserInputSchema,
  userSchema,
} from '@/schemas/user.schema'

export type User = z.infer<typeof userSchema>

export type GetUserByIdInput = z.infer<typeof getUserByIdInputSchema>

export type UpdateUserInput = z.infer<typeof updateUserInputSchema>

export type DeleteUserInput = z.infer<typeof deleteUserInputSchema>
