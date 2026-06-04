import type { AuthSession, BetterAuthInstance } from '@iut-intranet/auth/types'
import type {
  SignInWithPasswordInput,
  SignUpWithPasswordInput,
} from '@iut-intranet/helpers/schemas/auth'
import { userIdSchema } from '@iut-intranet/helpers/schemas/brand'

import type { DepartmentService } from '@/department.service'
import type { UserService } from '@/user.service'

interface AuthResponse {
  body: NonNullable<AuthSession>
  headersResponse: Headers
}

export class AuthService {
  constructor(
    private betterAuth: BetterAuthInstance,
    private userService: UserService,
    private departmentService: DepartmentService,
  ) {}

  /**
   * Returns the current session resolved from the request headers, or null when
   * the caller isn't authenticated.
   */
  public async getSession(headers: Headers): Promise<AuthSession | null> {
    return this.betterAuth.api.getSession({
      headers,
    })
  }

  /**
   * Authenticates a user with email/password. Returns the response headers
   * (carrying the session cookie) and the authenticated user.
   */
  public async signInWithPassword(
    payload: SignInWithPasswordInput,
    headers: Headers,
  ): Promise<AuthResponse> {
    const { headers: headersResponse, response: signInResponse } =
      await this.betterAuth.api.signInEmail({
        body: payload,
        headers,
        returnHeaders: true,
      })

    const user = await this.userService.getById(
      userIdSchema.parse(signInResponse.user.id),
    )

    return {
      body: {
        user,
      },
      headersResponse,
    }
  }

  /**
   * Signs the current user out. Returns the response headers (clearing the
   * session cookie) and whether the operation succeeded.
   */
  public async signOut(
    headers: Headers,
  ): Promise<{ headersResponse: Headers; success: boolean }> {
    const { headers: headersResponse, response } =
      await this.betterAuth.api.signOut({
        headers,
        returnHeaders: true,
      })

    return { headersResponse, success: response.success }
  }

  /**
   * Registers a user with email/password under the given department and
   * immediately signs them in. The department code is resolved to its id and
   * `lastName` maps to better-auth's `name`. Returns the response headers
   * (carrying the session cookie) and the created user.
   */
  public async signUpWithPassword(
    payload: SignUpWithPasswordInput,
    headers: Headers,
  ): Promise<AuthResponse> {
    const { departmentCode, lastName, ...rest } = payload

    const { id: departmentId } =
      await this.departmentService.getByCode(departmentCode)

    const { headers: headersResponse, response: signUpResponse } =
      await this.betterAuth.api.signUpEmail({
        body: { ...rest, departmentId, name: lastName },
        headers,
        returnHeaders: true,
      })

    const user = await this.userService.getById(
      userIdSchema.parse(signUpResponse.user.id),
    )

    return {
      body: {
        user,
      },
      headersResponse,
    }
  }
}
