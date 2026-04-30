import { z } from 'zod'

export const envSchema = z.object({
  // API
  API_PORT: z.coerce
    .number({ error: 'API_PORT must be a valid number' })
    .optional()
    .default(8000),
  API_URL: z.string().url('API_URL must be a valid URL'),

  // App (frontend)
  APP_PORT: z.coerce
    .number({ error: 'APP_PORT must be a valid number' })
    .optional()
    .default(5173),
  APP_URL: z.string().url('APP_URL must be a valid URL'),

  // Auth
  BETTER_AUTH_SECRET: z.string().min(1, 'BETTER_AUTH_SECRET is required'),

  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),

  // Node environment
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .optional()
    .default('development'),
})

export type Env = z.infer<typeof envSchema>

export function getEnv<K extends keyof Env>(...keys: K[]) {
  const mask = keys.reduce((acc, k) => ({ ...acc, [k]: true }), {})
  return envSchema.pick(mask).parse(process.env)
}
