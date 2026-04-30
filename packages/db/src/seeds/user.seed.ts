import argon2 from 'argon2'

import { prisma } from '@/client'
import { UserRole } from '@/generated/enums'

const DEFAULT_PASSWORD = 'Password123!'

export const ADMIN = {
  email: 'admin@iut-intranet.com',
  firstName: 'John',
  lastName: 'ADMIN',
  role: UserRole.ADMIN,
}

export const USER = {
  email: 'user@iut-intranet.com',
  firstName: 'John',
  lastName: 'USER',
  role: UserRole.USER,
}

export const seedUsers = async () => {
  const defaultUserInput = {
    banExpires: null,
    banned: false,
    banReason: null,
    emailVerified: false,
    image: null,
  }

  const users = [
    {
      ...ADMIN,
      ...defaultUserInput,
    },
    {
      ...USER,
      ...defaultUserInput,
    },
  ]
  const createdUsers = await prisma.user.createManyAndReturn({
    data: users,
    skipDuplicates: true,
  })

  const passwordHash = await argon2.hash(DEFAULT_PASSWORD)

  const accountsData = createdUsers.map((user) => ({
    accessToken: null,
    accessTokenExpiresAt: null,
    externalAccountId: user.id,
    idToken: null,
    password: passwordHash,
    providerId: 'credential',
    refreshToken: null,
    refreshTokenExpiresAt: null,
    scope: null,
    userId: user.id,
  }))

  await prisma.account.createMany({
    data: accountsData,
    skipDuplicates: true,
  })
}
