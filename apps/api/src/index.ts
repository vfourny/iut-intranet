import { createHttpLogger } from '@iut-intranet/configs/logger'
import { getServerEnv } from '@iut-intranet/helpers/env'
import { appRouter } from '@iut-intranet/trpc'
import { createContext } from '@iut-intranet/trpc/context'
import { createExpressMiddleware } from '@trpc/server/adapters/express'
import cors from 'cors'
import express from 'express'

const { API_PORT, PUBLIC_API_URL, PUBLIC_APP_URL } = getServerEnv(
  'API_PORT',
  'PUBLIC_API_URL',
  'PUBLIC_APP_URL',
)

const app = express()

app.use(createHttpLogger())

app.use(
  cors({
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    origin: [PUBLIC_APP_URL],
  }),
)

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use(
  '/trpc',
  createExpressMiddleware({
    createContext,
    router: appRouter,
  }),
)

app.listen(API_PORT, () => {
  console.log(`Server is running on ${PUBLIC_API_URL}`)
})
