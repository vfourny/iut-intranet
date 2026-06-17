import type {
  CreateEventInput,
  UpdateEventInput,
} from '@iut-intranet/helpers/schemas/event'
import { useMutation, useQuery, useQueryCache } from '@pinia/colada'
import { type MaybeRefOrGetter, toValue } from 'vue'

import { trpc } from '@/lib/trpc'
import type { QueryKey } from '@/types/api.type'

export interface EventRange {
  from: Date
  to: Date
}

export const EVENT_KEYS = {
  visibleForUser: (userId: string) => ['event', 'visible', userId] as const,
} as const satisfies QueryKey<'event'>

export const useVisibleEvents = (
  userId: string,
  range: MaybeRefOrGetter<EventRange | null>,
) => {
  return useQuery({
    // On n'interroge qu'une fois la fenêtre visible connue (datesSet du calendrier).
    enabled: () => !!userId && !!toValue(range),
    // userId scope le cache (l'utilisateur est dérivé de la session côté API) ;
    // la fenêtre [from, to] scope le résultat et change à chaque navigation.
    key: () => {
      const current = toValue(range)
      return [
        ...EVENT_KEYS.visibleForUser(userId),
        current?.from.toISOString() ?? 'all',
        current?.to.toISOString() ?? 'all',
      ]
    },
    placeholderData: (previous) => previous,
    query: () => {
      const current = toValue(range)
      return trpc.event.listVisible.query(
        current ? { from: current.from, to: current.to } : {},
      )
    },
  })
}

export const useCreateEvent = () => {
  const queryCache = useQueryCache()
  return useMutation({
    mutation: (data: CreateEventInput) => trpc.event.create.mutate(data),
    onSettled: () =>
      queryCache.invalidateQueries({ key: ['event', 'visible'] }),
  })
}

export const useUpdateEvent = () => {
  const queryCache = useQueryCache()
  return useMutation({
    mutation: (data: UpdateEventInput) => trpc.event.update.mutate(data),
    onSettled: () =>
      queryCache.invalidateQueries({ key: ['event', 'visible'] }),
  })
}

export const useDeleteEvent = () => {
  const queryCache = useQueryCache()
  return useMutation({
    mutation: (data: { eventId: string }) => trpc.event.delete.mutate(data),
    onSettled: () => queryCache.invalidateQueries({ key: ['event'] }),
  })
}
