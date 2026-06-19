import { randomBytes } from 'node:crypto'

import type { BetterAuthInstance } from '@iut-intranet/auth/types'
import type { Prisma, prisma } from '@iut-intranet/db'
import { UserRole } from '@iut-intranet/db/enums'
import { AppError } from '@iut-intranet/helpers/errors'
import type { UserId } from '@iut-intranet/helpers/schemas/brand'
import type { UploadFileInput } from '@iut-intranet/helpers/schemas/storage'
import type {
  CreateUserInput,
  deleteUserInput,
  ListUsersInputSchema,
  UpdateMeInput,
  UpdatePasswordInput,
  updateUserFromAdminInput,
  UpdateUserInput,
} from '@iut-intranet/helpers/schemas/user'
import { isAdminRole } from '@iut-intranet/helpers/utils/role'
import { signUrlField, uploadObject } from '@iut-intranet/providers/s3'

import { userInclude, userListSelect } from '@/user/user.query'

export class UserService {
  constructor(
    private prisma: prisma,
    private betterAuth: BetterAuthInstance,
  ) {}

  /**
   * Creates a user account on behalf of an admin, with a generated password.
   * @param {CreateUserInput} payload - Identity, contact and target department code of the account to create
   * @returns The created user as returned by the auth provider
   * @throws Prisma P2025 (mapped to NOT_FOUND) if the target department code doesn't exist
   * @remarks Admin-only operation — authorization is enforced upstream by the `adminProcedure`, so the service trusts its caller and never re-checks the actor's role. The password is generated server-side (the account is provisioned, not self-registered); delivering it to the new user is out of this method's scope. Account creation goes through better-auth (hashing, account row, schema field mapping) rather than a raw Prisma insert, and the department code is resolved to its id since the auth schema stores `departmentId`.
   */
  public async create(payload: CreateUserInput) {
    const { departmentCodes, email, firstName, jobTitle, lastName, phone } =
      payload
    const password = randomBytes(12).toString('base64url')

    const result = await this.betterAuth.api.createUser({
      body: {
        data: {
          firstName,
          jobTitle,
          phone,
          role: UserRole.USER,
        },
        email,
        name: lastName,
        password,
      },
    })

    if (result && result.user) {
      await this.prisma.user.update({
        data: {
          departments: {
            create: departmentCodes.map((code) => ({
              department: {
                connect: { code },
              },
            })),
          },
        },
        where: { id: result.user.id },
      })
    }
  }

  /**
   * Delete a user by id.
   * @param {UserId} userId - Id of the user to delete
   * @returns The user with their department and a signed avatar URL
   * @throws Prisma P6002 (mapped to UNAUTHORIZED) if the user doesn't exist or not be admin or the user is the only admin or the user is connect
   */
  public async delete(payload: deleteUserInput) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: payload.userId,
      },
    })
    if (!user) throw new AppError('NOT_FOUND', "User don't exist")
    if (user.role === UserRole.ADMIN) {
      const nbAdmin = await this.prisma.user.count({
        where: {
          role: UserRole.ADMIN,
        },
      })
      if (nbAdmin < 2)
        throw new AppError('UNAUTHORIZED', 'this user cannot be delete')
    }

    await this.prisma.user.delete({
      where: {
        id: payload.userId,
      },
    })
  }

  /**
   * Fetches a user by id with their department.
   * @param {UserId} userId - Id of the user to fetch
   * @returns The user with their department and a signed avatar URL
   * @throws Throws if the user doesn't exist
   */
  public async getById(userId: string) {
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
    const { department, page, pageSize, search } = payload
    const where = {
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' as const } },
          { lastName: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(department && { department: { code: department } }),
    } satisfies Prisma.UserWhereInput

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
   * Update a user account on behalf of an admin.
   * @param {CreateUserInput} payload - Identity, contact and target department code of the account to update
   * @returns The update user as returned by the auth provider
   * @throws Prisma P6002 (mapped to UNAUTHORIZED) if the user doesn't exist or not be admin
   * @throws Prisma P2025 (mapped to NOT_FOUND) if the target department code doesn't exist
   * @remarks Admin-only operation — authorization is enforced upstream by the `adminProcedure`, so the service trusts its caller and never re-checks the actor's role. The password is generated server-side (the account is provisioned, not self-registered); delivering it to the new user is out of this method's scope. Account creation goes through better-auth (hashing, account row, schema field mapping) rather than a raw Prisma insert, and the department code is resolved to its id since the auth schema stores `departmentId`.
   */
  public async update(adminId: string, payload: updateUserFromAdminInput) {
    const admin = await this.prisma.user.findUnique({
      where: {
        id: adminId,
      },
    })
    if (!admin || !isAdminRole(admin.role)) {
      throw new AppError(
        'UNAUTHORIZED',
        'You are not allowed to do this operation',
      )
    }

    const department = await this.prisma.department.findMany({
      where: {
        code: { in: payload.departmentCodes },
      },
    })
    if (!department) {
      throw new AppError('NOT_FOUND', "The department(s) doesn't exist")
    }

    const { departmentCodes, userId, ...data } = payload

    const user = await this.prisma.user.update({
      data: {
        ...data,
        departments: {
          create: departmentCodes.map((code) => ({
            department: { connect: { code } },
          })),
          deleteMany: {},
        },
      },
      where: {
        id: userId,
      },
    })

    return user
  }

  public async updatePassword(input: UpdatePasswordInput, headers: Headers) {
    return this.betterAuth.api.changePassword({
      body: { ...input, revokeOtherSessions: true },
      headers,
    })
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
