import type { RouteRecordRaw } from 'vue-router'
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
  directory: 'directory',
  home: 'home',
} as const

export const routes = [
  {
    meta: { access: 'authenticated', layout: 'default' },
    name: RouteNames.home,
    path: '/',
    redirect: '/directory',
  },
  {
    component: () => import('@/pages/home-page.vue'),
    meta: { access: 'authenticated', layout: 'default' },
    name: RouteNames.directory,
    path: '/directory',
  },
  {
    component: () => import('@/pages/event/event-page.vue'),
    meta: { access: 'authenticated', layout: 'default' },
    name: RouteNames.calendar,
    path: '/calendar',
  },
  {
    children: [
      {
        path: '',
        redirect: '/auth/sign-in',
      },
      {
        component: () => import('@/pages/auth/sign-in-page.vue'),
        name: RouteNames.auth.signIn,
        path: 'sign-in',
      },
      {
        component: () => import('@/pages/auth/sign-up-page.vue'),
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

router.beforeEach(async (to) => {
  const { isAuthenticated, refresh, status } = useSession()

  if (status.value === 'pending') await refresh()

  if (to.meta.access === 'authenticated' && !isAuthenticated.value)
    return { name: RouteNames.auth.signIn }
  if (to.meta.access === 'guest' && isAuthenticated.value)
    return { name: RouteNames.home }

  return true
})
