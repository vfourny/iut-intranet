import type { prisma } from '@iut-intranet/db'
import type { Event } from '@iut-intranet/db'
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

  public async list(): Promise<Event[]> {
    return this.prisma.event.findMany()
  }
}
