import type { UploadFileInput } from '@iut-intranet/helpers/schemas/storage'
import type { TrpcOutput } from '@iut-intranet/trpc'
import type { UseQueryReturn } from '@pinia/colada'
import { useMutation, useQuery, useQueryCache } from '@pinia/colada'

import { trpc } from '@/lib/trpc'
import type { QueryKey } from '@/types/api.type'

type HighlightList = TrpcOutput['highlight']['list']

export const HIGHLIGHT_KEYS = {
  all: () => ['highlight', 'all'] as const,
} as const satisfies QueryKey<'highlight'>

export const useUploadHighlightImage = () => {
  const queryCache = useQueryCache()
  return useMutation({
    mutation: (data: UploadFileInput) => trpc.highlight.upload.mutate(data),
    onSuccess() {
      queryCache.invalidateQueries({ key: ['highlight'] })
    },
  })
}

export const useHighlightImages = (): UseQueryReturn<HighlightList> => {
  return useQuery({
    key: () => HIGHLIGHT_KEYS.all(),
    query: async (): Promise<HighlightList> => {
      return await trpc.highlight.list.query()
    },
    staleTime: 30_000,
  })
}
