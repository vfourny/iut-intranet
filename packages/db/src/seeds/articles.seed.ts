import { prisma } from '@/client'
import { ArticleStatus } from '@/generated/enums'
import {
  fakeArticleContent,
  fakeArticleExcerpt,
  fakeArticleTitle,
  fakeCoverUrl,
} from '@/seeds/faker'

interface ArticleSeed {
  createdAtDayOffset: number
  createdAtHour: number
  publishedAtDay?: number
  publishedAtHour?: number
  status: ArticleStatus
  // Cas « article nu » (brouillon sans accroche ni visuel) — porte un sens
  // d'affichage, on le garde explicite plutôt que de le laisser à faker.
  withCover?: boolean
  withExcerpt?: boolean
}

const ARTICLES: ArticleSeed[] = [
  {
    createdAtDayOffset: -5,
    createdAtHour: 10,
    publishedAtDay: -5,
    publishedAtHour: 11,
    status: ArticleStatus.PUBLISHED,
  },
  {
    createdAtDayOffset: 0,
    createdAtHour: 9,
    publishedAtDay: 0,
    publishedAtHour: 10,
    status: ArticleStatus.PUBLISHED,
  },
  {
    createdAtDayOffset: 2,
    createdAtHour: 14,
    publishedAtDay: 4,
    publishedAtHour: 8,
    status: ArticleStatus.SCHEDULED,
  },
  {
    createdAtDayOffset: 3,
    createdAtHour: 16,
    status: ArticleStatus.DRAFT,
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

export const seedArticles = async () => {
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
  await prisma.article.deleteMany()
  const monday = getMondayThisWeek()

  for (let i = 0; i < ARTICLES.length; i++) {
    const article = ARTICLES[i]
    const assignedDepartment = departments[i % departments.length]
    const createdAt = buildDate(
      monday,
      article.createdAtDayOffset,
      article.createdAtHour,
    )
    const publishedAt =
      article.publishedAtDay !== undefined &&
      article.publishedAtHour !== undefined
        ? buildDate(monday, article.publishedAtDay, article.publishedAtHour)
        : null

    await prisma.article.create({
      data: {
        authorId: user.id,
        content: fakeArticleContent(),
        coverUrl: article.withCover === false ? null : fakeCoverUrl(),
        createdAt,
        excerpt: article.withExcerpt === false ? null : fakeArticleExcerpt(),
        publishedAt,
        status: article.status,
        targetDepartments: {
          connect: { id: assignedDepartment.id },
        },
        title: fakeArticleTitle(),
      },
    })
  }
}
