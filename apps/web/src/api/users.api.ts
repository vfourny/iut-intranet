import { useInfiniteQuery, useQuery } from '@pinia/colada'
import { type MaybeRefOrGetter, toValue } from 'vue'

import { trpc } from '@/lib/trpc'
import type { QueryKey } from '@/types/api.type'

export const USER_PAGE_SIZE = 10

export const USER_KEYS = {
  list: (page: number, pageSize: number, search: string) =>
    ['user', 'list', { page, pageSize, search }] as const,
  listInfinite: (pageSize: number, search: string) =>
    ['user', 'list', 'infinite', { pageSize, search }] as const,
} as const satisfies QueryKey<'user'>

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
