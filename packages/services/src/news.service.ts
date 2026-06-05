import type { DepartmentCode, prisma } from '@iut-intranet/db'
import type { Prisma } from '@iut-intranet/db'
import { NewsStatus } from '@iut-intranet/db'
import type { NewsModel } from '@iut-intranet/db/models'
import { AppError } from '@iut-intranet/helpers/errors'
import type { NewsId, UserId } from '@iut-intranet/helpers/schemas/brand'
import type { Paginated } from '@iut-intranet/helpers/schemas/common'
import type {
  CreateNewsInput,
  UpdateNewsInput,
} from '@iut-intranet/helpers/schemas/news'
import type { ListVisibleNewsInput } from '@iut-intranet/helpers/schemas/news'
import { resolvePublishedAt } from '@iut-intranet/helpers/utils/news'
import { isEditorRole } from '@iut-intranet/helpers/utils/role'
import {
  signUrlField,
  StorageFolders,
  uploadObject,
} from '@iut-intranet/providers/s3'

/**
 * Validates the temporal coherence between a news status and its publication date.
 * @param {NewsStatus} status - The status the news is moving to
 * @param {Date | null} [publishedAt] - The publication date, when one is set
 * @returns {void}
 * @throws {AppError} BAD_REQUEST when a SCHEDULED news lacks a future date, or a PUBLISHED news carries a future one
 * @remarks Only the clock-dependent rules live here; the structural ones (a draft has no date, a scheduled news has a date) are enforced upfront by the input schema. Shared by create/update — the latter passes the merged status (payload ?? stored), which the schema cannot know.
 */
const newsInclude = {
  author: { select: { firstName: true, lastName: true } },
  targetDepartments: { select: { code: true } },
} satisfies Prisma.NewsInclude

