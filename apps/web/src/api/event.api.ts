import type { createEventFormulaireInput } from '@iut-intranet/helpers/types/event'
import { useMutation, useQuery } from '@pinia/colada'

import { trpc } from '@/lib/trpc'

export const useVisibleEvents = (userId: string) => {
  return useQuery({
    enabled: () => !!userId,
    key: () => ['events', 'visible', userId],
    query: () => trpc.event.getVisibleEventForUserProcedure.query({ userId }),
  })
}

export const useCreateEvent = () => {
  return useMutation({
    mutation: (data: createEventFormulaireInput) =>
      trpc.event.createEvent.mutate(data),
  })
}
