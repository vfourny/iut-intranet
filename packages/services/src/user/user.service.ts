import type { prisma } from '@iut-intranet/db'
import type { UserRole } from '@iut-intranet/db/enums'
import type { UserId } from '@iut-intranet/helpers/schemas/brand'
import type { UploadFileInput } from '@iut-intranet/helpers/schemas/storage'
import type {
  ListUsersInputSchema,
  UpdateMeInput,
  UpdateUserInput,
} from '@iut-intranet/helpers/schemas/user'
import { signUrlField, uploadObject } from '@iut-intranet/providers/s3'

import { userInclude, userListSelect } from '@/user/user.query'

export class UserService {
  constructor(private prisma: prisma) {}

  /**
   * Fetches a user by id with their department.
   * @param {UserId} userId - Id of the user to fetch
   * @returns The user with their department and a signed avatar URL
   * @throws Throws if the user doesn't exist
   */
  public async getById(userId: UserId) {
    const user = await this.prisma.user.findUniqueOrThrow({
      include: userInclude,
      where: { id: userId },
    })

    return signUrlField(user, 'image')
  }

  /**
   * Fetches a user's role, validating the user exists.
   * @param {UserId} userId - Id of the user
   * @returns {Promise<UserRole>} The user's role
   * @throws Prisma P2025 (mapped to NOT_FOUND) if the user doesn't exist
   * @remarks Lean lookup for authorization decisions: no department join, no avatar signing, unlike {@link getById}.
   */
  public async getRole(userId: UserId): Promise<UserRole> {
    const { role } = await this.prisma.user.findUniqueOrThrow({
      select: { role: true },
      where: { id: userId },
    })

    return role
  }

  /**
   * Retrieves a paginated list of users, optionally filtered by name.
   * @param {ListUsersInputSchema} payload - Pagination and an optional name search term
   * @returns The directory projection of each matching user (see {@link userListSelect}, with a signed avatar URL) and the total matching count
   * @remarks Returns only the fields the directory renders — never `role`/`ban*`. The full user (with its own sensitive fields) is reserved for {@link getById}, which is self-only.
   */
  public async list(payload: ListUsersInputSchema) {
    const { page, pageSize, search } = payload
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
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
        select: userListSelect,
        skip: (page - 1) * pageSize,
        take: pageSize,
        where,
      }),
      this.prisma.user.count({ where }),
    ])

    return {
      items: await Promise.all(
        items.map((item) => signUrlField(item, 'image')),
      ),
      total,
    }
  }

  /**
   * Updates editable columns of a user.
   * @param {Omit<UpdateUserInput, 'userId'> | UpdateMeInput} payload - The validated subset of fields to persist
   * @param {UserId} userId - Id of the user to update
   * @returns The updated user with their department and a signed avatar URL
   * @remarks The caller (procedure) decides who the target `userId` is and which fields are allowed through its input schema — the service just persists the validated subset it receives. `image` is never set here: avatars go through `uploadAvatar` (S3 key stored, signed on read).
   */
  public async updateUser(
    payload: Omit<UpdateUserInput, 'userId'> | UpdateMeInput,
    userId: UserId,
  ) {
    const updatedUser = await this.prisma.user.update({
      data: payload,
      include: userInclude,
      where: { id: userId },
    })

    return signUrlField(updatedUser, 'image')
  }

  /**
   * Uploads a user avatar to object storage and persists its object key.
   * @param {UploadFileInput} payload - The avatar file to upload
   * @param {UserId} userId - Id of the user whose avatar is set
   * @returns The user with their department and a signed avatar URL
   * @remarks A user owns exactly one avatar under a deterministic key (`users/<userId>/avatar.png`), so every upload overwrites it in place — no orphan keys to track, no social-login URL to special-case.
   */
  public async uploadAvatar(payload: UploadFileInput, userId: UserId) {
    const imageKey = await uploadObject({
      ...payload,
      fileName: 'avatar',
      folder: 'users',
      subFolder: userId,
    })

    const udpatedUser = await this.prisma.user.update({
      data: { image: imageKey },
      include: userInclude,
      where: { id: userId },
    })

    return signUrlField(udpatedUser, 'image')
  }
}
