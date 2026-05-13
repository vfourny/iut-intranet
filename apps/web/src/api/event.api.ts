import { useQuery } from '@pinia/colada'

import { trpc } from '@/lib/trpc'
import type { QueryKey } from '@/types/api.type'

export const EVENT_KEYS = {
  visibleForUser: (userId: string) => ['event', 'visible', userId] as const,
} as const satisfies QueryKey<'event'>

export const useVisibleEvents = (userId: string) => {
  return useQuery({
    enabled: () => !!userId,
    key: () => EVENT_KEYS.visibleForUser(userId),
    query: () => trpc.event.getVisibleEventsForUser.query({ userId }),
  })
}
