import argon2 from 'argon2'

import { prisma } from '@/client'
import type { Prisma } from '@/generated/client'
import { DepartmentCode, UserRole } from '@/generated/enums'

const DEFAULT_PASSWORD = 'Password123!'

export const ADMIN = {
  departmentCodes: [DepartmentCode.INFO],
  email: 'admin@univ-littoral.fr',
  firstName: 'John',
  jobTitle: 'Chef de département',
  lastName: 'ADMIN',
  phone: '+33321990101',
  role: UserRole.ADMIN,
}

export const USER = {
  departmentCodes: [DepartmentCode.GACO],
  email: 'user@univ-littoral.fr',
  firstName: 'John',
  jobTitle: 'Enseignant',
  lastName: 'USER',
  phone: '+33321990102',
  role: UserRole.USER,
}

export const EDITOR = {
  departmentCodes: [DepartmentCode.TC],
  email: 'editor@univ-littoral.fr',
  firstName: 'Jane',
  jobTitle: 'Responsable pédagogique',
  lastName: 'EDITOR',
  phone: '+33321990103',
  role: UserRole.EDITOR,
}

export const seedUsers = async () => {
  const defaultUserInput = {
    banExpires: null,
    banned: false,
    banReason: null,
    emailVerified: false,
  }

  const seededUsers = [ADMIN, USER, EDITOR]

  const createdUsers = await Promise.all(
    seededUsers.map(({ departmentCodes, ...user }) =>
      prisma.user.upsert({
        create: {
          ...user,
          ...defaultUserInput,
          departments: {
            create: departmentCodes.map((code) => ({
              department: { connect: { code } },
            })),
          },
        },
        update: {},
        where: { email: user.email },
      }),
    ),
  )

  // Clé S3 déterministe alignée sur le runtime (`uploadAvatar`) :
  // `users/<userId>/avatar.png`. Posée après coup car l'id (cuid) est généré par
  // Prisma à l'insert. `db:seed` n'écrit que la clé ; les octets sont poussés
  // séparément par `provider:seed`. Un re-seed cible le même objet (id stable).
  await Promise.all(
    createdUsers.map((user) =>
      prisma.user.update({
        data: { image: `users/${user.id}/avatar.png` },
        where: { id: user.id },
      }),
    ),
  )

  const passwordHash = await argon2.hash(DEFAULT_PASSWORD)

  const accountsData: Prisma.AccountCreateManyInput[] = createdUsers.map(
    (user) => ({
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
    }),
  )

  await prisma.account.createMany({
    data: accountsData,
    skipDuplicates: true,
  })
}
