import type { TrpcOutput } from '@iut-intranet/trpc'
import type { UseQueryReturn } from '@pinia/colada'
import { useMutation, useQuery, useQueryCache } from '@pinia/colada'

import { trpc } from '@/lib/trpc'
import type { QueryKey } from '@/types/api.type'

export type DocumentList = TrpcOutput['document']['list']
type UploadDocumentInput = Parameters<typeof trpc.document.upload.mutate>[0]

export const DOCUMENT_KEY = {
  all: () => ['document', 'all'] as const,
} as const satisfies QueryKey<'document'>

export const useUploadDocument = () => {
  const queryCache = useQueryCache()
  return useMutation({
    mutation: (data: UploadDocumentInput) => trpc.document.upload.mutate(data),
    onSuccess() {
      queryCache.invalidateQueries({ key: DOCUMENT_KEY.all() })
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

export const useDeleteDocument = () => {
  const queryCache = useQueryCache()
  return useMutation({
    mutation: (data: Parameters<typeof trpc.document.delete.mutate>[0]) =>
      trpc.document.delete.mutate(data),
    onSuccess() {
      queryCache.invalidateQueries({ key: DOCUMENT_KEY.all() })
    },
  })
}
