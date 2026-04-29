import { z } from 'zod'

import {
  emailSchema,
  firstNameSchema,
  lastNameSchema,
} from '@/schemas/common.schema'
import { PASSWORD_REGEX } from '@/utils/regex.util'

export const MIN_PASSWORD_LENGTH = 8

export const passwordSchema = z
  .string()
  .min(MIN_PASSWORD_LENGTH)
  .regex(PASSWORD_REGEX)

export const signUpWithPasswordInputSchema = z.object({
  email: emailSchema,
  firstName: firstNameSchema,
  lastName: lastNameSchema,
  password: passwordSchema,
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
