import type { UploadFileInput } from '@iut-intranet/helpers/schemas/storage'
import type { TrpcOutput } from '@iut-intranet/trpc'
import type { UseQueryReturn } from '@pinia/colada'
import { useMutation, useQuery, useQueryCache } from '@pinia/colada'

import { trpc } from '@/lib/trpc'
import type { QueryKey } from '@/types/api.type'

type DocumentList = TrpcOutput['document']['list']

export const DOCUMENT_KEY = {
  all: () => ['document', 'all'] as const,
} as const satisfies QueryKey<'document'>

export const useUploadDocument = () => {
  const queryCache = useQueryCache()
  return useMutation({
    mutation: (data: UploadFileInput) => trpc.document.upload.mutate(data),
    onSuccess() {
      queryCache.invalidateQueries({ key: ['document'] })
    },
  })
}

export const useDocument = (): UseQueryReturn<DocumentList> => {
  return useQuery({
    key: () => DOCUMENT_KEY.all(),
    query: async (): Promise<DocumentList> => {
      return await trpc.document.list.query()
    },
    staleTime: 30_000,
  })
}
