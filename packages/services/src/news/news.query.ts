import type { Prisma } from '@iut-intranet/db'
import { NewsStatus } from '@iut-intranet/db'
import type { UserRole } from '@iut-intranet/db/enums'
import type { UserId } from '@iut-intranet/helpers/schemas/brand'
import { isAdminRole } from '@iut-intranet/helpers/utils/role'

export const newsInclude = {
  author: { select: { firstName: true, lastName: true } },
  targetDepartments: { select: { code: true } },
} satisfies Prisma.NewsInclude

// Projection de liste : tout sauf `content` (le corps complet de l'article), que
// seules les vues détail (getById) chargent. Les cartes n'affichent que l'en-tête.
export const newsListSelect = {
  author: { select: { firstName: true, lastName: true } },
  authorId: true,
  coverUrl: true,
  id: true,
  publishedAt: true,
  status: true,
  targetDepartments: { select: { code: true } },
  title: true,
} satisfies Prisma.NewsSelect

const AUTHOR_SCOPED_STATUSES = [
  NewsStatus.DRAFT,
  NewsStatus.SCHEDULED,
  NewsStatus.ARCHIVED,
] as const satisfies NewsStatus[]

const isAuthorScopedStatus = (status: NewsStatus) =>
  AUTHOR_SCOPED_STATUSES.some((scopedStatus) => scopedStatus === status)

/**
 * Builds the visibility WHERE filter from the caller's role.
 * @param {NewsStatus[]} status - The requested statuses
 * @param {UserId} userId - Id of the acting user
 * @param {UserRole} role - Role of the acting user; visibility is decided from it
 * @returns {Prisma.NewsWhereInput} An admin sees every requested status; otherwise public ones (PUBLISHED) stay open while non-public ones (DRAFT/SCHEDULED/ARCHIVED) are restricted to their author, combined in a single OR so the pagination count stays exact.
 */
export const buildVisibilityFilter = (
  status: NewsStatus[],
  userId: UserId,
  role: UserRole,
): Prisma.NewsWhereInput => {
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
