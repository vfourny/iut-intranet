import type { createEventFormulaireInput } from '@iut-intranet/helpers/types/event'
import { useMutation, useQuery } from '@pinia/colada'

import { trpc } from '@/lib/trpc'
import type { QueryKey } from '@/types/api.type'

export const EVENT_KEYS = {
  visibleForUser: (userId: string) => ['event', 'visible', userId] as const,
} as const satisfies QueryKey<'event'>

export const useVisibleEvents = (userId: string) => {
  return useQuery({
    enabled: () => !!userId,
    key: () => EVENT_KEYS.visibleForUser(userId),
    query: () => trpc.event.listVisibleEventsForUser.query({ userId }),
  })
}

export const useCreateEvent = () => {
  return useMutation({
    mutation: (data: createEventFormulaireInput) =>
      trpc.event.createEvent.mutate(data),
  })
}
