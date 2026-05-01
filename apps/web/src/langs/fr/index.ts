import { auth } from '@/langs/fr/auth.lang'
import { department } from '@/langs/fr/department.lang'
import { home } from '@/langs/fr/home.lang'
import { layout } from '@/langs/fr/layout.lang'

export const fr = {
  auth,
  department,
  home,
  layout,
} as const

export type FrMessages = typeof fr
