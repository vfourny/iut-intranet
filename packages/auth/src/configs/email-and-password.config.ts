import { MIN_PASSWORD_LENGTH } from '@iut-intranet/helpers/schemas/auth'
import argon2 from 'argon2'
import type { BetterAuthOptions } from 'better-auth/types'

export const emailAndPasswordConfig: BetterAuthOptions['emailAndPassword'] = {
  enabled: true,
  minPasswordLength: MIN_PASSWORD_LENGTH,
  password: {
    hash: async (password) => {
      return await argon2.hash(password)
    },
    verify: async ({ hash, password }) => {
      return await argon2.verify(hash, password)
    },
  },
  requireEmailVerification: false,
}
