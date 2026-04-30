import type { SignUpWithPasswordInput } from '@iut-intranet/helpers/types/auth'
import { useMutation } from '@pinia/colada'

import { trpc } from '@/lib/trpc'
import { useAuthStore } from '@/stores/auth.store'

export function useSignUp() {
  const authStore = useAuthStore()

  return useMutation({
    mutation: (input: SignUpWithPasswordInput) =>
      trpc.auth.signUpWithPassword.mutate(input),
    onSuccess: () => authStore.fetchSession(),
  })
}
