import { useMutation } from '@pinia/colada'

import { trpc } from '@/lib/trpc'
import { useAuthStore } from '@/stores/auth.store'

export function useSignOut() {
  const authStore = useAuthStore()

  return useMutation({
    mutation: () => trpc.auth.signOut.mutate(),
    onSuccess: () => authStore.signOut(),
  })
}
