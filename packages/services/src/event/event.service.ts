import type { prisma } from '@iut-intranet/db'
import type { UserRole } from '@iut-intranet/db/enums'
import { AppError } from '@iut-intranet/helpers/errors'
import type { EventId, UserId } from '@iut-intranet/helpers/schemas/brand'
import type {
  CreateEventInput,
  ListVisibleEventsInput,
  UpdateEventInput,
} from '@iut-intranet/helpers/schemas/event'
import { isAdminRole } from '@iut-intranet/helpers/utils/role'

import {
  buildCalendarWindowFilter,
  buildVisibilityFilter,
  eventListInclude,
} from '@/event/event.query'

/**
 * The user attempting to manage an event. Event management is decided per
 * resource (organizer or admin), so the service needs both the id and the role
 * — passed explicitly rather than re-fetched.
 */
interface EventManager {
  id: UserId
  role: UserRole
}

export class EventService {
  constructor(private prisma: prisma) {}

  /**
   * Creates an event organized by the given user, connected to one or more departments.
   * @param {CreateEventInput} payload - Event details and target department codes
   * @param {UserId} userId - Id of the organizing user
   * @returns The created event
   * @remarks The endAt > startAt invariant is enforced by the input schema at the tRPC boundary, so it isn't re-checked here. Department codes are resolved via Prisma's `connect` on the unique `code`.
   */
  public async createEvent(payload: CreateEventInput, userId: UserId) {
    return this.prisma.event.create({
      data: {
        departments: {
          connect: payload.departmentCodes.map((code) => ({ code })),
        },
        description: payload.description ?? '',
        endAt: payload.endAt,
        isPublic: payload.isPublic,
        location: payload.location,
        organizer: { connect: { id: userId } },
        startAt: payload.startAt,
        title: payload.title,
      },
    })
  }

  /**
   * Deletes an event the manager may manage (its organizer or an admin).
   * @param {EventId} eventId - Id of the event to delete
   * @param {EventManager} manager - The acting user's id and role
   * @returns The deleted event
   * @throws {AppError} FORBIDDEN if the manager may not manage the event
   */
  public async deleteEvent(eventId: EventId, manager: EventManager) {
    await this.assertManageable(eventId, manager)
    return this.prisma.event.delete({
      where: { id: eventId },
    })
  }

  /**
   * Lists events overlapping the requested calendar window and visible to the manager.
   * @param {ListVisibleEventsInput} payload - Calendar window bounds (from/to); unbounded means no window filter
   * @param {EventManager} manager - The acting user's id and role
   * @returns The visible events with their department and organizer, ordered by start date
   * @remarks An admin sees all; others see public events plus those they are invited to or organize.
   */
  public async listVisible(
    payload: ListVisibleEventsInput,
    manager: EventManager,
  ) {
    return this.prisma.event.findMany({
      include: eventListInclude,
      orderBy: { startAt: 'asc' },
      where: {
        ...buildCalendarWindowFilter(payload.from, payload.to),
        ...buildVisibilityFilter(manager.id, manager.role),
      },
    })
  }

  /**
   * Updates an event the manager may manage (its organizer or an admin), optionally replacing its set of departments.
   * @param {UpdateEventInput} payload - Fields to update, including the event id and an optional list of department codes
   * @param {EventManager} manager - The acting user's id and role
   * @returns The updated event
   * @throws {AppError} FORBIDDEN if the manager may not manage the event
   * @remarks When `departmentCodes` is provided it fully replaces the event's departments (`set`, not a merge); omitting it leaves them untouched.
   */
  public async updateEvent(payload: UpdateEventInput, manager: EventManager) {
    const { departmentCodes, id, ...data } = payload
    await this.assertManageable(id, manager)
    return this.prisma.event.update({
      data: {
        ...data,
        ...(departmentCodes && {
          departments: { set: departmentCodes.map((code) => ({ code })) },
        }),
      },
      where: { id },
    })
  }

  /**
   * Ensures the user may manage (update/delete) the event: only its organizer or an admin can.
   * @param {EventId} eventId - Id of the event to check
   * @param {EventManager} manager - The acting user's id and role
   * @returns The event (id + organizerId), when it is manageable by the caller
   * @throws {AppError} FORBIDDEN otherwise (mapped to a tRPC error)
   */
  private async assertManageable(eventId: EventId, manager: EventManager) {
    const event = await this.getById(eventId)
    if (event.organizerId !== manager.id && !isAdminRole(manager.role)) {
      throw new AppError(
        'FORBIDDEN',
        'You are not allowed to manage this event',
      )
    }
    return event
  }

  /**
   * Fetches the ownership-relevant fields of an event by id.
   * @param {EventId} eventId - Id of the event to fetch
   * @returns The event's id and organizerId
   * @throws Throws NOT_FOUND if it doesn't exist
   * @remarks Internal: used by {@link assertManageable} to resolve the organizer before update/delete, so it projects only what the ownership check reads (no relations).
   */
  private async getById(eventId: EventId) {
    return this.prisma.event.findUniqueOrThrow({
      select: { id: true, organizerId: true },
      where: { id: eventId },
    })
  }
}
