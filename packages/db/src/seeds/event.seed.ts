import { prisma } from '@/client'
import type { Event } from '@/generated/client'
import { Site, Status } from '@/generated/enums'

const EVENTS: Event[] = [
  {
    description: '',
    endAt: new Date(),
    id: '1',
    isPublic: true,
    location: '',
    organizerId: '',
    site: Site.CALAIS,
    startAt: new Date(),
    titre: 'test1',
  },
  {
    description: '',
    endAt: new Date(),
    id: '2',
    isPublic: true,
    location: '',
    organizerId: '',
    site: Site.SAINT_OMER,
    startAt: new Date(),
    titre: 'test2',
  },
  {
    description: '',
    endAt: new Date(),
    id: '3',
    isPublic: true,
    location: '',
    organizerId: '',
    site: Site.BOULOGNE,
    startAt: new Date(),
    titre: 'test3',
  },
]

export const seedEvents = async () => {
  const users = await prisma.user.findMany({ take: 6 })
  const departments = await prisma.department.findMany()

  //seed events
  const createdEvents = await Promise.all(
    EVENTS.map((event, index) =>
      prisma.event.create({
        data: {
          ...event,
          organizerId: users[index].id,
        },
      }),
    ),
  )

  //seed events department
  await Promise.all(
    createdEvents.map((event, index) =>
      prisma.eventDepartment.create({
        data: {
          departmentId: departments[index].id,
          eventId: event.id,
        },
      }),
    ),
  )

  //seed events participant
  await Promise.all(
    createdEvents.flatMap((event, index) => [
      prisma.eventParticipant.create({
        data: {
          eventId: event.id,
          status: Status.ACCEPTED,
          userId: users[index].id,
        },
      }),
      prisma.eventParticipant.create({
        data: {
          eventId: event.id,
          status: Status.PENDING,
          userId: users[index + 3].id,
        },
      }),
    ]),
  )
}
