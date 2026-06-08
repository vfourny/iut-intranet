import { prisma } from '@/client'
import type { Prisma } from '@/generated/client'
import { DepartmentCode, EventInvitationStatus } from '@/generated/enums'
import {
  fakeEventDescription,
  fakeEventLocation,
  fakeEventTitle,
} from '@/seeds/faker'
import { ADMIN, EDITOR, USER } from '@/seeds/user.seed'

interface EventInviteeSeed {
  email: string
  status: EventInvitationStatus
}

interface EventSeed {
  departmentCodes: DepartmentCode[]
  endDayOffset?: number
  endHour: number
  endMinute?: number
  invitees: EventInviteeSeed[]
  isPublic: boolean
  // Clé interne au seed pour relier les invitations à leur event. L'id réel est
  // un cuid généré par Prisma (`@default(cuid())`) : le forcer à une valeur
  // lisible violait `eventIdSchema` (z.cuid()) et cassait update/delete côté app.
  key: string
  organizerEmail: string
  startDayOffset: number
  startHour: number
  startMinute?: number
}

const EVENTS: EventSeed[] = [
  {
    departmentCodes: [DepartmentCode.INFO],
    endHour: 11,
    invitees: [
      { email: USER.email, status: EventInvitationStatus.ACCEPTED },
      { email: EDITOR.email, status: EventInvitationStatus.PENDING },
    ],
    isPublic: true,
    key: 'evt-soutenances-info',
    organizerEmail: ADMIN.email,
    startDayOffset: 0,
    startHour: 9,
  },
  {
    departmentCodes: [DepartmentCode.GACO],
    endHour: 16,
    invitees: [
      { email: EDITOR.email, status: EventInvitationStatus.ACCEPTED },
      { email: ADMIN.email, status: EventInvitationStatus.PENDING },
    ],
    isPublic: true,
    key: 'ia-presentation',
    organizerEmail: USER.email,
    startDayOffset: 0,
    startHour: 14,
  },
  {
    departmentCodes: [DepartmentCode.TC],
    endHour: 17,
    invitees: [{ email: ADMIN.email, status: EventInvitationStatus.DECLINED }],
    isPublic: true,
    key: 'evt-visite-tc',
    organizerEmail: EDITOR.email,
    startDayOffset: 1,
    startHour: 13,
  },
  {
    departmentCodes: [DepartmentCode.INFO],
    endHour: 12,
    invitees: [
      { email: USER.email, status: EventInvitationStatus.ACCEPTED },
      { email: EDITOR.email, status: EventInvitationStatus.ACCEPTED },
    ],
    isPublic: false,
    key: 'evt-conseil-pedago',
    organizerEmail: ADMIN.email,
    startDayOffset: 2,
    startHour: 9,
  },
  {
    // JPO : concerne tous les départements du site → plusieurs codes.
    departmentCodes: [
      DepartmentCode.INFO,
      DepartmentCode.GACO,
      DepartmentCode.TC,
    ],
    endHour: 17,
    invitees: [],
    isPublic: true,
    key: 'evt-jpo',
    organizerEmail: ADMIN.email,
    startDayOffset: 3,
    startHour: 9,
  },
  {
    departmentCodes: [DepartmentCode.GACO],
    endDayOffset: 5,
    endHour: 18,
    invitees: [{ email: EDITOR.email, status: EventInvitationStatus.PENDING }],
    isPublic: true,
    key: 'evt-salon-gaco',
    organizerEmail: USER.email,
    startDayOffset: 4,
    startHour: 9,
  },
  {
    departmentCodes: [DepartmentCode.TC],
    endHour: 11,
    endMinute: 30,
    invitees: [{ email: ADMIN.email, status: EventInvitationStatus.ACCEPTED }],
    isPublic: true,
    key: 'evt-challenge-vente',
    organizerEmail: EDITOR.email,
    startDayOffset: 7,
    startHour: 9,
  },
  {
    departmentCodes: [DepartmentCode.GACO],
    endHour: 17,
    invitees: [
      { email: ADMIN.email, status: EventInvitationStatus.DECLINED },
      { email: EDITOR.email, status: EventInvitationStatus.ACCEPTED },
    ],
    isPublic: true,
    key: 'evt-soutenances-gaco',
    organizerEmail: USER.email,
    startDayOffset: 8,
    startHour: 14,
  },
  {
    departmentCodes: [DepartmentCode.INFO],
    endHour: 11,
    invitees: [
      { email: USER.email, status: EventInvitationStatus.ACCEPTED },
      { email: EDITOR.email, status: EventInvitationStatus.PENDING },
    ],
    isPublic: false,
    key: 'evt-reunion-direction',
    organizerEmail: ADMIN.email,
    startDayOffset: 9,
    startHour: 10,
  },
  {
    // Chevauche volontairement evt-reunion-direction (même créneau)
    departmentCodes: [DepartmentCode.INFO],
    endHour: 12,
    invitees: [{ email: USER.email, status: EventInvitationStatus.PENDING }],
    isPublic: true,
    key: 'evt-comite-qualite',
    organizerEmail: ADMIN.email,
    startDayOffset: 9,
    startHour: 10,
  },
  {
    departmentCodes: [DepartmentCode.TC],
    endHour: 15,
    invitees: [
      { email: ADMIN.email, status: EventInvitationStatus.ACCEPTED },
      { email: USER.email, status: EventInvitationStatus.ACCEPTED },
    ],
    isPublic: true,
    key: 'evt-projet-tutore',
    organizerEmail: EDITOR.email,
    startDayOffset: 10,
    startHour: 13,
  },
  {
    // Fête de fin d'année : inter-départements.
    departmentCodes: [DepartmentCode.INFO, DepartmentCode.GACO],
    endHour: 23,
    invitees: [
      { email: USER.email, status: EventInvitationStatus.ACCEPTED },
      { email: EDITOR.email, status: EventInvitationStatus.ACCEPTED },
    ],
    isPublic: true,
    key: 'evt-fete-fin-annee',
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
  const users = await prisma.user.findMany()
  const userIdByEmail = new Map(users.map((u) => [u.email, u.id]))

  const monday = getMondayThisWeek()

  // Un event cible un ou plusieurs départements : on les rattache par `connect`
  // sur le code (`@unique`), donc pas besoin de résoudre les ids au préalable.
  // On laisse Prisma générer l'id (cuid) et on capture le couple clé→id pour
  // relier ensuite les invitations (comme news.seed/user.seed).
  const createdEvents = await Promise.all(
    EVENTS.map(async (event) => {
      const organizerId = userIdByEmail.get(event.organizerEmail)
      if (!organizerId)
        throw new Error(`User ${event.organizerEmail} not found`)

      const created = await prisma.event.create({
        data: {
          departments: {
            connect: event.departmentCodes.map((code) => ({ code })),
          },
          description: fakeEventDescription(),
          endAt: buildDate(
            monday,
            event.endDayOffset ?? event.startDayOffset,
            event.endHour,
            event.endMinute ?? 0,
          ),
          isPublic: event.isPublic,
          location: fakeEventLocation(),
          organizerId,
          startAt: buildDate(
            monday,
            event.startDayOffset,
            event.startHour,
            event.startMinute ?? 0,
          ),
          title: fakeEventTitle(),
        },
        select: { id: true },
      })
      return [event.key, created.id] as const
    }),
  )
  const eventIdByKey = new Map(createdEvents)

  const invitationsData: Prisma.EventInvitationCreateManyInput[] =
    EVENTS.flatMap((event) =>
      event.invitees.map((invitee) => {
        const userId = userIdByEmail.get(invitee.email)
        if (!userId) {
          throw new Error(
            `User ${invitee.email} not found — run seedUsers first`,
          )
        }
        const eventId = eventIdByKey.get(event.key)
        if (!eventId) throw new Error(`Event ${event.key} not seeded`)
        return {
          eventId,
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
