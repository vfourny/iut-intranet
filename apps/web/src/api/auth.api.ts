import type {
  SignInWithPasswordInput,
  SignUpWithPasswordInput,
} from '@iut-intranet/helpers/types/auth'
import { isAdminRole } from '@iut-intranet/helpers/utils/role'
import {
  defineMutation,
  defineQuery,
  useMutation,
  useQuery,
  useQueryCache,
} from '@pinia/colada'
import { computed } from 'vue'

import { trpc } from '@/lib/trpc'
import type { QueryKey } from '@/types/api.type'

export const AUTH_KEYS = {
  session: () => ['auth', 'session'] as const,
} as const satisfies QueryKey<'auth'>

export const useSession = defineQuery(() => {
  const { data, ...rest } = useQuery({
    key: AUTH_KEYS.session(),
    query: () => trpc.auth.getSession.query(),
    staleTime: Infinity,
  })

  const currentSession = computed(() => data.value ?? null)
  const isAuthenticated = computed(() => !!currentSession.value)
  const isAdmin = computed(
    () => !!currentSession.value && isAdminRole(currentSession.value.user.role),
  )

  return {
    ...rest,
    currentSession,
    isAdmin,
    isAuthenticated,
  }
})

export const useSignIn = defineMutation(() => {
  const queryCache = useQueryCache()
  return useMutation({
    mutation: (input: SignInWithPasswordInput) =>
      trpc.auth.signInWithPassword.mutate(input),
    onSuccess: (session) =>
      queryCache.setQueryData(AUTH_KEYS.session(), session),
  })
})

export const useSignUp = defineMutation(() => {
  const queryCache = useQueryCache()
  return useMutation({
    mutation: (input: SignUpWithPasswordInput) =>
      trpc.auth.signUpWithPassword.mutate(input),
    onSuccess: (session) =>
      queryCache.setQueryData(AUTH_KEYS.session(), session),
  })
})

export const useSignOut = defineMutation(() => {
  const queryCache = useQueryCache()
  return useMutation({
    mutation: () => trpc.auth.signOut.mutate(),
    onSuccess: () => queryCache.setQueryData(AUTH_KEYS.session(), undefined),
  })
})
