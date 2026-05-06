import { useQuery } from '@pinia/colada'

import { trpc } from '@/lib/trpc'

export const USER_KEYS = {
  list: ['user', 'list'] as const,
}

export const useUsers = () => {
  return useQuery({
    key: USER_KEYS.list,
    query: () => trpc.user.list.query(),
    staleTime: 1000 * 60,
  })
}
