import type { prisma } from '@iut-intranet/db'
import type { Prisma } from '@iut-intranet/db'
import { ArticleStatus } from '@iut-intranet/db'
import { AppError } from '@iut-intranet/helpers/errors'
import type {
  createArticleInput,
  updateArticleInput,
} from '@iut-intranet/helpers/types/article'

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
    validateStatus(input.status, input.publishedAt)
    return this.prisma.article.create({
      data: {
        authorId: input.authorId,
        content: input.content as Prisma.InputJsonValue,
        coverUrl: input.coverUrl,
        excerpt: input.excerpt,
        publishedAt: input.publishedAt,
        status: input.status ?? 'DRAFT',
        targetDepartments: {
          connect: (input.targetDepartmentIds ?? []).map((id) => ({ id })),
        },
        title: input.title,
      },
    })
  }

  async delete(articleId: string) {
    await this.getById(articleId)
    return this.prisma.article.delete({
      where: {
        id: articleId,
      },
    })
  }

  async getById(articleId: string) {
    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
    })
    if (!article) throw new AppError('NOT_FOUND', 'Article not found')
    return article
  }

  async list() {
    return this.prisma.article.findMany()
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
      where: {
        OR: [
          { targetDepartments: { none: {} } },
          { targetDepartments: { some: { id: user.departmentId } } },
        ],
        status: ArticleStatus.PUBLISHED,
      },
    })
  }

  async update(articleId: string, input: updateArticleInput) {
    const article = await this.getById(articleId)
    const status = input.status ?? article.status
    validateStatus(status, input.publishedAt)

    return this.prisma.article.update({
      data: {
        content: input.content as Prisma.InputJsonValue,
        coverUrl: input.coverUrl,
        excerpt: input.excerpt,
        publishedAt: input.publishedAt,
        status: status,
        targetDepartments: {
          connect: (input.targetDepartmentIds ?? []).map((id) => ({ id })),
        },
        title: input.title,
      },
      where: { id: articleId },
    })
  }
}
