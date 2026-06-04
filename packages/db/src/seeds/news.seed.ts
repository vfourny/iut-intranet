import { prisma } from '@/client'
import type { Prisma } from '@/generated/client'
import { NewsStatus } from '@/generated/enums'
import {
  fakeNewsContent,
  fakeNewsExcerpt,
  fakeNewsTitle,
} from '@/seeds/faker'

interface NewsSeed {
  createdAtDayOffset: number
  createdAtHour: number
  publishedAtDay?: number
  publishedAtHour?: number
  status: NewsStatus
  // Cas « news nu » (brouillon sans accroche ni visuel) — porte un sens
  // d'affichage, on le garde explicite plutôt que de le laisser à faker.
  withCover?: boolean
  withExcerpt?: boolean
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
    withExcerpt: false,
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
      news.publishedAtDay !== undefined &&
      news.publishedAtHour !== undefined
        ? buildDate(monday, news.publishedAtDay, news.publishedAtHour)
        : null

    const data: Prisma.NewsUncheckedCreateInput = {
      authorId: user.id,
      content: fakeNewsContent(),
      // Clé S3 déterministe (préfixe `covers`, pas de randomUUID pour qu'un
      // re-seed cible le même objet). `db:seed` n'écrit que la clé ; les octets
      // sont poussés séparément par `provider:seed`.
      coverUrl:
        news.withCover === false ? null : `covers/news-${i + 1}.jpg`,
      createdAt,
      excerpt: news.withExcerpt === false ? null : fakeNewsExcerpt(),
      publishedAt,
      status: news.status,
      targetDepartments: {
        connect: { id: assignedDepartment.id },
      },
      title: fakeNewsTitle(),
    }

    await prisma.news.create({ data })
  }
}
