import { DepartmentCode } from '@iut-intranet/db/enums'
import { z } from 'zod'

import { emailSchema } from '@/schemas/common.schema'
import { userSchema } from '@/schemas/user.schema'
import { PASSWORD_REGEX } from '@/utils/regex.util'

// ── Mot de passe ──────────────────────────────────────────────────────────────

export const MIN_PASSWORD_LENGTH = 8

const passwordSchema = z.string().min(MIN_PASSWORD_LENGTH).regex(PASSWORD_REGEX)

// ── Sign up ───────────────────────────────────────────────────────────────────

export const signUpWithPasswordInputSchema = userSchema
  .pick({
    email: true,
    firstName: true,
    jobTitle: true,
    lastName: true,
    phone: true,
  })
  .extend({
    departmentCodes: z.array(z.enum(DepartmentCode)).min(1),
    password: passwordSchema,
  })
  .strict()
export type SignUpWithPasswordInput = z.infer<
  typeof signUpWithPasswordInputSchema
>

// ── Sign in ───────────────────────────────────────────────────────────────────

export const signInWithPasswordInputSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    rememberMe: z.boolean().default(false).optional(),
  })
  .strict()
export type SignInWithPasswordInput = z.infer<
  typeof signInWithPasswordInputSchema
>

// ── Forgot password ───────────────────────────────────────────────────────────
export const forgotPasswordInputSchema = z
  .object({ email: emailSchema })
  .strict()
export type ForgotPasswordInput = z.infer<typeof forgotPasswordInputSchema>

// ── Reset password ────────────────────────────────────────────────────────────
export const resetPasswordInputSchema = z
  .object({
    newPassword: passwordSchema,
    token: z.string(),
  })
  .strict()
export type ResetPasswordInput = z.infer<typeof resetPasswordInputSchema>
