import { betterAuthInstance } from '@iut-intranet/auth'
import { prisma } from '@iut-intranet/db'

import { AuthService } from '@/auth.service'
import { DepartmentService } from '@/department.service'
import { DocumentService } from '@/document.service'
import { EventService } from '@/event/event.service'
import { HighlightService } from '@/highlight.service'
import { NewsService } from '@/news/news.service'
import { UserService } from '@/user/user.service'

const userService = new UserService(prisma, betterAuthInstance)
const departmentService = new DepartmentService(prisma)
const eventService = new EventService(prisma)
const newsService = new NewsService(prisma, userService)
const highlightService = new HighlightService()
const documentService = new DocumentService()
const authService = new AuthService(
  betterAuthInstance,
  userService,
  departmentService,
)

export {
  authService,
  departmentService,
  documentService,
  eventService,
  highlightService,
  newsService,
  userService,
}
export type {
  AuthService,
  DepartmentService,
  DocumentService,
  EventService,
  HighlightService,
  NewsService,
  UserService,
}
