import { prisma } from '@/client'
import { DepartmentCode, Status } from '@/generated/enums'
import { ADMIN, EDITOR, USER } from '@/seeds/user.seed'

export const seedEvents = async () => {
  const [admin, user, editor] = await Promise.all(
    [ADMIN, USER, EDITOR].map(({ email }) =>
      prisma.user.findUniqueOrThrow({ where: { email } }),
    ),
  )
  const [info, gaco, tc] = await Promise.all(
    [DepartmentCode.INFO, DepartmentCode.GACO, DepartmentCode.TC].map((code) =>
      prisma.department.findUniqueOrThrow({ where: { code } }),
    ),
  )

  const events = [
    {
      department: info,
      endAt: new Date('2026-05-12T11:00:00'),
      invitees: [
        { status: Status.ACCEPTED, user: user },
        { status: Status.PENDING, user: editor },
      ],
      organizer: admin,
      startAt: new Date('2026-05-12T09:00:00'),
      titre: 'Soutenances de projets tuteurés INFO',
    },
    {
      department: gaco,
      endAt: new Date('2026-05-13T14:30:00'),
      invitees: [
        { status: Status.ACCEPTED, user: editor },
        { status: Status.PENDING, user: admin },
      ],
      organizer: user,
      startAt: new Date('2026-05-13T13:00:00'),
      titre: "Visite d'entreprise GACO",
    },
    {
      department: tc,
      endAt: new Date('2026-05-14T17:00:00'),
      invitees: [
        { status: Status.ACCEPTED, user: admin },
        { status: Status.PENDING, user: user },
      ],
      organizer: editor,
      startAt: new Date('2026-05-14T14:00:00'),
      titre: 'Challenge de la vente TC',
    },
  ]

  await Promise.all(
    events.map(({ department, endAt, invitees, organizer, startAt, titre }) =>
      prisma.event.create({
        data: {
          departmentId: department.id,
          description: '',
          endAt,
          invitations: {
            create: invitees.map(({ status, user }) => ({
              status,
              userId: user.id,
            })),
          },
          isPublic: true,
          location: '',
          organizerId: organizer.id,
          startAt,
          titre,
        },
      }),
    ),
  )
}
