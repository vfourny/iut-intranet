import type { prisma } from '@iut-intranet/db'
import type { EventModel } from '@iut-intranet/db/models'
import type {
  createEventFormulaireInput,
  EventWithDepartment,
} from '@iut-intranet/helpers/types/event'
import { isAdminRole } from '@iut-intranet/helpers/utils/role'

export class EventService {
  constructor(private prisma: prisma) {}

  public async createEvent(event: createEventFormulaireInput) {
    if (event.endAt <= event.startAt) {
      throw new Error('Date error')
    }
    return this.prisma.event.create({
      data: {
        departmentId: event.departmentId,
        description: event.description ?? '',
        endAt: event.endAt,
        isPublic: event.isPublic,
        location: event.location,
        organizerId: event.organizerId,
        startAt: event.startAt,
        titre: event.titre,
      },
    })
  }

  public async getById(eventId: string): Promise<EventModel> {
    return this.prisma.event.findUniqueOrThrow({
      include: {
        department: true,
        invitations: true,
      },
      where: { id: eventId },
    })
  }

  public async getVisibleEventsForUser(
    userId: string,
  ): Promise<EventWithDepartment[]> {
    const user = await this.prisma.user.findFirstOrThrow({
      where: {
        id: userId,
      },
    })
    if (isAdminRole(user.role)) {
      return this.list()
    }
    return this.prisma.event.findMany({
      include: {
        department: true,
      },
      where: {
        OR: [
          {
            departmentId: user.departmentId,
            isPublic: true,
          },
          {
            invitations: {
              some: { userId },
            },
            isPublic: false,
          },
        ],
      },
    })
  }

  public async list(): Promise<EventWithDepartment[]> {
    return this.prisma.event.findMany({
      include: {
        department: true,
      },
    })
  }
}