function validateStatus(status: NewsStatus, publishedAt?: Date | null) {
  const now = new Date()

  if (status === NewsStatus.SCHEDULED && (!publishedAt || publishedAt <= now)) {
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
   * Creates a news owned by the given user with the requested status and publication date.
   * @param {CreateNewsInput} payload - News content, status, target department codes and optional cover
   * @param {UserId} userId - Id of the authoring user, set as owner
   * @returns {Promise<NewsModel>} The created news with its author, target departments and a signed cover URL
   * @remarks Defaults to a DRAFT, wires target departments from their codes, and validates status↔date coherence like update.
   */
  public async create(payload: CreateNewsInput, userId: UserId) {
    const now = new Date()
    // Date de publication pilotée par le service : un PUBLISHED est daté à `now`
    // (l'instant de publication), un draft n'a pas de date, un scheduled garde
    // la date fournie (validée future plus bas).
    const publishedAt = resolvePublishedAt(
      payload.status,
      payload.publishedAt,
      now,
    )
    validateStatus(payload.status, publishedAt)

    const departments = await this.prisma.department.findMany({
      select: { id: true },
      where: {
        code: { in: payload.targetDepartmentCodes as DepartmentCode[] },
      },
    })
    const created = await this.prisma.news.create({
      data: {
        authorId: userId,
        content: payload.content,
        publishedAt,
        status: payload.status,
        targetDepartments: {
          connect: departments.map((d) => ({ id: d.id })),
        },
        title: payload.title,
      },
      include: newsInclude,
    })

    // Cover uploadée après la création : la clé est partitionnée par `news.id`
    // (`news/<id>/cover.png`), qui n'existe pas avant l'insert. En cas d'échec
    // d'upload la news reste sans cover (`coverUrl` nullable), jamais d'orphelin.
    const coverUrl = payload.cover
      ? await uploadObject({
          ...payload.cover,
          fileName: 'cover',
          folder: StorageFolders.news,
          subFolder: created.id,
        })
      : undefined

    const news = coverUrl
      ? await this.prisma.news.update({
          data: { coverUrl },
          include: newsInclude,
          where: { id: created.id },
        })
      : created

    return signUrlField(news, 'coverUrl')
  }

  /**
   * Fetches a news by id with its author and target departments.
   * @param {NewsId} newsId - Id of the news to fetch
   * @param {UserId} userId - Id of the caller, used for the editor gate
   * @returns {Promise<NewsModel>} The news with its author, target departments and a signed cover URL
   * @throws {AppError} NOT_FOUND if the caller isn't an editor
   * @throws Prisma P2025 (mapped to NOT_FOUND) if the news doesn't exist
   * @remarks Editor-gated: non-editors get NOT_FOUND rather than FORBIDDEN so the resource's existence isn't leaked.
   */
  public async getById(newsId: NewsId, userId: UserId) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user || !isEditorRole(user.role)) {
      throw new AppError('NOT_FOUND', 'User not found')
    }
    const news = await this.prisma.news.findUniqueOrThrow({
      include: newsInclude,
      where: { id: newsId },
    })
    return signUrlField(news, 'coverUrl')
  }

  /**
   * Lists news visible to a user, paginated and filtered server-side.
   * @param {ListVisibleNewsInput} payload - Status filter, search term, department codes and pagination
   * @param {UserId} userId - Id of the caller, scoping DRAFT/SCHEDULED to their author
   * @returns {Promise<Paginated<NewsModel>>} The visible news (each with a signed cover URL) and the total matching count
   * @throws Prisma P2025 (mapped to NOT_FOUND) if the user doesn't exist
   * @remarks PUBLISHED news are visible to everyone; DRAFT/SCHEDULED are restricted to their author. The status is part of the WHERE clause so the pagination count stays correct, and search/department filters are applied in SQL rather than in memory.
   */
  public async listVisible(
    payload: ListVisibleNewsInput,
    userId: UserId,
  ): Promise<Paginated<NewsModel>> {
    const { departmentCodes, page, pageSize, search, status } = payload

    await this.prisma.user.findUniqueOrThrow({ where: { id: userId } })

    const isAuthorScoped =
      status === NewsStatus.DRAFT || status === NewsStatus.SCHEDULED

    const where: Prisma.NewsWhereInput = {
      status,
      ...(isAuthorScoped ? { authorId: userId } : {}),
      ...(search ? { title: { contains: search, mode: 'insensitive' } } : {}),
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
        include: newsInclude,
        orderBy: { publishedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        where,
      }),
      this.prisma.news.count({ where }),
    ])

    return {
      items: await Promise.all(
        news.map((news) => signUrlField(news, 'coverUrl')),
      ),
      total,
    }
  }

  /**
   * Updates an editor-owned news after validating its status/publication-date coherence.
   * @param {UpdateNewsInput} payload - Fields to update, including the news id and target department codes
   * @param {UserId} userId - Id of the caller, used for the editor/ownership gate
   * @returns {Promise<NewsModel>} The updated news with its author, target departments and a signed cover URL
   * @throws {AppError} NOT_FOUND (via getById) if the caller isn't an editor or the news doesn't exist
   * @remarks Target departments are reset then reconnected from the payload codes (a full replace, not a merge).
   */
  public async update(payload: UpdateNewsInput, userId: UserId) {
    const news = await this.getById(payload.newsId, userId)
    const now = new Date()
    const status = payload.status ?? news.status
    // Date pilotée par le service pour un PUBLISHED : `now` à la première
    // publication, date d'origine conservée ensuite (un simple édit ne la
    // réinitialise pas).
    const publishedAt = resolvePublishedAt(
      status,
      payload.publishedAt,
      news.publishedAt ?? now,
    )
    validateStatus(status, publishedAt)

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

    // `undefined` laisse la couverture inchangée (Prisma ignore le champ) ; un
    // fichier l'uploade et la remplace. Pas de suppression : une fois posée, on
    // garde l'ancienne couverture tant qu'aucune nouvelle ne la remplace.
    const coverUrl = payload.cover
      ? await uploadObject({
          ...payload.cover,
          fileName: 'cover',
          folder: StorageFolders.news,
          subFolder: news.id,
        })
      : undefined

    const updated = await this.prisma.news.update({
      data: {
        content: payload.content,
        coverUrl,
        publishedAt,
        status: status,
        targetDepartments: {
          connect: departments.map((department) => ({ id: department.id })),
        },
        title: payload.title,
      },
      include: newsInclude,
      where: { id: payload.newsId },
    })
    return signUrlField(updated, 'coverUrl')
  }
}
