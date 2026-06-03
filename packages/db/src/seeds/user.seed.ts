import argon2 from 'argon2'

import { prisma } from '@/client'
import type { Prisma } from '@/generated/client'
import { DepartmentCode, UserRole } from '@/generated/enums'

const DEFAULT_PASSWORD = 'Password123!'

export const ADMIN = {
  departmentCode: DepartmentCode.INFO,
  email: 'admin@iut-intranet.com',
  firstName: 'John',
  jobTitle: 'Chef de département',
  lastName: 'ADMIN',
  role: UserRole.ADMIN,
}

export const USER = {
  departmentCode: DepartmentCode.GACO,
  email: 'user@iut-intranet.com',
  firstName: 'John',
  jobTitle: 'Enseignant',
  lastName: 'USER',
  role: UserRole.USER,
}

export const EDITOR = {
  departmentCode: DepartmentCode.TC,
  email: 'editor@iut-intranet.com',
  firstName: 'Jane',
  jobTitle: 'Responsable pédagogique',
  lastName: 'EDITOR',
  role: UserRole.EDITOR,
}

export const seedUsers = async () => {
  const departments = await prisma.department.findMany()
  const departmentIdByCode = new Map(departments.map((d) => [d.code, d.id]))

  const defaultUserInput = {
    banExpires: null,
    banned: false,
    banReason: null,
    emailVerified: false,
  }

  const seededUsers = [ADMIN, USER, EDITOR]

  const users: Prisma.UserCreateManyInput[] = seededUsers.map(
    ({ departmentCode, ...user }) => {
      const departmentId = departmentIdByCode.get(departmentCode)
      if (!departmentId) {
        throw new Error(
          `Department ${departmentCode} not found — run seedDepartments first`,
        )
      }
      // Clé S3 déterministe dérivée de l'email (préfixe `avatars/seed`, pas de
      // randomUUID pour qu'un re-seed cible le même objet). `db:seed` n'écrit
      // que la clé ; les octets sont poussés séparément par `provider:seed`.
      const slug = user.email.split('@')[0]
      return {
        ...user,
        ...defaultUserInput,
        departmentId,
        image: `avatars/seed/${slug}.png`,
      }
    },
  )

  const createdUsers = await prisma.user.createManyAndReturn({
    data: users,
    skipDuplicates: true,
  })

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
