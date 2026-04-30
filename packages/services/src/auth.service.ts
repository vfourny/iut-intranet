import type { AuthSession, BetterAuthInstance } from '@iut-intranet/auth/types'
import type { UserModel } from '@iut-intranet/db/models'
import type {
  ForgotPasswordInput,
  ResetPasswordInput,
  SignInWithPasswordInput,
  SignUpWithPasswordInput,
} from '@iut-intranet/helpers/types/auth'

import type { UserService } from '@/user.service'

interface AuthResponse {
  body: { user: UserModel }
  headersResponse: Headers
}

export class AuthService {
  constructor(
    private betterAuth: BetterAuthInstance,
    private userService: UserService,
  ) {}

  /**
   * Initiates password reset flow by sending a reset email
   * @param {ForgotPasswordInput} input - Email address for password reset
   * @returns {Promise<boolean>} Status of password reset request
   * @remarks Does not throw if email is not found (security best practice)
   */
  public async forgotPassword(input: ForgotPasswordInput): Promise<boolean> {
    const { status } = await this.betterAuth.api.requestPasswordReset({
      body: {
        email: input.email,
      },
    })
    return status
  }

  /**
   * Retrieves the current session
   * @param {Headers} [headers] - HTTP headers for the request context
   * @returns {Promise<AuthSession | null>} Session object or null if not authenticated
   */
  public async getSession(headers: Headers): Promise<AuthSession | null> {
    return this.betterAuth.api.getSession({
      headers,
    })
  }

  /**
   * Resets password using a reset token
   * @param {ResetPasswordInput} input - New password and reset token
   * @returns {Promise<boolean>} True when password is successfully reset
   * @remarks Invalidates all previous sessions
   */
  public async resetPassword(input: ResetPasswordInput): Promise<boolean> {
    const { status } = await this.betterAuth.api.resetPassword({
      body: {
        newPassword: input.password,
        token: input.token,
      },
    })

    return status
  }

  /**
   * Authenticates a user with email and password
   * @param {SignInWithPasswordInput} input - User credentials (email, password)
   * @param {Headers} [headers] - HTTP headers for the request context
   * @returns {Promise<AuthResponse>} Headers and authenticated user object
   * @remarks Automatically restores their last used organization as active
   */
  public async signInWithPassword(
    input: SignInWithPasswordInput,
    headers: Headers,
  ): Promise<AuthResponse> {
    const { headers: headersResponse, response: signInResponse } =
      await this.betterAuth.api.signInEmail({
        body: input,
        headers,
        returnHeaders: true,
      })

    const user = await this.userService.getById(signInResponse.user.id)

    return {
      body: {
        user,
      },
      headersResponse,
    }
  }

  /**
   * Signs out the current user
   * @param {Headers} [headers] - HTTP headers for the request context
   * @returns {Promise<{ headersResponse: Headers; success: boolean }>} Headers and sign out status
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
   * Registers a new user with email and password
   * @param {SignUpWithPasswordInput} input - User registration data (email, password, firstName, lastName)
   * @param {Headers} [headers] - HTTP headers for the request context
   * @returns {Promise<AuthResponse>} Headers and created user object
   * @remarks Automatically authenticates and activates their last used organization
   */
  public async signUpWithPassword(
    input: SignUpWithPasswordInput,
    headers: Headers,
  ): Promise<AuthResponse> {
    const { email, firstName, lastName, password } = input

    const { headers: headersResponse, response: signUpResponse } =
      await this.betterAuth.api.signUpEmail({
        body: {
          email,
          firstName,
          name: lastName,
          password,
        },
        headers,
        returnHeaders: true,
      })

    const user = await this.userService.getById(signUpResponse.user.id)

    return {
      body: {
        user,
      },
      headersResponse,
    }
  }
}
