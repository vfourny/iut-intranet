import { prisma } from '@/client'
import type { Prisma } from '@/generated/client'
import { DepartmentCode, Status } from '@/generated/enums'
import {
  fakeEventDescription,
  fakeEventLocation,
  fakeEventTitle,
} from '@/seeds/faker'
import { ADMIN, EDITOR, USER } from '@/seeds/user.seed'

interface EventInviteeSeed {
  email: string
  status: Status
}

interface EventSeed {
  departmentCode: DepartmentCode
  endDayOffset?: number
  endHour: number
  endMinute?: number
  id: string
  invitees: EventInviteeSeed[]
  isPublic: boolean
  organizerEmail: string
  startDayOffset: number
  startHour: number
  startMinute?: number
}

const EVENTS: EventSeed[] = [
  {
    departmentCode: DepartmentCode.INFO,
    endHour: 11,
    id: 'evt-soutenances-info',
    invitees: [
      { email: USER.email, status: Status.ACCEPTED },
      { email: EDITOR.email, status: Status.PENDING },
    ],
    isPublic: true,
    organizerEmail: ADMIN.email,
    startDayOffset: 0,
    startHour: 9,
  },
  {
    departmentCode: DepartmentCode.GACO,
    endHour: 16,
    id: 'evt-rentree-gaco',
    invitees: [
      { email: EDITOR.email, status: Status.ACCEPTED },
      { email: ADMIN.email, status: Status.PENDING },
    ],
    isPublic: true,
    organizerEmail: USER.email,
    startDayOffset: 0,
    startHour: 14,
  },
  {
    departmentCode: DepartmentCode.TC,
    endHour: 17,
    id: 'evt-visite-tc',
    invitees: [{ email: ADMIN.email, status: Status.DECLINED }],
    isPublic: true,
    organizerEmail: EDITOR.email,
    startDayOffset: 1,
    startHour: 13,
  },
  {
    departmentCode: DepartmentCode.INFO,
    endHour: 12,
    id: 'evt-conseil-pedago',
    invitees: [
      { email: USER.email, status: Status.ACCEPTED },
      { email: EDITOR.email, status: Status.ACCEPTED },
    ],
    isPublic: false,
    organizerEmail: ADMIN.email,
    startDayOffset: 2,
    startHour: 9,
  },
  {
    departmentCode: DepartmentCode.INFO,
    endHour: 17,
    id: 'evt-jpo',
    invitees: [],
    isPublic: true,
    organizerEmail: ADMIN.email,
    startDayOffset: 3,
    startHour: 9,
  },
  {
    departmentCode: DepartmentCode.GACO,
    endDayOffset: 5,
    endHour: 18,
    id: 'evt-salon-gaco',
    invitees: [{ email: EDITOR.email, status: Status.PENDING }],
    isPublic: true,
    organizerEmail: USER.email,
    startDayOffset: 4,
    startHour: 9,
  },
  {
    departmentCode: DepartmentCode.TC,
    endHour: 11,
    endMinute: 30,
    id: 'evt-challenge-vente',
    invitees: [{ email: ADMIN.email, status: Status.ACCEPTED }],
    isPublic: true,
    organizerEmail: EDITOR.email,
    startDayOffset: 7,
    startHour: 9,
  },
  {
    departmentCode: DepartmentCode.GACO,
    endHour: 17,
    id: 'evt-soutenances-gaco',
    invitees: [
      { email: ADMIN.email, status: Status.DECLINED },
      { email: EDITOR.email, status: Status.ACCEPTED },
    ],
    isPublic: true,
    organizerEmail: USER.email,
    startDayOffset: 8,
    startHour: 14,
  },
  {
    departmentCode: DepartmentCode.INFO,
    endHour: 11,
    id: 'evt-reunion-direction',
    invitees: [
      { email: USER.email, status: Status.ACCEPTED },
      { email: EDITOR.email, status: Status.PENDING },
    ],
    isPublic: false,
    organizerEmail: ADMIN.email,
    startDayOffset: 9,
    startHour: 10,
  },
  {
    // Chevauche volontairement evt-reunion-direction (même créneau)
    departmentCode: DepartmentCode.INFO,
    endHour: 12,
    id: 'evt-comite-qualite',
    invitees: [{ email: USER.email, status: Status.PENDING }],
    isPublic: true,
    organizerEmail: ADMIN.email,
    startDayOffset: 9,
    startHour: 10,
  },
  {
    departmentCode: DepartmentCode.TC,
    endHour: 15,
    id: 'evt-projet-tutore',
    invitees: [
      { email: ADMIN.email, status: Status.ACCEPTED },
      { email: USER.email, status: Status.ACCEPTED },
    ],
    isPublic: true,
    organizerEmail: EDITOR.email,
    startDayOffset: 10,
    startHour: 13,
  },
  {
    departmentCode: DepartmentCode.INFO,
    endHour: 23,
    id: 'evt-fete-fin-annee',
    invitees: [
      { email: USER.email, status: Status.ACCEPTED },
      { email: EDITOR.email, status: Status.ACCEPTED },
    ],
    isPublic: true,
    organizerEmail: ADMIN.email,
    startDayOffset: 11,
    startHour: 18,
  },
]

