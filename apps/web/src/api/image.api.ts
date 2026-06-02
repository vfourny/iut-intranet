import type { uploadImageInput } from '@iut-intranet/helpers/types/image'
import type { TrpcOutput } from '@iut-intranet/trpc'
import type { UseQueryReturn } from '@pinia/colada'
import { useMutation, useQuery, useQueryCache } from '@pinia/colada'

import { trpc } from '@/lib/trpc'
import type { QueryKey } from '@/types/api.type'

type ImageList = TrpcOutput['image']['list']

export const IMAGE_KEYS = {
  all: () => ['image', 'all'] as const,
} as const satisfies QueryKey<'image'>

export const useUploadImage = () => {
  const queryCache = useQueryCache()
  return useMutation({
    mutation: async (data: uploadImageInput) => {
      return await trpc.image.upload.mutate(data)
    },
    onSuccess() {
      queryCache.invalidateQueries({ key: ['image'] })
    },
  })
}

export const useImages = (): UseQueryReturn<ImageList> => {
  return useQuery({
    key: () => IMAGE_KEYS.all(),
    query: async (): Promise<ImageList> => {
      return await trpc.image.list.query()
    },
    staleTime: 30_000,
  })
}
