import type { Prisma, prisma } from '@iut-intranet/db'
import type { UserRole } from '@iut-intranet/db/enums'
import { AppError } from '@iut-intranet/helpers/errors'
import type { UserId } from '@iut-intranet/helpers/schemas/brand'
import type {
  CreateEventInput,
  EventId,
  EventWithDepartment,
  ListVisibleEventsInput,
  UpdateEventInput,
} from '@iut-intranet/helpers/schemas/event'
import { isAdminRole } from '@iut-intranet/helpers/utils/role'

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
   * Creates an event organized by `userId`, connected to the given department.
   * The endAt > startAt invariant is enforced by the input schema at the tRPC
   * boundary, so it isn't re-checked here.
   */
  public async createEvent(payload: CreateEventInput, userId: UserId) {
    return this.prisma.event.create({
      data: {
        department: { connect: { code: payload.departmentCode } },
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
   * Deletes an event the manager may manage (its organizer or an admin). Throws
   * FORBIDDEN otherwise.
   */
  public async deleteEvent(eventId: EventId, manager: EventManager) {
    await this.assertManageable(eventId, manager)
    return this.prisma.event.delete({
      where: { id: eventId },
    })
  }

  /**
   * Fetches an event by id with its department and invitations. Throws
   * NOT_FOUND if it doesn't exist.
   */
  public async getById(eventId: EventId): Promise<EventWithDepartment> {
    return this.prisma.event.findUniqueOrThrow({
      include: {
        department: true,
        invitations: true,
      },
      where: { id: eventId },
    })
  }

  /**
   * Lists events overlapping the requested calendar window and visible to the
   * manager: an admin sees all, others see public events plus those they are
   * invited to or organize. Ordered by start date.
   */
  public async listVisible(
    payload: ListVisibleEventsInput,
    manager: EventManager,
  ) {
    // Fenêtre du calendrier : un event est retenu s'il chevauche [from, to]
    // (commence avant `to` et finit après `from`). Sans bornes, aucun filtre.
    const overlapsRange: Prisma.EventWhereInput =
      payload.from && payload.to
        ? { endAt: { gte: payload.from }, startAt: { lte: payload.to } }
        : {}

    // Visibilité : un admin voit tout ; sinon events publics, ceux où il est
    // invité, ou ceux qu'il organise.
    const visibleToUser: Prisma.EventWhereInput = isAdminRole(manager.role)
      ? {}
      : {
          OR: [
            { isPublic: true },
            { invitations: { some: { userId: manager.id } } },
            { organizerId: manager.id },
          ],
        }

    return this.prisma.event.findMany({
      include: {
        department: true,
        organizer: true,
      },
      orderBy: { startAt: 'asc' },
      where: { ...overlapsRange, ...visibleToUser },
    })
  }

  /**
   * Updates an event the manager may manage (its organizer or an admin),
   * optionally moving it to another department. Throws FORBIDDEN otherwise.
   */
  public async updateEvent(payload: UpdateEventInput, manager: EventManager) {
    const { departmentCode, id, ...data } = payload
    await this.assertManageable(id, manager)
    return this.prisma.event.update({
      data: {
        ...data,
        ...(departmentCode && {
          department: { connect: { code: departmentCode } },
        }),
      },
      where: { id },
    })
  }

  /**
   * Ensures the user may manage (update/delete) the event: only its organizer
   * or an admin can. Throws FORBIDDEN otherwise (mapped to a tRPC error).
   */
  private async assertManageable(eventId: EventId, manager: EventManager) {
    const event = await this.getById(eventId)
    if (event.organizerId !== manager.id && !isAdminRole(manager.role)) {
      throw new AppError('FORBIDDEN', 'You are not allowed to manage this event')
    }
    return event
  }
}
