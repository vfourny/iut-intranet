import { UserRole } from '@iut-intranet/db/enums'
import type { BetterAuthOptions } from 'better-auth'

export const schemaConfig = {
  account: {
    fields: {
      accountId: 'externalAccountId',
    },
  },
  user: {
    additionalFields: {
      firstName: {
        input: true,
        required: true,
        type: 'string',
      },
      role: {
        defaultValue: UserRole.USER,
        input: false,
        required: true,
        type: 'string',
      },
    },
    fields: {
      name: 'lastName',
    },
  },
} satisfies Pick<BetterAuthOptions, 'user' | 'account'>
