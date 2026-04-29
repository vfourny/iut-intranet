import pino from 'pino'
import pinoHttp from 'pino-http'

export function createLogger(name: string) {
  return pino({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    name,
    transport:
      process.env.NODE_ENV !== 'production'
        ? {
            options: { colorize: true, translateTime: 'HH:MM:ss' },
            target: 'pino-pretty',
          }
        : undefined,
  })
}

export function createHttpLogger() {
  return pinoHttp({ logger: createLogger('http') })
}

export type Logger = ReturnType<typeof createLogger>
