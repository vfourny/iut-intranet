import type { prisma } from '@iut-intranet/db'
import type { Event } from '@iut-intranet/db'

export class EventService {
  constructor(private prisma: prisma) {}

  public async getById(id: string): Promise<Event | null> {
    return this.prisma.event.findUnique({
      include: {
        departments: true,
        participants: true,
      },
      where: { id },
    })
  }

  public async list(): Promise<Event[] | []> {
    return this.prisma.event.findMany()
  }
}
