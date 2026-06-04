import { getSessionProcedure } from '@/modules/auth/procedures/get-session.procedure'
import { signInWithPasswordProcedure } from '@/modules/auth/procedures/sign-in-with-password.procedure'
import { signOutProcedure } from '@/modules/auth/procedures/sign-out.procedure'
import { signUpWithPasswordProcedure } from '@/modules/auth/procedures/sign-up-with-password.procedure'
import { router } from '@/trpc'

export const authRouter = router({
  getSession: getSessionProcedure,
  signInWithPassword: signInWithPasswordProcedure,
  signOut: signOutProcedure,
  signUpWithPassword: signUpWithPasswordProcedure,
})
