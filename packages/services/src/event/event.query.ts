import type { Prisma } from '@iut-intranet/db'
import type { UserRole } from '@iut-intranet/db/enums'
import type { UserId } from '@iut-intranet/helpers/schemas/brand'
import { isAdminRole } from '@iut-intranet/helpers/utils/role'

export const eventListInclude = {
  departments: { select: { code: true } },
  organizer: { select: { firstName: true, lastName: true } },
} satisfies Prisma.EventInclude

/**
 * Restricts events to those overlapping the requested calendar window.
 * @param {Date} [from] - Lower bound of the window
 * @param {Date} [to] - Upper bound of the window
 * @returns {Prisma.EventWhereInput} A filter keeping events that overlap [from, to] (start before `to` and end after `from`); an empty filter when the window is unbounded.
 */
export const buildCalendarWindowFilter = (
  from?: Date,
  to?: Date,
): Prisma.EventWhereInput =>
  from && to ? { endAt: { gte: from }, startAt: { lte: to } } : {}

/**
 * Builds the visibility WHERE filter from the caller's role.
 * @param {UserId} userId - Id of the acting user
 * @param {UserRole} role - Role of the acting user; visibility is decided from it
 * @returns {Prisma.EventWhereInput} An admin sees every event; otherwise public events plus those the user is invited to or organizes.
 */
export const buildVisibilityFilter = (
  userId: UserId,
  role: UserRole,
): Prisma.EventWhereInput =>
  isAdminRole(role)
    ? {}
    : {
        OR: [
          { isPublic: true },
          { invitations: { some: { userId } } },
          { organizerId: userId },
        ],
      }
