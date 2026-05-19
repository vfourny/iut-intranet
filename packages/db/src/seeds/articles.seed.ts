import { prisma } from '@/client'
import type { Prisma } from '@/generated/client'
import { ArticleStatus, DepartmentCode } from '@/generated/enums'

interface ArticleSeed {
  authorId: string
  content: Prisma.InputJsonValue
  coverUrl?: string
  createdAtDayOffset: number
  createdAtHour: number
  excerpt?: string
  publishedAtDay?: number
  publishedAtHour?: number
  status: ArticleStatus
  targetDepartments: DepartmentCode[]
  title: string
}

const ARTICLES: ArticleSeed[] = [
  {
    authorId: '',
    content: {
      blocks: [
        {
          data: { text: 'Bienvenue sur notre nouveau portail académique.' },
          type: 'paragraph',
        },
      ],
    },
    coverUrl: '',
    createdAtDayOffset: -5,
    createdAtHour: 10,
    excerpt: 'Mot de bienvenue de la direction pour l’ouverture du portail.',
    publishedAtDay: -5,
    publishedAtHour: 11,
    status: ArticleStatus.PUBLISHED,
    targetDepartments: [
      DepartmentCode.INFO,
      DepartmentCode.GACO,
      DepartmentCode.TC,
    ],
    title: 'Ouverture du nouveau portail de l’IUT',
  },
  {
    authorId: '',
    content: {
      blocks: [
        {
          data: {
            text: 'Les sujets de cette année porteront sur l’IA et le Web3.',
          },
          type: 'paragraph',
        },
      ],
    },
    createdAtDayOffset: 0,
    createdAtHour: 9,
    excerpt: 'Consignes importantes pour les soutenances de cette semaine.',
    publishedAtDay: 0,
    publishedAtHour: 10,
    status: ArticleStatus.PUBLISHED,
    targetDepartments: [DepartmentCode.INFO],
    title: 'Consignes pour les soutenances de projets INFO',
  },
  {
    authorId: '',
    content: {
      blocks: [
        {
          data: {
            text: 'Le salon étudiant approche à grands pas. Préparez vos badges !',
          },
          type: 'paragraph',
        },
      ],
    },
    createdAtDayOffset: 2,
    createdAtHour: 14,
    excerpt: 'Informations logistiques pour le stand GACO au parc des expos.',
    publishedAtDay: 4,
    publishedAtHour: 8,
    status: ArticleStatus.SCHEDULED,
    targetDepartments: [DepartmentCode.GACO],
    title: 'Organisation logistique : Salon étudiant',
  },
  {
    authorId: '',
    content: {
      blocks: [
        {
          data: {
            text: 'Brouillon d’article sur le futur tournoi de gestion...',
          },
          type: 'paragraph',
        },
      ],
    },
    createdAtDayOffset: 3,
    createdAtHour: 16,
    status: ArticleStatus.DRAFT,
    targetDepartments: [DepartmentCode.GACO, DepartmentCode.TC],
    title: 'Préparation du Tournoi de Gestion',
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
        content: article.content,
        coverUrl: article.coverUrl || null,
        createdAt,
        excerpt: article.excerpt || null,
        publishedAt,
        status: article.status,
        targetDepartments: {
          connect: { id: assignedDepartment.id },
        },
        title: article.title,
      },
    })
  }
}
