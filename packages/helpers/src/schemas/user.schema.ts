import { UserRole } from '@iut-intranet/db/enums'
import { z } from 'zod'

import {
  emailSchema,
  firstNameSchema,
  lastNameSchema,
  paginationSchema,
  searchSchema,
} from '@/schemas/common.schema'

const userRoleSchema = z.enum(UserRole)

export const userSchema = z.object({
  email: emailSchema,
  firstName: firstNameSchema,
  lastName: lastNameSchema,
  role: userRoleSchema,
  userId: z.cuid(),
})

export const updateUserInputSchema = userSchema
  .partial()
  .required({ userId: true })

export const getUserByIdInputSchema = z.object({
  userId: z.cuid(),
})

export const listUsersInputSchema = paginationSchema.extend({
  search: searchSchema,
})

export const deleteUserInputSchema = z.object({
  userId: z.cuid(),
})
