import { sendEmail } from '@iut-intranet/emails/email-sender'
import { EmailTemplate } from '@iut-intranet/emails/types'
import { MIN_PASSWORD_LENGTH } from '@iut-intranet/helpers/schemas/auth'
import argon2 from 'argon2'
import type { BetterAuthOptions } from 'better-auth/types'

const RESET_PASSWORD_TOKEN_EXPIRES_IN = 15 * 60 // 15 minutes in seconds

export const emailAndPasswordConfig = {
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
  resetPasswordTokenExpiresIn: RESET_PASSWORD_TOKEN_EXPIRES_IN,
  sendResetPassword: async ({ url, user }) => {
    await sendEmail(
      EmailTemplate.ResetPassword,
      {
        expiresIn: RESET_PASSWORD_TOKEN_EXPIRES_IN,
        resetPasswordUrl: url,
        user: { firstName: user.name || user.email, lastName: '' },
      },
      {
        subject: 'Réinitialisation de votre mot de passe',
        to: [user.email],
      },
    )
  },
} satisfies BetterAuthOptions['emailAndPassword']
