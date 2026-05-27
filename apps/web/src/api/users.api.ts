import type {
  getMeWithDepartmentInput,
  updateOwnProfileInput,
} from '@iut-intranet/helpers/types/user'
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryCache,
} from '@pinia/colada'
import { type MaybeRefOrGetter, toValue } from 'vue'

import { useSession } from '@/api/auth.api'
import { trpc } from '@/lib/trpc'
import type { QueryKey } from '@/types/api.type'

export const USER_PAGE_SIZE = 10

export const USER_KEYS = {
  list: (page: number, pageSize: number, search: string) =>
    ['user', 'list', { page, pageSize, search }] as const,
  listInfinite: (pageSize: number, search: string) =>
    ['user', 'list', 'infinite', { pageSize, search }] as const,
} as const satisfies QueryKey<'user'>

export const useMe = () => {
  const { currentSession } = useSession()

  return useQuery({
    enabled: () => !!currentSession.value?.user.id,
    key: () => ['user', 'me', currentSession.value?.user.id ?? null] as const,
    query: async () => {
      const data = await trpc.user.getMeWithDepartment.query()
      return data as getMeWithDepartmentInput
    },
    staleTime: 1000 * 60 * 5,
  })
}

const normalizeSearch = (value: string) => value.trim() || undefined

export const useUsersPaginated = (
  page: MaybeRefOrGetter<number>,
  search: MaybeRefOrGetter<string>,
  pageSize: number = USER_PAGE_SIZE,
) => {
  return useQuery({
    key: () => USER_KEYS.list(toValue(page), pageSize, toValue(search)),
    placeholderData: (previous) => previous,
    query: () =>
      trpc.user.list.query({
        page: toValue(page),
        pageSize,
        search: normalizeSearch(toValue(search)),
      }),
    staleTime: 1000 * 60,
  })
}

type UserListPage = Awaited<ReturnType<typeof trpc.user.list.query>>

export const useUsersInfinite = (
  search: MaybeRefOrGetter<string>,
  pageSize: number = USER_PAGE_SIZE,
) => {
  return useInfiniteQuery<UserListPage, Error, number>({
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((sum, p) => sum + p.items.length, 0)
      return loaded < lastPage.total ? allPages.length + 1 : null
    },
    initialPageParam: 1,
    key: () => USER_KEYS.listInfinite(pageSize, toValue(search)),
    query: ({ pageParam }) =>
      trpc.user.list.query({
        page: pageParam,
        pageSize,
        search: normalizeSearch(toValue(search)),
      }),
    staleTime: 1000 * 60,
  })
}

export const useUpdateOwnProfile = () => {
  const queryCache = useQueryCache()
  const { currentSession } = useSession()

  return useMutation({
    mutation: (input: Omit<updateOwnProfileInput, 'userId'>) =>
      trpc.user.updateOwnUser.mutate(input),
    onSuccess: () => {
      queryCache.invalidateQueries({ key: ['user', 'list'] })
      queryCache.invalidateQueries({
        key: ['user', 'me', currentSession.value?.user.id ?? null],
      })
    },
  })
}
