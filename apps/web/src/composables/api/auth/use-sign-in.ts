import type { SignInWithPasswordInput } from '@iut-intranet/helpers/types/auth'
import { useMutation } from '@pinia/colada'

import { trpc } from '@/lib/trpc'
import { useAuthStore } from '@/stores/auth.store'

export function useSignIn() {
  const authStore = useAuthStore()

  return useMutation({
    mutation: (input: SignInWithPasswordInput) =>
      trpc.auth.signInWithPassword.mutate(input),
    onSuccess: async () => await authStore.fetchSession(),
  })
}
