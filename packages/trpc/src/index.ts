import type { inferRouterOutputs } from '@trpc/server'

import { authRouter } from '@/modules/auth/auth.router'
import { eventRouter } from '@/modules/event/event.router'
import { highlightRouter } from '@/modules/highlight/highlight.router'
import { newsRouter } from '@/modules/news/news.router'
import { userRouter } from '@/modules/user/user.router'
import { router } from '@/trpc'

export const appRouter = router({
  auth: authRouter,
  event: eventRouter,
  highlight: highlightRouter,
  news: newsRouter,
  user: userRouter,
})

export type AppRouter = typeof appRouter

export type TrpcOutput = inferRouterOutputs<AppRouter>
