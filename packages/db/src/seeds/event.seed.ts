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
      invitees: [
        { status: Status.ACCEPTED, user: user },
        { status: Status.PENDING, user: editor },
      ],
      organizer: admin,
      titre: 'Soutenances de projets tuteurés INFO',
    },
    {
      department: gaco,
      invitees: [
        { status: Status.ACCEPTED, user: editor },
        { status: Status.PENDING, user: admin },
      ],
      organizer: user,
      titre: 'Visite d’entreprise GACO',
    },
    {
      department: tc,
      invitees: [
        { status: Status.ACCEPTED, user: admin },
        { status: Status.PENDING, user: user },
      ],
      organizer: editor,
      titre: 'Challenge de la vente TC',
    },
  ]

  await Promise.all(
    events.map(({ department, invitees, organizer, titre }) =>
      prisma.event.create({
        data: {
          departmentId: department.id,
          description: '',
          endAt: new Date(),
          invitations: {
            create: invitees.map(({ status, user }) => ({
              status,
              userId: user.id,
            })),
          },
          isPublic: true,
          location: '',
          organizerId: organizer.id,
          startAt: new Date(),
          titre,
        },
      }),
    ),
  )
}
