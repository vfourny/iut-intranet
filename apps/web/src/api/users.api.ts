import { useInfiniteQuery, useQuery } from '@pinia/colada'
import { type MaybeRefOrGetter, toValue } from 'vue'

import { trpc } from '@/lib/trpc'

export const USER_PAGE_SIZE = 10

export const USER_KEYS = {
  infinite: (pageSize: number, search: string) =>
    ['user', 'list', 'infinite', { pageSize, search }] as const,
  paginated: (page: number, pageSize: number, search: string) =>
    ['user', 'list', { page, pageSize, search }] as const,
}

const normalizeSearch = (value: string) => value.trim() || undefined

export const useUsersPaginated = (
  page: MaybeRefOrGetter<number>,
  search: MaybeRefOrGetter<string>,
  pageSize: number = USER_PAGE_SIZE,
) => {
  return useQuery({
    key: () => USER_KEYS.paginated(toValue(page), pageSize, toValue(search)),
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
    key: () => USER_KEYS.infinite(pageSize, toValue(search)),
    query: ({ pageParam }) =>
      trpc.user.list.query({
        page: pageParam,
        pageSize,
        search: normalizeSearch(toValue(search)),
      }),
    staleTime: 1000 * 60,
  })
}
