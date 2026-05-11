import { useQuery } from '@pinia/colada'

import { trpc } from '@/lib/trpc'

export const useVisibleEvents = (userId: string) => {
  return useQuery({
    key: () => ['events', 'visible', userId],
    query: () => trpc.event.GetVisibleEventForUserProcedure.query({ userId }),
  })
}
