import { type BetterAuthInstance } from '@iut-intranet/auth/types'
import type { prisma } from '@iut-intranet/db'
import type { UserModel } from '@iut-intranet/db/models'
import type { uploadAvatarInput } from '@iut-intranet/helpers/types/storage'
import type {
  updateOwnProfileInput,
  UpdateUserInput,
} from '@iut-intranet/helpers/types/user'
import { getSignedObjectUrl, uploadObject } from '@iut-intranet/providers/s3'

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
    const user = await this.prisma.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
    })

    return this.withSignedAvatar(user)
  }

  async getByIdWithDepartment(id: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      include: { department: true },
      where: { id },
    })

    return this.withSignedAvatar(user)
  }

  /**
   * Retrieves a paginated list of users, optionally filtered by name.
   */
  public async list(input: {
    page: number
    pageSize: number
    search?: string
  }) {
    const { page, pageSize, search } = input
    const where = search
      ? {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' as const } },
            { lastName: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        include: { department: true },
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        where,
      }),
      this.prisma.user.count({ where }),
    ])

    return {
      items: await Promise.all(items.map((item) => this.withSignedAvatar(item))),
      total,
    }
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
    const { lastName, userId, ...restingUserPayload } = input
    const updatedUser = await this.betterAuth.api.adminUpdateUser({
      body: {
        data: {
          ...(lastName && { name: lastName }),
          ...restingUserPayload,
        },
        userId,
      },
      headers,
    })

    return this.getById(updatedUser.id)
  }

  public async updateOwnUser(user: updateOwnProfileInput, userId: string) {
    // `image` n'est volontairement pas modifiable ici (cf. uploadAvatar).
    const updated = await this.prisma.user.update({
      data: {
        jobTitle: user.jobTitle,
        phone: user.phone,
      },
      where: { id: userId },
    })

    return this.withSignedAvatar(updated)
  }

  /**
   * Uploads a user avatar to object storage and persists its object key
   * @param {UploadUserAvatarInput} payload - Base64 image and its content type
   * @param {string} userId - Owner of the avatar
   * @returns {Promise<UserModel>} The updated user, with a signed avatar URL
   */
  public async uploadAvatar(
    payload: uploadAvatarInput,
    userId: string,
  ): Promise<UserModel> {
    const imageKey = await uploadObject({
      ...payload,
      folder: 'avatars',
      subPath: userId,
    })

    const user = await this.prisma.user.update({
      data: { image: imageKey },
      where: { id: userId },
    })

    return this.withSignedAvatar(user)
  }

  /**
   * Replaces a stored avatar key with a temporary signed URL the browser can
   * load. The bucket is private, so URLs are generated on read, never persisted.
   */
  private async withSignedAvatar<T extends { image: string | null }>(
    user: T,
  ): Promise<T> {
    return {
      ...user,
      image: user.image ? await getSignedObjectUrl(user.image) : null,
    }
  }
}
