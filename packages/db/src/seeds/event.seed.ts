import { prisma } from '@/client'
import { DepartmentCode, Status } from '@/generated/enums'
import { ADMIN, EDITOR, USER } from '@/seeds/user.seed'

interface EventInviteeSeed {
  email: string
  status: Status
}

interface EventSeed {
  departmentCode: DepartmentCode
  description: string
  endDayOffset?: number
  endHour: number
  endMinute?: number
  id: string
  invitees: EventInviteeSeed[]
  isPublic: boolean
  location: string
  organizerEmail: string
  startDayOffset: number
  startHour: number
  startMinute?: number
  titre: string
}

const EVENTS: EventSeed[] = [
  {
    departmentCode: DepartmentCode.INFO,
    description: 'Soutenances finales devant le jury pédagogique.',
    endHour: 11,
    id: 'evt-soutenances-info',
    invitees: [
      { email: USER.email, status: Status.ACCEPTED },
      { email: EDITOR.email, status: Status.PENDING },
    ],
    isPublic: true,
    location: 'Amphi A',
    organizerEmail: ADMIN.email,
    startDayOffset: 0,
    startHour: 9,
    titre: 'Soutenances de projets tuteurés INFO',
  },
  {
    departmentCode: DepartmentCode.GACO,
    description: 'Réunion de rentrée du semestre.',
    endHour: 16,
    id: 'evt-rentree-gaco',
    invitees: [
      { email: EDITOR.email, status: Status.ACCEPTED },
      { email: ADMIN.email, status: Status.PENDING },
    ],
    isPublic: true,
    location: 'Salle 204',
    organizerEmail: USER.email,
    startDayOffset: 0,
    startHour: 14,
    titre: 'Réunion de rentrée GACO',
  },
  {
    departmentCode: DepartmentCode.TC,
    description: "Visite annuelle des locaux d'une entreprise partenaire.",
    endHour: 17,
    id: 'evt-visite-tc',
    invitees: [{ email: ADMIN.email, status: Status.DECLINED }],
    isPublic: true,
    location: 'Site partenaire — Calais',
    organizerEmail: EDITOR.email,
    startDayOffset: 1,
    startHour: 13,
    titre: "Visite d'entreprise TC",
  },
  {
    departmentCode: DepartmentCode.INFO,
    description: 'Conseil pédagogique trimestriel (huis clos).',
    endHour: 12,
    id: 'evt-conseil-pedago',
    invitees: [
      { email: USER.email, status: Status.ACCEPTED },
      { email: EDITOR.email, status: Status.ACCEPTED },
    ],
    isPublic: false,
    location: 'Salle de réunion direction',
    organizerEmail: ADMIN.email,
    startDayOffset: 2,
    startHour: 9,
    titre: 'Conseil pédagogique INFO',
  },
  {
    departmentCode: DepartmentCode.INFO,
    description: 'Journée portes ouvertes — accueil des futurs étudiants.',
    endHour: 17,
    id: 'evt-jpo',
    invitees: [],
    isPublic: true,
    location: 'Tout le campus',
    organizerEmail: ADMIN.email,
    startDayOffset: 3,
    startHour: 9,
    titre: 'Journée Portes Ouvertes',
  },
  {
    departmentCode: DepartmentCode.GACO,
    description: 'Salon étudiant sur deux jours — stand GACO.',
    endDayOffset: 5,
    endHour: 18,
    id: 'evt-salon-gaco',
    invitees: [{ email: EDITOR.email, status: Status.PENDING }],
    isPublic: true,
    location: 'Parc des expositions',
    organizerEmail: USER.email,
    startDayOffset: 4,
    startHour: 9,
    titre: 'Salon étudiant — stand GACO',
  },
  {
    departmentCode: DepartmentCode.TC,
    description: 'Compétition régionale de techniques de vente.',
    endHour: 11,
    endMinute: 30,
    id: 'evt-challenge-vente',
    invitees: [{ email: ADMIN.email, status: Status.ACCEPTED }],
    isPublic: true,
    location: 'Amphi B',
    organizerEmail: EDITOR.email,
    startDayOffset: 7,
    startHour: 9,
    titre: 'Challenge de la vente TC',
  },
  {
    departmentCode: DepartmentCode.GACO,
    description: 'Soutenances de stage de fin de cursus.',
    endHour: 17,
    id: 'evt-soutenances-gaco',
    invitees: [
      { email: ADMIN.email, status: Status.DECLINED },
      { email: EDITOR.email, status: Status.ACCEPTED },
    ],
    isPublic: true,
    location: 'Amphi A',
    organizerEmail: USER.email,
    startDayOffset: 8,
    startHour: 14,
    titre: 'Soutenances de stage GACO',
  },
  {
    departmentCode: DepartmentCode.INFO,
    description: 'Point hebdomadaire équipe de direction.',
    endHour: 11,
    id: 'evt-reunion-direction',
    invitees: [
      { email: USER.email, status: Status.ACCEPTED },
      { email: EDITOR.email, status: Status.PENDING },
    ],
    isPublic: false,
    location: 'Bureau direction',
    organizerEmail: ADMIN.email,
    startDayOffset: 9,
    startHour: 10,
    titre: 'Réunion de direction',
  },
  {
    departmentCode: DepartmentCode.INFO,
    description: 'Comité de suivi qualité — chevauche la réunion direction.',
    endHour: 12,
    id: 'evt-comite-qualite',
    invitees: [{ email: USER.email, status: Status.PENDING }],
    isPublic: true,
    location: 'Salle 101',
    organizerEmail: ADMIN.email,
    startDayOffset: 9,
    startHour: 10,
    titre: 'Comité qualité INFO',
  },
  {
    departmentCode: DepartmentCode.TC,
    description: 'Restitution intermédiaire des projets tuteurés.',
    endHour: 15,
    id: 'evt-projet-tutore',
    invitees: [
      { email: ADMIN.email, status: Status.ACCEPTED },
      { email: USER.email, status: Status.ACCEPTED },
    ],
    isPublic: true,
    location: 'Salle 303',
    organizerEmail: EDITOR.email,
    startDayOffset: 10,
    startHour: 13,
    titre: 'Restitution projets tuteurés TC',
  },
  {
    departmentCode: DepartmentCode.INFO,
    description: 'Soirée de fin d’année — tous départements bienvenus.',
    endHour: 23,
    id: 'evt-fete-fin-annee',
    invitees: [
      { email: USER.email, status: Status.ACCEPTED },
      { email: EDITOR.email, status: Status.ACCEPTED },
    ],
    isPublic: true,
    location: 'Foyer étudiant',
    organizerEmail: ADMIN.email,
    startDayOffset: 11,
    startHour: 18,
    titre: 'Fête de fin d’année',
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

  const eventsData = EVENTS.map((event) => {
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
      description: event.description,
      endAt: buildDate(
        monday,
        event.endDayOffset ?? event.startDayOffset,
        event.endHour,
        event.endMinute ?? 0,
      ),
      id: event.id,
      isPublic: event.isPublic,
      location: event.location,
      organizerId,
      startAt: buildDate(
        monday,
        event.startDayOffset,
        event.startHour,
        event.startMinute ?? 0,
      ),
      titre: event.titre,
    }
  })

  await prisma.event.createMany({
    data: eventsData,
    skipDuplicates: true,
  })

  const invitationsData = EVENTS.flatMap((event) =>
    event.invitees.map((invitee) => {
      const userId = userIdByEmail.get(invitee.email)
      if (!userId) {
        throw new Error(`User ${invitee.email} not found — run seedUsers first`)
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
