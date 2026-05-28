import type { DepartmentCode, prisma } from '@iut-intranet/db'
import type { Prisma } from '@iut-intranet/db'
import { ArticleStatus } from '@iut-intranet/db'
import { AppError } from '@iut-intranet/helpers/errors'
import type {
  createArticleInput,
  updateArticleInput,
} from '@iut-intranet/helpers/types/article'
import { isEditorRole } from '@iut-intranet/helpers/utils/role'

function validateStatus(status: ArticleStatus, publishedAt?: Date | null) {
  const now = new Date()

  if (status === ArticleStatus.DRAFT && publishedAt) {
    throw new AppError(
      'BAD_REQUEST',
      'A draft article cannot have a publication date',
    )
  }

  if (
    status === ArticleStatus.SCHEDULED &&
    (!publishedAt || publishedAt <= now)
  ) {
    throw new AppError(
      'BAD_REQUEST',
      'A scheduled article must have a future publication date',
    )
  }

  if (status === ArticleStatus.PUBLISHED && publishedAt && publishedAt > now) {
    throw new AppError(
      'BAD_REQUEST',
      'A published article cannot have a future publication date',
    )
  }
}

export class ArticleService {
  constructor(private prisma: prisma) {}

  async create(input: createArticleInput) {
    const departments = await this.prisma.department.findMany({
      select: { id: true },
      where: {
        code: { in: input.targetDepartmentIds as DepartmentCode[] },
      },
    })
    return this.prisma.article.create({
      data: {
        authorId: input.authorId,
        content: input.content as Prisma.InputJsonValue,
        coverUrl: input.coverUrl,
        status: ArticleStatus.DRAFT,
        targetDepartments: {
          connect: departments.map((d) => ({ id: d.id })),
        },
        title: input.title,
      },
      include: {
        author: {
          select: { firstName: true, lastName: true },
        },
        targetDepartments: {
          select: { code: true },
        },
      },
    })
  }

  async delete(articleId: string) {
    await this.getById(articleId)
    return this.prisma.article.delete({
      include: {
        author: {
          select: { firstName: true, lastName: true },
        },
        targetDepartments: {
          select: { code: true },
        },
      },
      where: {
        id: articleId,
      },
    })
  }

  async getById(articleId: string) {
    const article = await this.prisma.article.findUnique({
      include: {
        author: {
          select: { firstName: true, lastName: true },
        },
        targetDepartments: {
          select: { code: true },
        },
      },
      where: { id: articleId },
    })
    if (!article) throw new AppError('NOT_FOUND', 'Article not found')
    return article
  }

  async getByIdWithRelations(articleId: string, userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user || !isEditorRole(user?.role)) {
      throw new AppError('NOT_FOUND', 'User not found')
    }
    const article = await this.prisma.article.findUnique({
      include: {
        author: { select: { firstName: true, lastName: true } },
        targetDepartments: { select: { code: true } },
      },
      where: { id: articleId },
    })
    if (!article) throw new AppError('NOT_FOUND', 'Article not found')
    return article
  }

  async list() {
    return this.prisma.article.findMany({
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        targetDepartments: {
          select: {
            code: true,
          },
        },
      },
      orderBy: {
        publishedAt: 'desc',
      },
    })
  }

  async listVisibleForUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    })

    if (!user) {
      throw new AppError('NOT_FOUND', 'User not found')
    }
    const whereClause = !isEditorRole(user.role)
      ? {
          OR: [
            { targetDepartments: { none: {} } },
            { targetDepartments: { some: { id: user.departmentId } } },
          ],
          status: ArticleStatus.PUBLISHED,
        }
      : {}

    return this.prisma.article.findMany({
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        targetDepartments: {
          select: {
            code: true,
          },
        },
      },
      orderBy: {
        publishedAt: 'desc',
      },
      where: whereClause,
    })
  }

  async update(input: updateArticleInput, userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user || !isEditorRole(user?.role)) {
      throw new AppError('NOT_FOUND', 'User not found')
    }

    const article = await this.getById(input.articleId)
    const status = input.status ?? article.status
    validateStatus(status, input.publishedAt)

    const departments = await this.prisma.department.findMany({
      select: { id: true },
      where: {
        code: { in: input.targetDepartmentIds as DepartmentCode[] },
      },
    })

    await this.prisma.article.update({
      data: {
        targetDepartments: { set: [] },
      },
      where: { id: input.articleId },
    })

    return this.prisma.article.update({
      data: {
        content: input.content as Prisma.InputJsonValue,
        coverUrl: input.coverUrl ?? null,
        publishedAt: input.publishedAt,
        status: status,
        targetDepartments: {
          connect: departments.map((department) => ({ id: department.id })),
        },
        title: input.title,
      },
      include: {
        author: { select: { firstName: true, lastName: true } },
        targetDepartments: { select: { code: true } },
      },
      where: { id: input.articleId },
    })
  }
}
