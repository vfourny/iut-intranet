import type { LocationQueryValue, RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'

import { useSession } from '@/api/auth.api'
import type { TranslationKey } from '@/composables/use-i18n'
import type { MessageSchema } from '@/plugins/i18n.plugin'
import type { Layout } from '@/types/layout.type'

declare module 'vue-router' {
  interface RouteMeta {
    access?: 'authenticated' | 'guest'
    layout?: Layout
    // Clés i18n de l'en-tête de page, rendues par `default-layout`.
    subtitle?: TranslationKey
    title?: TranslationKey
  }
}

export const RouteNames = {
  auth: {
    signIn: 'auth.sign-in',
  },
  calendar: 'calendar',
  document: 'document',
  home: 'home',
  news: 'news',
  profil: 'profil',
  users: 'users',
} as const

// Union de tous les noms de route « feuilles » (y compris imbriqués comme
// `auth.sign-in`), pour typer une cible de navigation sans `string` nu.
type RouteNameLeaves<T> = T extends string
  ? T
  : { [K in keyof T]: RouteNameLeaves<T[K]> }[keyof T]
export type RouteName = RouteNameLeaves<typeof RouteNames>

// Clés de la nav principale, calées sur les libellés i18n existants : ajouter
// une entrée `layout.default.nav.*` force à compléter `NAV_ITEMS` (exhaustif).
export type NavKey = keyof MessageSchema['layout']['default']['nav']

export interface NavItem {
  icon: string
  label: TranslationKey
  route: RouteName
}

// Source unique de la barre de navigation : libellé i18n, icône et route au
// même endroit. `header-bar` ne fait que projeter ça en `MenuItem` PrimeVue.
export const NAV_ITEMS = {
  calendar: {
    icon: 'pi pi-calendar',
    label: 'layout.default.nav.calendar',
    route: RouteNames.calendar,
  },
  directory: {
    icon: 'pi pi-users',
    label: 'layout.default.nav.directory',
    route: RouteNames.users,
  },
  document: {
    icon: 'pi pi-file-pdf',
    label: 'layout.default.nav.document',
    route: RouteNames.document,
  },
  home: {
    icon: 'pi pi-home',
    label: 'layout.default.nav.home',
    route: RouteNames.home,
  },
  news: {
    icon: 'pi pi-file',
    label: 'layout.default.nav.news',
    route: RouteNames.news,
  },
} as const satisfies Record<NavKey, NavItem>

export const NAV_ORDER: (keyof typeof NAV_ITEMS)[] = [
  'home',
  'directory',
  'calendar',
  'news',
]

const HomePage = () => import('@/pages/home-page.vue')
const UserListPage = () => import('@/pages/user-list-page.vue')
const CalendarPage = () => import('@/pages/event-page.vue')
const NewsListPage = () => import('@/pages/news-list-page.vue')
const ProfilPage = () => import('@/pages/profil-page.vue')
const SignInPage = () => import('@/pages/auth/sign-in-page.vue')
const DocumentPage = () => import('@/pages/document-page.vue')

export const routes = [
  {
    children: [
      {
        component: HomePage,
        meta: { title: 'layout.default.nav.home' },
        name: RouteNames.home,
        path: '',
      },
      {
        component: UserListPage,
        meta: { title: 'layout.default.nav.directory' },
        name: RouteNames.users,
        path: 'users',
      },
      {
        component: CalendarPage,
        meta: { title: 'layout.default.nav.calendar' },
        name: RouteNames.calendar,
        path: 'calendar',
      },
      {
        component: DocumentPage,
        meta: { title: 'layout.default.nav.document' },
        name: RouteNames.document,
        path: 'document',
      },
      {
        children: [
          {
            component: NewsListPage,
            meta: { title: 'layout.default.nav.news' },
            name: RouteNames.news,
            path: '',
          },
        ],
        path: 'actualites',
      },
      {
        component: ProfilPage,
        meta: { title: 'profil.title' },
        name: RouteNames.profil,
        path: 'profil',
      },
    ],
    meta: { access: 'authenticated', layout: 'default' },
    path: '/',
  },
  {
    children: [
      {
        path: '',
        redirect: '/auth/sign-in',
      },
      {
        component: SignInPage,
        name: RouteNames.auth.signIn,
        path: 'sign-in',
      },
    ],
    meta: { access: 'guest', layout: 'auth' },
    path: '/auth',
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
] as const satisfies RouteRecordRaw[]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

export const resolveRedirect = (
  redirect: LocationQueryValue | LocationQueryValue[] | undefined,
): string | undefined => {
  if (typeof redirect !== 'string') return undefined
  if (!redirect.startsWith('/') || redirect.startsWith('//')) return undefined
  return redirect
}

router.beforeEach(async (to) => {
  const { isAuthenticated, refresh, status } = useSession()

  if (status.value === 'pending') {
    await refresh()
  }

  if (to.meta.access === 'authenticated' && !isAuthenticated.value)
    return { name: RouteNames.auth.signIn, query: { redirect: to.fullPath } }
  if (to.meta.access === 'guest' && isAuthenticated.value)
    return { name: RouteNames.home }

  return true
})
