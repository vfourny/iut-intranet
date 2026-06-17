import { faker } from '@faker-js/faker'
import { DepartmentCode } from '@iut-intranet/db/enums'
import {
  DEFAULT_PASSWORD,
  getAdminUserFixture,
} from '@tests/fixtures/user.fixture'

import { authService } from '@/index'

describe('AuthService', () => {
  describe('signUpWithPassword', () => {
    it('should create a user matching the input', async () => {
      const input = {
        departmentCodes: [DepartmentCode.INFO],
        email: faker.internet.email().toLowerCase(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName().toUpperCase(),
        password: DEFAULT_PASSWORD,
      }

      const result = await authService.signUpWithPassword(input, new Headers())

      expect(result.body.user).toMatchObject({
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
      })
      expect(result.headersResponse).toBeInstanceOf(Headers)
    })
  })

  describe('signInWithPassword', () => {
    it('should return the user and headers for valid credentials', async () => {
      const { user } = await getAdminUserFixture()

      const result = await authService.signInWithPassword(
        { email: user.email, password: DEFAULT_PASSWORD },
        new Headers(),
      )

      expect(result.body.user.email).toBe(user.email)
      expect(result.headersResponse).toBeInstanceOf(Headers)
    })
  })

  describe('getSession', () => {
    it('should return a session for authenticated headers', async () => {
      const { headers } = await getAdminUserFixture()

      const result = await authService.getSession(headers)

      expect(result).not.toBeNull()
      expect(result?.user).toBeDefined()
    })

    it('should return null for empty headers', async () => {
      expect(await authService.getSession(new Headers())).toBeNull()
    })
  })

  describe('signOut', () => {
    it('should report success for an authenticated session', async () => {
      const { headers } = await getAdminUserFixture()

      const result = await authService.signOut(headers)

      expect(result.success).toBe(true)
    })
  })
})
