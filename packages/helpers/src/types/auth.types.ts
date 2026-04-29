import type { z } from 'zod'

import type {
  forgotPasswordInputSchema,
  resetPasswordInputSchema,
  signInWithPasswordInputSchema,
  signUpWithPasswordInputSchema,
} from '@/schemas/auth.schema'

export type SignInWithPasswordInput = z.infer<
  typeof signInWithPasswordInputSchema
>

export type SignUpWithPasswordInput = z.infer<
  typeof signUpWithPasswordInputSchema
>

export type ForgotPasswordInput = z.infer<typeof forgotPasswordInputSchema>

export type ResetPasswordInput = z.infer<typeof resetPasswordInputSchema>
