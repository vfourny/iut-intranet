import type {
  SignInWithPasswordInput,
  SignUpWithPasswordInput,
} from '@iut-intranet/helpers/schemas/auth'
import { isAdminRole } from '@iut-intranet/helpers/utils/role'
import {
  defineMutation,
  defineQuery,
  toCacheKey,
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

const refetchSession = async (queryCache: ReturnType<typeof useQueryCache>) => {
  const session = await trpc.auth.getSession.query()
  queryCache.setQueryData(AUTH_KEYS.session(), session)
}

export const useSignIn = defineMutation(() => {
  const queryCache = useQueryCache()
  return useMutation({
    mutation: (input: SignInWithPasswordInput) =>
      trpc.auth.signInWithPassword.mutate(input),
    onSuccess: () => refetchSession(queryCache),
  })
})

export const useSignUp = defineMutation(() => {
  const queryCache = useQueryCache()
  return useMutation({
    mutation: (input: SignUpWithPasswordInput) =>
      trpc.auth.signUpWithPassword.mutate(input),
    onSuccess: () => refetchSession(queryCache),
  })
})

export const useSignOut = defineMutation(() => {
  const queryCache = useQueryCache()
  return useMutation({
    mutation: () => trpc.auth.signOut.mutate(),
    // À la déconnexion, on purge tout le cache (données utilisateur, listes…)
    // sauf l'entrée session, qu'on remet à null pour refléter l'état déconnecté.
    onSuccess: () => {
      const sessionKeyHash = toCacheKey(AUTH_KEYS.session())
      queryCache
        .getEntries()
        .filter((entry) => entry.keyHash !== sessionKeyHash)
        .forEach((entry) => queryCache.remove(entry))
      queryCache.setQueryData(AUTH_KEYS.session(), null)
    },
  })
})
