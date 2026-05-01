import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'

import SignInPage from '@/pages/auth/sign-in-page.vue'
import SignUpPage from '@/pages/auth/sign-up-page.vue'
import HomePage from '@/pages/home-page.vue'
import { useAuthStore } from '@/stores/auth.store'
import type { Layout } from '@/types/layout.type'

declare module 'vue-router' {
  interface RouteMeta {
    layout: Layout
    requiresAuth: boolean
  }
}

export const RouteNames = {
  auth: {
    signIn: 'auth.sign-in',
    signUp: 'auth.sign-up',
  },
  home: 'home',
} as const

export const routes = [
  {
    component: HomePage,
    meta: { layout: 'default', requiresAuth: true },
    name: RouteNames.home,
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
    meta: { layout: 'auth', requiresAuth: false },
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
  const authStore = useAuthStore()

  if (!authStore.session && !authStore.isLoading) {
    await authStore.fetchSession()
  }

  if (to.meta.requiresAuth && !authStore.session)
    return { name: RouteNames.auth.signIn }
  if (!to.meta.requiresAuth && authStore.session)
    return { name: RouteNames.home }

  return true
})
