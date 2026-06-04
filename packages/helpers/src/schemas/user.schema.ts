import { DepartmentCode, Site, UserRole } from '@iut-intranet/db/enums'
import { parsePhoneNumberWithError } from 'libphonenumber-js'
import { z } from 'zod'

import {
  emailSchema,
  firstNameSchema,
  lastNameSchema,
  paginationSchema,
  searchSchema,
} from '@/schemas/common.schema'
import { isValidPhone } from '@/utils/phone.util'

const userRoleSchema = z.enum(UserRole)

export const phoneValueSchema = z
  .string()
  .refine(isValidPhone)
  .transform((phone) => parsePhoneNumberWithError(phone).number)

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

export const updateOwnProfileInputSchema = updateUserInputSchema
  .omit({
    email: true,
    firstName: true,
    lastName: true,
    role: true,
    userId: true,
  })
  .extend({
    image: z.string().optional(),
    jobTitle: z.string().optional(),
    phone: phoneValueSchema.optional(),
  })
  .strict()
export const getUserByIdInputSchema = z.object({
  userId: z.cuid(),
})

export const listUsersInputSchema = paginationSchema.extend({
  department: z
    .enum(
      Object.values(DepartmentCode) as [DepartmentCode, ...DepartmentCode[]],
    )
    .optional(),
  search: searchSchema,
})

export const deleteUserInputSchema = z.object({
  userId: z.cuid(),
})

export const getMeWithDepartmentSchema = z.object({
  banExpires: z.string().nullable(),
  banned: z.boolean().nullable(),
  banReason: z.string().nullable(),
  createdAt: z.string(),
  department: z.object({
    code: z.enum(DepartmentCode),
    id: z.string(),
    site: z.enum(Site),
  }),
  departmentId: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  firstName: z.string(),
  id: z.string(),
  image: z.string().nullable(),
  jobTitle: z.string().nullable(),
  lastName: z.string(),
  managerId: z.string().nullable(),
  phone: phoneValueSchema.nullable(),
  role: z.enum(UserRole),
  updatedAt: z.string(),
})
