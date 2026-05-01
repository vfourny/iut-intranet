import { fromNodeHeaders } from '@iut-intranet/auth'
import { createLogger } from '@iut-intranet/configs/logger'
import { authService, userService } from '@iut-intranet/services'
import type { CreateExpressContextOptions } from '@trpc/server/adapters/express'

const logger = createLogger('trpc')

const services = {
  auth: authService,
  user: userService,
} as const

export const createContext = async ({
  req,
  res,
}: CreateExpressContextOptions) => {
  const headers = fromNodeHeaders(req.headers)

  return {
    headers,
    logger: logger.child({ requestId: req.id }),
    req,
    res,
    services,
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>
