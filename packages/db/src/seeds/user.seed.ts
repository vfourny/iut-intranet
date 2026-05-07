import argon2 from 'argon2'

import { prisma } from '@/client'
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

export const USER2 = {
  departmentCode: DepartmentCode.GEII,
  email: 'user2@iut-intranet.com',
  firstName: 'Jane',
  lastName: 'USER2',
  role: UserRole.USER,
}

export const USER3 = {
  departmentCode: DepartmentCode.GIM,
  email: 'user3@iut-intranet.com',
  firstName: 'Bob',
  lastName: 'USER3',
  role: UserRole.USER,
}

export const USER4 = {
  departmentCode: DepartmentCode.GTE,
  email: 'user4@iut-intranet.com',
  firstName: 'Alice',
  lastName: 'USER4',
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
    image: null,
  }

  const users = [ADMIN, USER, EDITOR, USER2, USER3, USER4].map(
    ({ departmentCode, ...user }) => {
      const departmentId = departmentIdByCode.get(departmentCode)
      if (!departmentId) {
        throw new Error(
          `Department ${departmentCode} not found — run seedDepartments first`,
        )
      }
      return {
        ...user,
        ...defaultUserInput,
        departmentId,
      }
    },
  )

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
