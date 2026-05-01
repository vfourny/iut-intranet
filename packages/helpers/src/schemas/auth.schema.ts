import { DepartmentCode } from '@iut-intranet/db/enums'
import { z } from 'zod'

import {
  emailSchema,
  firstNameSchema,
  jobTitleSchema,
  lastNameSchema,
  phoneSchema,
} from '@/schemas/common.schema'
import { PASSWORD_REGEX } from '@/utils/regex.util'

export const MIN_PASSWORD_LENGTH = 8

export const passwordSchema = z
  .string()
  .min(MIN_PASSWORD_LENGTH)
  .regex(PASSWORD_REGEX)

export const signUpWithPasswordInputSchema = z.object({
  departmentCode: z.enum(DepartmentCode),
  email: emailSchema,
  firstName: firstNameSchema,
  jobTitle: jobTitleSchema.optional(),
  lastName: lastNameSchema,
  password: passwordSchema,
  phone: phoneSchema.optional(),
})

export const signInWithPasswordInputSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  rememberMe: z.boolean().default(false).optional(),
})

export const forgotPasswordInputSchema = z.object({
  email: emailSchema,
})

export const resetPasswordInputSchema = z.object({
  password: passwordSchema,
  token: z.string(),
})