const getMondayThisWeek = (): Date => {
  const now = new Date()
  const day = now.getDay()
  const diffToMonday = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setDate(now.getDate() + diffToMonday)
  monday.setHours(0, 0, 0, 0)
  return monday
}

const buildDate = (
  monday: Date,
  dayOffset: number,
  hour: number,
  minute: number,
): Date => {
  const date = new Date(monday)
  date.setDate(monday.getDate() + dayOffset)
  date.setHours(hour, minute, 0, 0)
  return date
}

export const seedEvents = async () => {
  const [departments, users] = await Promise.all([
    prisma.department.findMany(),
    prisma.user.findMany(),
  ])
  const departmentIdByCode = new Map(departments.map((d) => [d.code, d.id]))
  const userIdByEmail = new Map(users.map((u) => [u.email, u.id]))

  const monday = getMondayThisWeek()

  const eventsData: Prisma.EventCreateManyInput[] = EVENTS.map((event) => {
    const departmentId = departmentIdByCode.get(event.departmentCode)
    if (!departmentId) {
      throw new Error(
        `Department ${event.departmentCode} not found — run seedDepartments first`,
      )
    }
    const organizerId = userIdByEmail.get(event.organizerEmail)
    if (!organizerId) {
      throw new Error(
        `User ${event.organizerEmail} not found — run seedUsers first`,
      )
    }
    return {
      departmentId,
      description: fakeEventDescription(),
      endAt: buildDate(
        monday,
        event.endDayOffset ?? event.startDayOffset,
        event.endHour,
        event.endMinute ?? 0,
      ),
      id: event.id,
      isPublic: event.isPublic,
      location: fakeEventLocation(),
      organizerId,
      startAt: buildDate(
        monday,
        event.startDayOffset,
        event.startHour,
        event.startMinute ?? 0,
      ),
      titre: fakeEventTitle(),
    }
  })

  await prisma.event.createMany({
    data: eventsData,
    skipDuplicates: true,
  })

  const invitationsData: Prisma.EventInvitationCreateManyInput[] =
    EVENTS.flatMap((event) =>
      event.invitees.map((invitee) => {
        const userId = userIdByEmail.get(invitee.email)
        if (!userId) {
          throw new Error(
            `User ${invitee.email} not found — run seedUsers first`,
          )
        }
        return {
          eventId: event.id,
          id: `${event.id}-inv-${invitee.email.split('@')[0]}`,
          status: invitee.status,
          userId,
        }
      }),
    )

  if (invitationsData.length > 0) {
    await prisma.eventInvitation.createMany({
      data: invitationsData,
      skipDuplicates: true,
    })
  }
}
