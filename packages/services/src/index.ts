import { betterAuthInstance } from '@iut-intranet/auth'
import { prisma } from '@iut-intranet/db'

import { AuthService } from '@/auth.service'
import { DepartmentService } from '@/department.service'
import { EventService } from '@/event.service'
import { HighlightService } from '@/highlight.service'
import { NewsService } from '@/news.service'
import { UserService } from '@/user.service'

const userService = new UserService(prisma)
const departmentService = new DepartmentService(prisma)
const eventService = new EventService(prisma)
const newsService = new NewsService(prisma, userService)
const highlightService = new HighlightService()
const authService = new AuthService(
  betterAuthInstance,
  userService,
  departmentService,
)

export {
  authService,
  departmentService,
  eventService,
  highlightService,
  newsService,
  userService,
}
export type {
  AuthService,
  DepartmentService,
  EventService,
  HighlightService,
  NewsService,
  UserService,
}
