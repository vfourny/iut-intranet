import { createHttpLogger, createLogger } from '@iut-intranet/configs/logger'
import { getServerEnv } from '@iut-intranet/helpers/env'
import { appRouter } from '@iut-intranet/trpc'
import { createContext } from '@iut-intranet/trpc/context'
import { createExpressMiddleware } from '@trpc/server/adapters/express'
import cors from 'cors'
import express from 'express'
import cron from 'node-cron'

import { ArchiveArticlesJob } from '@/jobs/archive-articles.job'

const { API_PORT, PUBLIC_API_URL, PUBLIC_APP_URL } = getServerEnv(
  'API_PORT',
  'PUBLIC_API_URL',
  'PUBLIC_APP_URL',
  'CRON_SECRET',
)

const app = express()
const logger = createLogger('logger cron')

app.use(createHttpLogger())

app.use(
  cors({
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    origin: [PUBLIC_APP_URL],
  }),
)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use(
  '/api/trpc',
  createExpressMiddleware({
    createContext,
    maxBodySize: 5 * 1024 * 1024,
    router: appRouter,
  }),
)

cron.schedule(
  '0 2 * * *',
  async () => {
    try {
      await ArchiveArticlesJob(logger)
    } catch (error) {
      logger.error(error, 'Error during archive articles job:')
    }
  },
  {
    timezone: 'Europe/Paris',
  },
)

app.listen(API_PORT, () => {
  console.log(`Server is running on ${PUBLIC_API_URL}`)
})
