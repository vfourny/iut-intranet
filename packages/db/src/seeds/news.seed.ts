import { prisma } from '@/client'
import type { Prisma } from '@/generated/client'
import { NewsStatus } from '@/generated/enums'
import { fakeNewsContent, fakeNewsTitle } from '@/seeds/faker'

interface NewsSeed {
  createdAtDayOffset: number
  createdAtHour: number
  publishedAtDay?: number
  publishedAtHour?: number
  status: NewsStatus
  withCover?: boolean
}

const NEWS: NewsSeed[] = [
  {
    createdAtDayOffset: -5,
    createdAtHour: 10,
    publishedAtDay: -5,
    publishedAtHour: 11,
    status: NewsStatus.PUBLISHED,
  },
  {
    createdAtDayOffset: 0,
    createdAtHour: 9,
    publishedAtDay: 0,
    publishedAtHour: 10,
    status: NewsStatus.PUBLISHED,
  },
  {
    createdAtDayOffset: 2,
    createdAtHour: 14,
    publishedAtDay: 4,
    publishedAtHour: 8,
    status: NewsStatus.SCHEDULED,
  },
  {
    createdAtDayOffset: 3,
    createdAtHour: 16,
    status: NewsStatus.DRAFT,
    withCover: false,
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
  minute: number = 0,
): Date => {
  const date = new Date(monday)
  date.setDate(monday.getDate() + dayOffset)
  date.setHours(hour, minute, 0, 0)
  return date
}

export const seedNews = async () => {
  const [departments, user] = await Promise.all([
    prisma.department.findMany(),
    prisma.user.findFirst(),
  ])

  if (!user) {
    throw new Error('Users do not exist — run seedUsers first')
  }
  if (departments.length === 0) {
    throw new Error('No departments found — run seedDepartments first')
  }
  await prisma.news.deleteMany()
  const monday = getMondayThisWeek()

  for (let i = 0; i < NEWS.length; i++) {
    const news = NEWS[i]
    const assignedDepartment = departments[i % departments.length]
    const createdAt = buildDate(
      monday,
      news.createdAtDayOffset,
      news.createdAtHour,
    )
    const publishedAt =
      news.publishedAtDay !== undefined && news.publishedAtHour !== undefined
        ? buildDate(monday, news.publishedAtDay, news.publishedAtHour)
        : null

    const data: Prisma.NewsUncheckedCreateInput = {
      authorId: user.id,
      content: fakeNewsContent(),
      createdAt,
      publishedAt,
      status: news.status,
      targetDepartments: {
        connect: { id: assignedDepartment.id },
      },
      title: fakeNewsTitle(),
    }

    const created = await prisma.news.create({ data })

    // Clé S3 déterministe alignée sur le runtime (`NewsService.create`) :
    // `news/<newsId>/cover.png`. Posée après coup car l'id (cuid) est généré par
    // Prisma à l'insert. `db:seed` n'écrit que la clé ; les octets sont poussés
    // séparément par `provider:seed`. Un re-seed cible le même objet (id stable).
    if (news.withCover !== false) {
      await prisma.news.update({
        data: { coverUrl: `news/${created.id}/cover.png` },
        where: { id: created.id },
      })
    }
  }
}
