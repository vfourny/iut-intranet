import { type BetterAuthInstance } from '@iut-intranet/auth/types'
import type { prisma } from '@iut-intranet/db'
import type { UserModel } from '@iut-intranet/db/models'
import type { UpdateUserInput } from '@iut-intranet/helpers/types/user'

export class UserService {
  constructor(
    private betterAuth: BetterAuthInstance,
    private prisma: prisma,
  ) {}

  /**
   * Deletes a user
   * @param {string} userId - User unique identifier
   * @param {Headers} [headers] - HTTP headers for the request context
   * @returns {Promise<boolean>} Deletion result from better-auth
   * @remarks Removes all associated data (sessions, organization memberships, profile)
   */
  public async delete(userId: string, headers: Headers): Promise<boolean> {
    const { success } = await this.betterAuth.api.removeUser({
      body: {
        userId,
      },
      headers,
    })

    return success
  }

  /**
   * Retrieves a user by ID
   * @param {string} userId - User unique identifier
   * @returns {Promise<UserModel>} User object
   * @throws {Error} If user does not exist
   */
  public async getById(userId: string): Promise<UserModel> {
    return this.prisma.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
    })
  }

  /**
   * Retrieves all users
   * @returns {Promise<UserModel[]>} Array of all users
   */
  public async list(): Promise<UserModel[]> {
    return this.prisma.user.findMany()
  }

  /**
   * Updates an existing user
   * @param {UpdateUserInput} input - User update data (id required, other fields optional)
   * @param {Headers} [headers] - HTTP headers for the request context
   * @returns {Promise<UserModel>} Updated user object with all fields
   */
  public async update(
    input: UpdateUserInput,
    headers: Headers,
  ): Promise<UserModel> {
    const { id, lastName, ...restingUserPayload } = input
    const updatedUser = await this.betterAuth.api.adminUpdateUser({
      body: {
        data: {
          ...(lastName && { name: lastName }),
          ...restingUserPayload,
        },
        userId: id,
      },
      headers,
    })

    return this.getById(updatedUser.id)
  }
}
