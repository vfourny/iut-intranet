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
  id: z.cuid(),
  lastName: lastNameSchema,
  role: userRoleSchema,
})

export const updateUserInputSchema = userSchema.partial().required({ id: true })

export const getUserByIdInputSchema = z.object({
  userId: z.cuid(),
})

export const getUserByNameInputSchema = z.object({
  name: z.string().optional(),
})

export const listUsersInputSchema = paginationSchema.extend({
  search: searchSchema,
})

export const deleteUserInputSchema = z.object({
  userId: z.cuid(),
})
