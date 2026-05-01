import { z } from 'zod'

export const publicEnvSchema = z.object({
  PUBLIC_API_URL: z.string().url('PUBLIC_API_URL must be a valid URL'),
  PUBLIC_APP_URL: z.string().url('PUBLIC_APP_URL must be a valid URL'),
})

export const serverEnvSchema = publicEnvSchema.extend({
  API_PORT: z.coerce
    .number({ error: 'API_PORT must be a valid number' })
    .optional()
    .default(8000),
  APP_PORT: z.coerce
    .number({ error: 'APP_PORT must be a valid number' })
    .optional()
    .default(5173),
  BETTER_AUTH_SECRET: z.string().min(1, 'BETTER_AUTH_SECRET is required'),
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  EMAIL_FROM: z.string().email('EMAIL_FROM must be a valid email'),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .optional()
    .default('development'),
  RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY is required'),
})

export type PublicEnv = z.infer<typeof publicEnvSchema>
export type ServerEnv = z.infer<typeof serverEnvSchema>

export function getPublicEnv<K extends keyof PublicEnv>(...keys: K[]) {
  const mask = keys.reduce((acc, k) => ({ ...acc, [k]: true }), {})
  return publicEnvSchema.pick(mask).parse(process.env)
}

export function getServerEnv<K extends keyof ServerEnv>(...keys: K[]) {
  const mask = keys.reduce((acc, k) => ({ ...acc, [k]: true }), {})
  return serverEnvSchema.pick(mask).parse(process.env)
}
