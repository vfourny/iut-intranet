import { common } from '@/langs/fr/common.lang'
import { enums } from '@/langs/fr/enums.lang'
import { auth } from '@/langs/fr/features/auth.lang'
import { document } from '@/langs/fr/features/document.lang'
import { event } from '@/langs/fr/features/event.lang'
import { home } from '@/langs/fr/features/home.lang'
import { news } from '@/langs/fr/features/news.lang'
import { profil } from '@/langs/fr/features/profil.lang'
import { user } from '@/langs/fr/features/user.lang'
import { layout } from '@/langs/fr/layout.lang'

export const fr = {
  auth,
  common,
  document,
  enums,
  event,
  home,
  layout,
  news,
  profil,
  user,
} as const

export type Messages = typeof fr
