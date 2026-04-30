import { isAdminRole } from '@iut-intranet/helpers/utils/role'
import type { TrpcOutput } from '@iut-intranet/trpc'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import { trpc } from '@/lib/trpc'
import { RouteNames } from '@/router'

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()
  const session = ref<TrpcOutput['auth']['getSession'] | null>(null)
  const isLoading = ref(false)

  const isAdmin = computed(
    () => !!session.value && isAdminRole(session.value.user.role),
  )

  async function fetchSession() {
    isLoading.value = true
    try {
      session.value = await trpc.auth.getSession.query()
    } catch {
      session.value = null
    } finally {
      isLoading.value = false
    }
  }

  function signOut() {
    session.value = null
    router.push({ name: RouteNames.auth.signIn })
  }

  return { fetchSession, isAdmin, isLoading, session, signOut }
})
