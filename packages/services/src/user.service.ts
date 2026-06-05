import { type BetterAuthInstance } from '@iut-intranet/auth/types'
import type { DepartmentCode } from '@iut-intranet/db'
import { type prisma } from '@iut-intranet/db'
import type { UserModel } from '@iut-intranet/db/models'
import { AppError } from '@iut-intranet/helpers/errors'
import type { uploadAvatarInput } from '@iut-intranet/helpers/types/storage'
import type {
  createUserFromAdminInput,
  updateOwnProfileInput,
  UpdateUserInput,
} from '@iut-intranet/helpers/types/user'
import { isAdminRole } from '@iut-intranet/helpers/utils/role'
import { uploadUserAvatarObject } from '@iut-intranet/providers/s3'
import { generate } from 'generate-password-ts'

export class UserService {
  constructor(
    private betterAuth: BetterAuthInstance,
    private prisma: prisma,
  ) {}

  public async create(adminId: string, user: createUserFromAdminInput) {
    const admin = await this.getById(adminId)
    if (!isAdminRole(admin.role)) {
      throw new AppError('UNAUTHORIZED', 'Not authorized to create user')
    }

    const password = generate({
      length: 8,
      numbers: true,
      symbols: true,
      uppercase: true,
    })

    const department = await this.prisma.department.findUniqueOrThrow({
      where: { code: user.departmentCode },
    })
    return await this.betterAuth.api.createUser({
      body: {
        data: {
          departmentId: department.id,
          firstName: user.firstName,
          jobTitle: user.jobTitle,
          phone: user.phone,
        },
        email: user.email,
        name: user.lastName,
        password: password,
        role: user.role,
      },
    })
  }

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

  async getByIdWithDepartment(id: string) {
    return this.prisma.user.findUniqueOrThrow({
      include: { department: true },
      where: { id },
    })
  }

  /**
   * Retrieves a paginated list of users, optionally filtered by name.
   */
  public async list(input: {
    department?: DepartmentCode
    page: number
    pageSize: number
    search?: string
  }) {
    const { department, page, pageSize, search } = input
    const where = {
      ...(department ? { department: { code: department } } : {}),
      ...(search
        ? {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' as const } },
              { lastName: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    }

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

    return { items, total }
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
    return this.prisma.user.update({
      data: {
        image: user.image,
        jobTitle: user.jobTitle,
        phone: user.phone,
      },
      where: { id: userId },
    })
  }

  /**
   * Uploads a user avatar to object storage and persists its public URL
   * @param {UploadUserAvatarInput} payload - Base64 image and its content type
   * @param {string} userId - Owner of the avatar
   * @returns {Promise<UserModel>} The updated user
   */
  public async uploadAvatar(
    payload: uploadAvatarInput,
    userId: string,
  ): Promise<UserModel> {
    const imageUrl = await uploadUserAvatarObject({ ...payload, userId })

    return this.prisma.user.update({
      data: { image: imageUrl },
      where: { id: userId },
    })
  }
}
