import type { prisma } from '@iut-intranet/db'
import type { Prisma } from '@iut-intranet/db'
import { NewsStatus } from '@iut-intranet/db'
import type { UserRole } from '@iut-intranet/db/enums'
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
import { isAdminRole } from '@iut-intranet/helpers/utils/role'
import {
  signUrlField,
  StorageFolders,
  uploadObject,
} from '@iut-intranet/providers/s3'

import type { UserService } from '@/user.service'

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

const AUTHOR_SCOPED_STATUSES = [
  NewsStatus.DRAFT,
  NewsStatus.SCHEDULED,
] as const satisfies NewsStatus[]

const isAuthorScopedStatus = (status: NewsStatus) =>
  AUTHOR_SCOPED_STATUSES.some((scopedStatus) => scopedStatus === status)

/**
 * Builds the visibility WHERE filter from the caller's role.
 * @param {NewsStatus[]} status - The requested statuses
 * @param {UserId} userId - Id of the acting user
 * @param {UserRole} role - Role of the acting user; visibility is decided from it
 * @returns {Prisma.NewsWhereInput} An admin sees every requested status; otherwise public ones (PUBLISHED) stay open while non-public ones (DRAFT/SCHEDULED) are restricted to their author, combined in a single OR so the pagination count stays exact.
 */
function buildVisibilityFilter(
  status: NewsStatus[],
  userId: UserId,
  role: UserRole,
): Prisma.NewsWhereInput {
  if (isAdminRole(role)) return { status: { in: status } }

  const openStatuses = status.filter(
    (requestedStatus) => !isAuthorScopedStatus(requestedStatus),
  )
  const authorScopedStatuses = status.filter(isAuthorScopedStatus)

  return {
    OR: [
      ...(openStatuses.length ? [{ status: { in: openStatuses } }] : []),
      ...(authorScopedStatuses.length
        ? [{ authorId: userId, status: { in: authorScopedStatuses } }]
        : []),
    ],
  }
}

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
  constructor(
    private prisma: prisma,
    private userService: UserService,
  ) {}

  /**
   * Creates a news owned by the given user with the requested status and publication date.
   * @param {CreateNewsInput} payload - News content, status, target department codes and optional cover
   * @param {UserId} userId - Id of the authoring user, set as owner
   * @returns {Promise<NewsModel>} The created news with its author, target departments and a signed cover URL
   * @remarks Defaults to a DRAFT, wires target departments from their codes, and validates status↔date coherence like update.
   */
  public async create(payload: CreateNewsInput, userId: UserId) {
    const {
      content,
      cover,
      publishedAt: inputPublishedAt,
      status,
      targetDepartmentCodes,
      title,
    } = payload
    const now = new Date()
    const publishedAt = resolvePublishedAt(status, inputPublishedAt, now)
    validateStatus(status, publishedAt)

    const news = await this.prisma.$transaction(async (tx) => {
      const created = await tx.news.create({
        data: {
          authorId: userId,
          content,
          publishedAt,
          status,
          targetDepartments: {
            connect: targetDepartmentCodes.map((code) => ({ code })),
          },
          title,
        },
        include: newsInclude,
      })

      if (!cover) return created

      const coverUrl = await uploadObject({
        ...cover,
        fileName: created.id,
        folder: StorageFolders.news,
        subFolder: 'cover',
      })

      return tx.news.update({
        data: { coverUrl },
        include: newsInclude,
        where: { id: created.id },
      })
    })

    return signUrlField(news, 'coverUrl')
  }

  /**
   * Fetches a news by id with its author and target departments.
   * @param {NewsId} newsId - Id of the news to fetch
   * @returns {Promise<NewsModel>} The news with its author, target departments and a signed cover URL
   * @throws Prisma P2025 (mapped to NOT_FOUND) if the news doesn't exist
   */
  public async getById(newsId: NewsId) {
    const news = await this.prisma.news.findUniqueOrThrow({
      include: newsInclude,
      where: { id: newsId },
    })
    return signUrlField(news, 'coverUrl')
  }

  /**
   * Lists news visible to the caller, paginated and filtered server-side.
   * @param {ListVisibleNewsInput} payload - Requested statuses (at least one), search term, department codes and pagination
   * @param {UserId} userId - Id of the acting user; visibility is decided from their role (re-fetched here)
   * @returns {Promise<Paginated<NewsModel>>} The visible news (each with a signed cover URL) and the total matching count
   * @throws Prisma P2025 (mapped to NOT_FOUND) if the user doesn't exist
   * @remarks Several statuses can be requested at once. An admin sees every requested status; for others, public ones (PUBLISHED) stay open while non-public ones (DRAFT/SCHEDULED) are restricted to their author. Both regimes are combined in a single WHERE clause so the pagination count stays correct, and search/department filters are applied in SQL rather than in memory.
   */
  public async listVisible(
    payload: ListVisibleNewsInput,
    userId: UserId,
  ): Promise<Paginated<NewsModel>> {
    const { departmentCodes, page, pageSize, search, status } = payload

    const role = await this.userService.getRole(userId)

    const where = {
      ...buildVisibilityFilter(status, userId, role),
      ...(search
        ? { title: { contains: search, mode: 'insensitive' as const } }
        : {}),
      ...(departmentCodes.length
        ? {
            targetDepartments: {
              some: { code: { in: departmentCodes } },
            },
          }
        : {}),
    } satisfies Prisma.NewsWhereInput

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
   * @returns {Promise<NewsModel>} The updated news with its author, target departments and a signed cover URL
   * @throws Prisma P2025 (mapped to NOT_FOUND, via getById) if the news doesn't exist
   * @remarks When `targetDepartmentCodes` is provided it fully replaces the news' departments (`set` on the unique `code`, not a merge); omitting it leaves them untouched.
   */
  public async update(payload: UpdateNewsInput) {
    const {
      content,
      cover,
      newsId,
      publishedAt: inputPublishedAt,
      status: inputStatus,
      targetDepartmentCodes,
      title,
    } = payload
    const news = await this.getById(newsId)
    const now = new Date()
    const status = inputStatus ?? news.status
    // Date pilotée par le service pour un PUBLISHED : `now` à la première
    // publication, date d'origine conservée ensuite (un simple édit ne la
    // réinitialise pas).
    const publishedAt = resolvePublishedAt(
      status,
      inputPublishedAt,
      news.publishedAt ?? now,
    )
    validateStatus(status, publishedAt)

    // `undefined` laisse la couverture inchangée (Prisma ignore le champ) ; un
    // fichier l'uploade et la remplace. Pas de suppression : une fois posée, on
    // garde l'ancienne couverture tant qu'aucune nouvelle ne la remplace.
    const coverUrl = cover
      ? await uploadObject({
          ...cover,
          fileName: 'cover',
          folder: StorageFolders.news,
          subFolder: news.id,
        })
      : undefined

    const updated = await this.prisma.news.update({
      data: {
        content,
        coverUrl,
        publishedAt,
        status,
        title,
        ...(targetDepartmentCodes && {
          targetDepartments: {
            set: targetDepartmentCodes.map((code) => ({ code })),
          },
        }),
      },
      include: newsInclude,
      where: { id: newsId },
    })
    return signUrlField(updated, 'coverUrl')
  }
}
