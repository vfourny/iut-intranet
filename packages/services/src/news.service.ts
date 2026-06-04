import type { DepartmentCode, prisma } from '@iut-intranet/db'
import type { Prisma } from '@iut-intranet/db'
import { NewsStatus } from '@iut-intranet/db'
import type { NewsModel } from '@iut-intranet/db/models'
import { AppError } from '@iut-intranet/helpers/errors'
import type { UserId } from '@iut-intranet/helpers/schemas/brand'
import type {
  CreateNewsInput,
  NewsId,
  UpdateNewsInput,
} from '@iut-intranet/helpers/schemas/news'
import type { ListVisibleNewsInput } from '@iut-intranet/helpers/schemas/news'
import { isEditorRole } from '@iut-intranet/helpers/utils/role'
import { getSignedObjectUrl, uploadObject } from '@iut-intranet/providers/s3'

/**
 * Validates the coherence between a news status and its publication date,
 * throwing BAD_REQUEST on a contradiction (e.g. a scheduled news without a
 * future date). Shared by create/update so both enforce the same rules.
 */
function validateStatus(status: NewsStatus, publishedAt?: Date | null) {
  const now = new Date()

  if (status === NewsStatus.DRAFT && publishedAt) {
    throw new AppError(
      'BAD_REQUEST',
      'A draft news cannot have a publication date',
    )
  }

  if (
    status === NewsStatus.SCHEDULED &&
    (!publishedAt || publishedAt <= now)
  ) {
    throw new AppError(
      'BAD_REQUEST',
      'A scheduled news must have a future publication date',
    )
  }

  if (status === NewsStatus.PUBLISHED && publishedAt && publishedAt > now) {
    throw new AppError(
      'BAD_REQUEST',
      'A published news cannot have a future publication date',
    )
  }
}

export class NewsService {
  constructor(private prisma: prisma) {}

  /**
   * Creates a news as a DRAFT owned by `userId`, wiring its target departments
   * from their codes. Returns it with a signed cover URL.
   */
  public async create(payload: CreateNewsInput, userId: UserId) {
    const departments = await this.prisma.department.findMany({
      select: { id: true },
      where: {
        code: { in: payload.targetDepartmentCodes as DepartmentCode[] },
      },
    })
    const coverUrl = payload.cover
      ? await uploadObject({ ...payload.cover, folder: 'news' })
      : undefined
    const news = await this.prisma.news.create({
      data: {
        authorId: userId,
        content: payload.content as Prisma.InputJsonValue,
        coverUrl,
        status: NewsStatus.DRAFT,
        targetDepartments: {
          connect: departments.map((d) => ({ id: d.id })),
        },
        title: payload.title,
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
    return this.withSignedCover(news)
  }

  /**
   * Fetches a news by id with its author and target departments, plus a signed
   * cover URL. Editor-gated: non-editors get NOT_FOUND rather than FORBIDDEN so
   * the resource's existence isn't leaked. Throws NOT_FOUND if it doesn't exist.
   */
  public async getById(newsId: NewsId, userId: UserId) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user || !isEditorRole(user.role)) {
      throw new AppError('NOT_FOUND', 'User not found')
    }
    const news = await this.prisma.news.findUnique({
      include: {
        author: { select: { firstName: true, lastName: true } },
        targetDepartments: { select: { code: true } },
      },
      where: { id: newsId },
    })
    if (!news) throw new AppError('NOT_FOUND', 'News not found')
    return this.withSignedCover(news)
  }

  /**
   * Lists news visible to a user, paginated and filtered server-side.
   *
   * Visibility: PUBLISHED news are visible to everyone; DRAFT/SCHEDULED are
   * restricted to their author. The status is part of the WHERE clause so the
   * pagination count stays correct, and search/department filters are applied
   * in SQL rather than in memory.
   */
  public async listVisible(payload: ListVisibleNewsInput, userId: UserId) {
    const { departmentCodes, page, pageSize, search, status } = payload

    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      throw new AppError('NOT_FOUND', 'User not found')
    }

    const isAuthorScoped =
      status === NewsStatus.DRAFT || status === NewsStatus.SCHEDULED

    const where: Prisma.NewsWhereInput = {
      status,
      ...(isAuthorScoped ? { authorId: userId } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { excerpt: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(departmentCodes.length
        ? {
            targetDepartments: {
              some: { code: { in: departmentCodes as DepartmentCode[] } },
            },
          }
        : {}),
    }

    const [news, total] = await Promise.all([
      this.prisma.news.findMany({
        include: {
          author: { select: { firstName: true, lastName: true } },
          targetDepartments: { select: { code: true } },
        },
        orderBy: { publishedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        where,
      }),
      this.prisma.news.count({ where }),
    ])

    return {
      items: await Promise.all(
        news.map((news) => this.withSignedCover(news)),
      ),
      total,
    }
  }

  /**
   * Updates an editor-owned news after validating its status/publication-date
   * coherence. Target departments are reset then reconnected from the payload
   * codes (a full replace, not a merge). Returns it with a signed cover URL.
   */
  public async update(payload: UpdateNewsInput, userId: UserId) {
    const news = await this.getById(payload.newsId, userId)
    const status = payload.status ?? news.status
    validateStatus(status, payload.publishedAt)

    const departments = await this.prisma.department.findMany({
      select: { id: true },
      where: {
        code: { in: payload.targetDepartmentCodes as DepartmentCode[] },
      },
    })

    await this.prisma.news.update({
      data: {
        targetDepartments: { set: [] },
      },
      where: { id: payload.newsId },
    })

    // `undefined` laisse la couverture inchangée (Prisma ignore le champ) ;
    // `null` la supprime ; un fichier l'uploade et la remplace.
    const coverUrl =
      payload.cover === null
        ? null
        : payload.cover
          ? await uploadObject({ ...payload.cover, folder: 'news' })
          : undefined

    const updated = await this.prisma.news.update({
      data: {
        content: payload.content as Prisma.InputJsonValue,
        coverUrl,
        publishedAt: payload.publishedAt,
        status: status,
        targetDepartments: {
          connect: departments.map((department) => ({ id: department.id })),
        },
        title: payload.title,
      },
      include: {
        author: { select: { firstName: true, lastName: true } },
        targetDepartments: { select: { code: true } },
      },
      where: { id: payload.newsId },
    })
    return this.withSignedCover(updated)
  }

  /**
   * Replaces a stored cover object key with a temporary signed URL the browser
   * can load. The bucket is private, so URLs are generated on read, never
   * persisted (mirrors the avatar flow in {@link UserService}).
   */
  private async withSignedCover<T extends { coverUrl: NewsModel['coverUrl'] }>(
    news: T,
  ): Promise<T> {
    return {
      ...news,
      coverUrl: news.coverUrl
        ? await getSignedObjectUrl(news.coverUrl)
        : null,
    }
  }
}
