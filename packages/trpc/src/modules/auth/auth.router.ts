import { forgotPasswordProcedure } from '@/modules/auth/procedures/forgot-password.procedure'
import { getSessionProcedure } from '@/modules/auth/procedures/get-session.procedure'
import { resetPasswordProcedure } from '@/modules/auth/procedures/reset-password.procedure'
import { signInWithPasswordProcedure } from '@/modules/auth/procedures/sign-in-with-password.procedure'
import { signOutProcedure } from '@/modules/auth/procedures/sign-out.procedure'
import { signUpWithPasswordProcedure } from '@/modules/auth/procedures/sign-up-with-password.procedure'
import { router } from '@/trpc'

export const authRouter = router({
  forgotPassword: forgotPasswordProcedure,
  getSession: getSessionProcedure,
  resetPassword: resetPasswordProcedure,
  signInWithPassword: signInWithPasswordProcedure,
  signOut: signOutProcedure,
  signUpWithPassword: signUpWithPasswordProcedure,
})
