import { prisma } from '@iut-intranet/db'
import { getEnv } from '@iut-intranet/helpers/env'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'

import { emailAndPasswordConfig } from '@/configs/email-and-password.config'
import { schemaConfig } from '@/configs/schema.config'
import { adminPluginConfig } from '@/plugins/admin.plugin'
import { customSessionPluginConfig } from '@/plugins/custom-session.plugin'

export { fromNodeHeaders } from 'better-auth/node'

const { API_URL, APP_URL, BETTER_AUTH_SECRET } = getEnv(
  'API_URL',
  'APP_URL',
  'BETTER_AUTH_SECRET',
)

const COOKIE_PREFIX = 'iut-intranet'

export const AuthCookieName = {
  dontRemember: `${COOKIE_PREFIX}.dont_remember`,
  sessionToken: `${COOKIE_PREFIX}.session_token`,
} as const

export const betterAuthInstance = betterAuth({
  advanced: {
    cookiePrefix: COOKIE_PREFIX,
    cookies: {
      dont_remember: {
        name: AuthCookieName.dontRemember,
      },
      session_token: {
        name: AuthCookieName.sessionToken,
      },
    },
  },
  baseURL: API_URL,
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  ...schemaConfig,
  emailAndPassword: emailAndPasswordConfig,
  plugins: [adminPluginConfig, customSessionPluginConfig],
  secret: BETTER_AUTH_SECRET,
  trustedOrigins: [APP_URL],
})
