import type { Prisma, prisma } from '@iut-intranet/db'
import { NewsStatus } from '@iut-intranet/db'
import type { NewsId, UserId } from '@iut-intranet/helpers/schemas/brand'
import type {
  CreateNewsInput,
  ListVisibleNewsInput,
  UpdateNewsInput,
} from '@iut-intranet/helpers/schemas/news'
import {
  signUrlField,
  StorageFolders,
  uploadObject,
} from '@iut-intranet/providers/s3'

import {
  buildVisibilityFilter,
  newsInclude,
  newsListSelect,
} from '@/news/news.query'
import {
  assertPublishDateMatchesStatus,
  resolvePublishedAt,
} from '@/news/news.rules'
import type { UserService } from '@/user/user.service'

export class NewsService {
  constructor(
    private prisma: prisma,
    private userService: UserService,
  ) {}

  /**
   * Auto-archives published news whose publication date is older than one month.
   * @returns {Promise<{ count: number }>} The number of news transitioned to ARCHIVED
   * @remarks Clock-driven maintenance run by the daily archive cron, not a user action: it sweeps every PUBLISHED news older than the retention window in a single `updateMany`. SCHEDULED and DRAFT news are left untouched. The retention window (one month) is the inactivity delay after which a published news is considered stale.
   */
  public async archivePastPublishedNews(): Promise<{ count: number }> {
    const retentionLimit = new Date()
    retentionLimit.setMonth(retentionLimit.getMonth() - 1)

    return this.prisma.news.updateMany({
      data: { status: NewsStatus.ARCHIVED },
      where: {
        publishedAt: { lt: retentionLimit },
        status: NewsStatus.PUBLISHED,
      },
    })
  }

  /**
   * Creates a news owned by the given user with the requested status and publication date.
   * @param {CreateNewsInput} payload - News content, status, target department codes and optional cover
   * @param {UserId} userId - Id of the authoring user, set as owner
   * @returns The created news with its author, target departments and a signed cover URL
   * @remarks Wires target departments from their codes, and validates status↔date coherence like update. The structural status↔date shape (a scheduled news carries a date, the others don't) is enforced upstream by the input schema.
   */
  public async create(payload: CreateNewsInput, userId: UserId) {
    const { content, cover, status, targetDepartmentCodes, title } = payload
    const publishedAt = resolvePublishedAt(payload, null)
    assertPublishDateMatchesStatus(status, publishedAt)

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
   * @returns The news with its author, target departments and a signed cover URL
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
   * @returns The visible news as list projections (see {@link newsListSelect}, without `content`, each with a signed cover URL) and the total matching count
   * @throws Prisma P2025 (mapped to NOT_FOUND) if the user doesn't exist
   * @remarks Several statuses can be requested at once. An admin sees every requested status; for others, public ones (PUBLISHED) stay open while non-public ones (DRAFT/SCHEDULED/ARCHIVED) are restricted to their author. Both regimes are combined in a single WHERE clause so the pagination count stays correct, and search/department filters are applied in SQL rather than in memory. The full body is loaded by {@link getById} only.
   */
  public async listVisible(payload: ListVisibleNewsInput, userId: UserId) {
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
        orderBy: { publishedAt: 'desc' },
        select: newsListSelect,
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
   * @returns The updated news with its author, target departments and a signed cover URL
   * @throws Prisma P2025 (mapped to NOT_FOUND, via getById) if the news doesn't exist
   * @remarks When `targetDepartmentCodes` is provided it fully replaces the news' departments (`set` on the unique `code`, not a merge); omitting it leaves them untouched.
   */
  public async update(payload: UpdateNewsInput) {
    const { content, cover, newsId, status, targetDepartmentCodes, title } =
      payload
    const news = await this.getById(newsId)
    const publishedAt = resolvePublishedAt(payload, news)
    assertPublishDateMatchesStatus(status, publishedAt)

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
