import { auth } from '@/langs/fr/auth.lang'
import { home } from '@/langs/fr/home.lang'
import { layout } from '@/langs/fr/layout.lang'

export const fr = {
  auth,
  home,
  layout,
} as const

export type FrMessages = typeof fr
