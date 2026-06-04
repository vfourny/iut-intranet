import type { prisma } from '@iut-intranet/db'
import type { UserModel } from '@iut-intranet/db/models'
import type { UserId } from '@iut-intranet/helpers/schemas/brand'
import type { UploadFileInput } from '@iut-intranet/helpers/schemas/storage'
import type {
  ListUsersInputSchema,
  UpdateMeInput,
  UpdateUserInput,
} from '@iut-intranet/helpers/schemas/user'
import {
  getSignedObjectUrl,
  updateObject,
  uploadObject,
} from '@iut-intranet/providers/s3'

export class UserService {
  constructor(private prisma: prisma) {}

  /**
   * Fetches a user by id with their department and a signed avatar URL. Throws
   * if the user doesn't exist.
   */
  public async getById(userId: UserId) {
    const user = await this.prisma.user.findUniqueOrThrow({
      include: { department: true },
      where: { id: userId },
    })

    return this.withSignedAvatar(user)
  }

  /**
   * Retrieves a paginated list of users, optionally filtered by name.
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
        include: { department: true },
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        where,
      }),
      this.prisma.user.count({ where }),
    ])

    return {
      items: await Promise.all(
        items.map((item) => this.withSignedAvatar(item)),
      ),
      total,
    }
  }

  /**
   * Updates editable columns of a user. The caller (procedure) decides who the
   * target `userId` is and which fields are allowed through its input schema —
   * the service just persists the validated subset it receives. `image` is
   * never set here: avatars go through `uploadAvatar` (S3 key stored, signed on
   * read).
   */
  public async updateUser(
    payload: Omit<UpdateUserInput, 'userId'> | UpdateMeInput,
    userId: UserId,
  ) {
    const updated = await this.prisma.user.update({
      data: payload,
      where: { id: userId },
    })

    return this.withSignedAvatar(updated)
  }

  /**
   * Uploads a user avatar to object storage, persists its object key, and
   * returns the user with a signed avatar URL. Keys we already own are
   * overwritten in place; an external/social-login URL (or first upload) gets a
   * fresh key so storage doesn't accumulate orphans.
   */
  public async uploadAvatar(
    payload: UploadFileInput,
    userId: UserId,
  ): Promise<UserModel> {
    const { image: previousKey } = await this.prisma.user.findUniqueOrThrow({
      select: { image: true },
      where: { id: userId },
    })

    const imageKey = previousKey
      ? await updateObject({ ...payload, key: previousKey })
      : await uploadObject({ ...payload, folder: 'users', subFolder: userId })

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
  private async withSignedAvatar<T extends { image: UserModel['image'] }>(
    user: T,
  ): Promise<T> {
    return {
      ...user,
      image: user.image ? await getSignedObjectUrl(user.image) : null,
    }
  }
}
