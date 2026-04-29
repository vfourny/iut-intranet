import type { betterAuthInstance } from '@/index'

export type BetterAuthInstance = typeof betterAuthInstance

export type AuthSession = Awaited<
  ReturnType<BetterAuthInstance['api']['getSession']>
>
