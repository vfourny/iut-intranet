import type { Event, prisma } from '@iut-intranet/db'
import { UserRole } from '@iut-intranet/db'
import type { EventModel } from '@iut-intranet/db/models'

export class EventService {
  constructor(private prisma: prisma) {}

  public async getById(eventId: string): Promise<EventModel> {
    return this.prisma.event.findUniqueOrThrow({
      include: {
        department: true,
        invitations: true,
      },
      where: { id: eventId },
    })
  }

  public async getVisibleEventsForUser(userId: string): Promise<Event[]> {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
      },
    })
    if (!user) {
      throw new Error('User not exist')
    }
    if (user.role === UserRole.ADMIN || user.role === UserRole.EDITOR) {
      return this.list()
    }
    return this.prisma.event.findMany({
      where: {
        departmentId: user.departmentId,
      },
    })
  }

  public async list(): Promise<Event[]> {
    return this.prisma.event.findMany()
  }
}
