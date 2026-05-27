import type {
  createEventFormulaireInput,
  updateEventFormulaireInput,
} from '@iut-intranet/helpers/types/event'
import { useMutation, useQuery, useQueryCache } from '@pinia/colada'

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

export const useUpdateEvent = () => {
  const queryCache = useQueryCache()
  return useMutation({
    mutation: (data: updateEventFormulaireInput) =>
      trpc.event.updateEvent.mutate(data),
    onSettled: () =>
      queryCache.invalidateQueries({ key: ['event', 'visible'] }),
  })
}

export const useGetEventById = (eventId: string | undefined) => {
  return useQuery({
    enabled: () => !!eventId,
    key: () => ['event', 'byId', eventId ?? ''] as const,
    query: () => trpc.event.getById.query({ eventId: eventId ?? '' }),
  })
}

export const useDeleteEvent = () => {
  const queryCache = useQueryCache()
  return useMutation({
    mutation: (data: { id: string }) => trpc.event.deleteEvent.mutate(data),
    onSettled: () => queryCache.invalidateQueries({ key: ['event'] }),
  })
}
