import type { UploadFileInput } from '@iut-intranet/helpers/schemas/storage'
import type {
  CreateUserInput,
  UpdateMeInput,
} from '@iut-intranet/helpers/schemas/user'
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
  list: (
    page: number,
    pageSize: number,
    search: string,
    department: string | undefined,
  ) => ['user', 'list', { department, page, pageSize, search }] as const,
  listInfinite: (
    pageSize: number,
    search: string,
    department: string | undefined,
  ) => ['user', 'list', 'infinite', { department, pageSize, search }] as const,
} as const satisfies QueryKey<'user'>

export type MeWithDepartment = Awaited<ReturnType<typeof trpc.user.getMe.query>>

export const useMe = () => {
  const { currentSession } = useSession()

  return useQuery({
    enabled: () => !!currentSession.value?.user.id,
    key: () => ['user', 'me', currentSession.value?.user.id ?? null] as const,
    query: () => trpc.user.getMe.query(),
    staleTime: 1000 * 60 * 5,
  })
}

const normalizeSearch = (value: string) => value.trim() || undefined

export const useUsersPaginated = (
  page: MaybeRefOrGetter<number>,
  search: MaybeRefOrGetter<string>,
  department: MaybeRefOrGetter<DepartmentCode | undefined>,
  pageSize: number = USER_PAGE_SIZE,
) => {
  return useQuery({
    key: () =>
      USER_KEYS.list(
        toValue(page),
        pageSize,
        toValue(search),
        toValue(department),
      ),
    placeholderData: (previous) => previous,
    query: () =>
      trpc.user.list.query({
        department: toValue(department) ?? undefined,
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
  department: MaybeRefOrGetter<DepartmentCode | undefined>,
  pageSize: number = USER_PAGE_SIZE,
) => {
  return useInfiniteQuery<UserListPage, Error, number>({
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((sum, p) => sum + p.items.length, 0)
      return loaded < lastPage.total ? allPages.length + 1 : null
    },
    initialPageParam: 1,
    key: () =>
      USER_KEYS.listInfinite(pageSize, toValue(search), toValue(department)),
    query: ({ pageParam }) =>
      trpc.user.list.query({
        department: toValue(department) ?? undefined,
        page: pageParam,
        pageSize,
        search: normalizeSearch(toValue(search)),
      }),
    staleTime: 1000 * 60,
  })
}

export const useUpdateMe = () => {
  const queryCache = useQueryCache()
  const { currentSession } = useSession()

  return useMutation({
    mutation: (input: Omit<UpdateMeInput, 'userId'>) =>
      trpc.user.updateMe.mutate(input),
    onSuccess: () => {
      queryCache.invalidateQueries({ key: ['user', 'list'] })
      queryCache.invalidateQueries({
        key: ['user', 'me', currentSession.value?.user.id ?? null],
      })
    },
  })
}

export const useCreateUser = () => {
  const queryCache = useQueryCache()

  return useMutation({
    mutation: (input: CreateUserInput) => trpc.user.create.mutate(input),
    onSuccess: () => {
      queryCache.invalidateQueries({ key: ['user', 'list'] })
    },
  })
}

export const useUploadMyAvatar = () => {
  const queryCache = useQueryCache()
  const { currentSession } = useSession()

  return useMutation({
    mutation: (input: UploadFileInput) =>
      trpc.user.uploadMyAvatar.mutate(input),
    onSuccess: () => {
      queryCache.invalidateQueries({ key: ['user', 'list'] })
      queryCache.invalidateQueries({
        key: ['user', 'me', currentSession.value?.user.id ?? null],
      })
      queryCache.invalidateQueries({ key: ['auth', 'session'] })
    },
  })
}

export const useCreateUser = () => {
  const queryCache = useQueryCache()
  return useMutation({
    mutation: (input: createUserFromAdminInput) =>
      trpc.user.create.mutate(input),
    onSuccess: () => {
      queryCache.invalidateQueries({
        key: ['user', 'list'],
      })
    },
  })
}
