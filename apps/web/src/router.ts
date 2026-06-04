import type { LocationQueryValue, RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'

import { useSession } from '@/api/auth.api'
import type { Layout } from '@/types/layout.type'

declare module 'vue-router' {
  interface RouteMeta {
    access?: 'authenticated' | 'guest'
    layout: Layout
  }
}

export const RouteNames = {
  auth: {
    signIn: 'auth.sign-in',
    signUp: 'auth.sign-up',
  },
  calendar: 'calendar',
  event: {
    create: 'event.create',
    update: 'event.update',
  },
  home: 'home',
  news: {
    news: 'news',
  },
  profil: {
    private: 'profil.private',
    public: 'profil.public',
  },
  users: 'users',
} as const

const HomePage = () => import('@/pages/home-page.vue')
const UserListPage = () => import('@/pages/user/user-list.vue')
const CalendarPage = () => import('@/pages/event/event-page.vue')
const NewsListPage = () => import('@/pages/news/news-list-page.vue')
const AddEventPage = () => import('@/pages/event/add-event-page.vue')
const ProfilPrivatePage = () => import('@/pages/profil/profil-page-private.vue')
const SignInPage = () => import('@/pages/auth/sign-in-page.vue')
const SignUpPage = () => import('@/pages/auth/sign-up-page.vue')

export const routes = [
  {
    children: [
      {
        component: HomePage,
        name: RouteNames.home,
        path: '',
      },
      {
        component: UserListPage,
        name: RouteNames.users,
        path: 'users',
      },
      {
        component: CalendarPage,
        name: RouteNames.calendar,
        path: 'calendar',
      },
      {
        children: [
          {
            component: NewsListPage,
            name: RouteNames.news.news,
            path: '',
          },
        ],
        path: 'actualites',
      },
      {
        children: [
          {
            component: AddEventPage,
            name: RouteNames.event.create,
            path: 'create',
          },
          {
            component: AddEventPage,
            name: RouteNames.event.update,
            path: ':id/update',
          },
        ],
        path: 'event',
      },
      {
        component: ProfilPrivatePage,
        name: RouteNames.profil.private,
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
      {
        component: SignUpPage,
        name: RouteNames.auth.signUp,
        path: 'sign-up',
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

// N'autorise qu'une redirection interne (chemin relatif), pour éviter un
// open-redirect via le query param `?redirect=`.
export const resolveRedirect = (
  redirect: LocationQueryValue | LocationQueryValue[] | undefined,
): string | undefined => {
  if (typeof redirect !== 'string') return undefined
  if (!redirect.startsWith('/') || redirect.startsWith('//')) return undefined
  return redirect
}

router.beforeEach(async (to) => {
  const { isAuthenticated, refresh } = useSession()
  await refresh()

  if (to.meta.access === 'authenticated' && !isAuthenticated.value)
    return { name: RouteNames.auth.signIn, query: { redirect: to.fullPath } }
  if (to.meta.access === 'guest' && isAuthenticated.value)
    return { name: RouteNames.home }

  return true
})
