import type { Prisma, prisma } from '@iut-intranet/db'
import type { UserModel } from '@iut-intranet/db/models'
import type { UserId } from '@iut-intranet/helpers/schemas/brand'
import type { Paginated } from '@iut-intranet/helpers/schemas/common'
import type { UploadFileInput } from '@iut-intranet/helpers/schemas/storage'
import type {
  ListUsersInputSchema,
  UpdateMeInput,
  UpdateUserInput,
} from '@iut-intranet/helpers/schemas/user'
import { signUrlField, uploadObject } from '@iut-intranet/providers/s3'

const userInclude = { department: true } satisfies Prisma.UserInclude

export class UserService {
  constructor(private prisma: prisma) {}

  /**
   * Fetches a user by id with their department.
   * @param {UserId} userId - Id of the user to fetch
   * @returns {Promise<UserModel>} The user with their department and a signed avatar URL
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
   * Retrieves a paginated list of users, optionally filtered by name.
   * @param {ListUsersInputSchema} payload - Pagination and an optional name search term
   * @returns {Promise<Paginated<UserModel>>} The users (each with a signed avatar URL) and the total matching count
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
        include: userInclude,
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
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
    } satisfies Paginated<UserModel>
  }

  /**
   * Updates editable columns of a user.
   * @param {Omit<UpdateUserInput, 'userId'> | UpdateMeInput} payload - The validated subset of fields to persist
   * @param {UserId} userId - Id of the user to update
   * @returns {Promise<UserModel>} The updated user with a signed avatar URL
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
   * @returns {Promise<UserModel>} The user with a signed avatar URL
   * @remarks A user owns exactly one avatar under a deterministic key (`users/<userId>/avatar.png`), so every upload overwrites it in place — no orphan keys to track, no social-login URL to special-case.
   */
  public async uploadAvatar(
    payload: UploadFileInput,
    userId: UserId,
  ): Promise<UserModel> {
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
