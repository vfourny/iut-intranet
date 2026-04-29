import { createLogger } from '@iut-intranet/configs/logger'
import type { CreateExpressContextOptions } from '@trpc/server/adapters/express'

const logger = createLogger('trpc')

export const createContext = async ({
  req,
  res,
}: CreateExpressContextOptions) => {
  return {
    logger,
    req,
    res,
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>
