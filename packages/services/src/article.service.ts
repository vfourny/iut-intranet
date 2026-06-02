import type { DepartmentCode, prisma } from '@iut-intranet/db'
import type { Prisma } from '@iut-intranet/db'
import { ArticleStatus } from '@iut-intranet/db'
import { AppError } from '@iut-intranet/helpers/errors'
import type {
  createArticleInput,
  updateArticleInput,
} from '@iut-intranet/helpers/types/article'
import type { uploadImageInput } from '@iut-intranet/helpers/types/image'
import { isEditorRole } from '@iut-intranet/helpers/utils/role'
import { getSignedObjectUrl, uploadObject } from '@iut-intranet/providers/s3'

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
    const article = await this.prisma.article.create({
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
    return this.withSignedCover(article)
  }

  async delete(articleId: string) {
    await this.getById(articleId)
    const article = await this.prisma.article.delete({
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
    return this.withSignedCover(article)
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
    return this.withSignedCover(article)
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
    return this.withSignedCover(article)
  }

  async listByStatus(status: ArticleStatus) {
    const articles = await this.prisma.article.findMany({
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
        status,
      },
    })
    return Promise.all(articles.map((article) => this.withSignedCover(article)))
  }

  async listVisibleForUser(userId: string, status: ArticleStatus) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    })

    if (!user) {
      throw new AppError('NOT_FOUND', 'User not found')
    }

    const articlesListByStatus = await this.listByStatus(status)

    if (
      [ArticleStatus.DRAFT, ArticleStatus.SCHEDULED].some(
        (artStatus) => artStatus === status,
      )
    ) {
      return articlesListByStatus.filter((article) => {
        return article.authorId === userId
      })
    }

    return articlesListByStatus
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

    const updated = await this.prisma.article.update({
      data: {
        content: input.content as Prisma.InputJsonValue,
        // `undefined` laisse la couverture inchangée (Prisma ignore le champ) ;
        // `null` la supprime ; une clé la remplace. Le form n'envoie une clé
        // que sur un nouvel upload, jamais l'URL signée lue précédemment.
        coverUrl: input.coverUrl,
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
    return this.withSignedCover(updated)
  }

  /**
   * Uploads an article cover image and returns its object key, to be persisted
   * on the article via {@link create} / {@link update}. The bucket is private,
   * so the key is turned into a signed URL only on read.
   */
  async uploadCover(payload: uploadImageInput): Promise<string> {
    return uploadObject({ ...payload, folder: 'cover' })
  }

  /**
   * Replaces a stored cover object key with a temporary signed URL the browser
   * can load. The bucket is private, so URLs are generated on read, never
   * persisted (mirrors the avatar flow in {@link UserService}).
   */
  private async withSignedCover<T extends { coverUrl: string | null }>(
    article: T,
  ): Promise<T> {
    return {
      ...article,
      coverUrl: article.coverUrl
        ? await getSignedObjectUrl(article.coverUrl)
        : null,
    }
  }
}
