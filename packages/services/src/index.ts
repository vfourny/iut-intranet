import { betterAuthInstance } from '@iut-intranet/auth'
import { prisma } from '@iut-intranet/db'

import { ArticleService } from '@/article.service'
import { AuthService } from '@/auth.service'
import { DepartmentService } from '@/department.service'
import { EventService } from '@/event.service'
import { ImageService } from '@/image.service'
import { UserService } from '@/user.service'

const userService = new UserService(betterAuthInstance, prisma)
const departmentService = new DepartmentService(prisma)
const eventService = new EventService(prisma)
const articleService = new ArticleService(prisma)
const imageService = new ImageService(prisma)
const authService = new AuthService(
  betterAuthInstance,
  userService,
  departmentService,
)

export {
  articleService,
  authService,
  departmentService,
  eventService,
  imageService,
  userService,
}
export type {
  ArticleService,
  AuthService,
  DepartmentService,
  EventService,
  ImageService,
  UserService,
}
