import { faker } from '@faker-js/faker'
import { DepartmentCode } from '@iut-intranet/db/enums'
import { DEFAULT_PASSWORD } from '@tests/fixtures/user.fixture'

import { authService } from '@/index'

describe('AuthService', () => {
  let currentUserEmail: string
  let currentHeaders: Headers

  beforeAll(async () => {
    try {
      await authService.signUpWithPassword(
        {
          departmentCodes: [DepartmentCode.INFO],
          email: 'john.admin@univ-littoral.fr',
          firstName: 'John',
          lastName: 'Admin',
          password: DEFAULT_PASSWORD,
        },
        new Headers(),
      )
    } catch (_error) {
      expect(true).toBe(true)
    }
  })

  beforeEach(async () => {
    currentUserEmail = faker.internet.email().toLowerCase()
    const input = {
      departmentCodes: [DepartmentCode.INFO],
      email: currentUserEmail,
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName().toUpperCase(),
      password: DEFAULT_PASSWORD,
    }

    const result = await authService.signUpWithPassword(input, new Headers())
    currentHeaders = result.headersResponse
  })

  describe('signUpWithPassword', () => {
    it('should create a user matching the input', async () => {
      const uniqueEmail = faker.internet.email().toLowerCase()
      const input = {
        departmentCodes: [DepartmentCode.INFO],
        email: uniqueEmail,
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
      const result = await authService.signInWithPassword(
        { email: currentUserEmail, password: DEFAULT_PASSWORD },
        new Headers(),
      )

      expect(result.body.user.email).toBe(currentUserEmail)
      expect(result.headersResponse).toBeInstanceOf(Headers)
    })
  })

  describe('getSession', () => {
    it('should return a session for authenticated headers', async () => {
      const loginResult = await authService.signInWithPassword(
        { email: currentUserEmail, password: DEFAULT_PASSWORD },
        new Headers(),
      )

      const setCookieHeader = loginResult.headersResponse.get('set-cookie')

      expect(setCookieHeader).not.toBeNull()

      const requestHeaders = new Headers()
      if (setCookieHeader) {
        requestHeaders.set('cookie', setCookieHeader)
      }

      const result = await authService.getSession(requestHeaders)

      expect(result).not.toBeNull()
      expect(result?.user).toBeDefined()
      expect(result?.user.email).toBe(currentUserEmail)
    })

    it('should return null for empty headers', async () => {
      expect(await authService.getSession(new Headers())).toBeNull()
    })
  })

  describe('signOut', () => {
    it('should report success for an authenticated session', async () => {
      const result = await authService.signOut(currentHeaders)

      expect(result.success).toBe(true)
    })
  })
})
