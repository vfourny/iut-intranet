import type { DepartmentCode,NewsStatus } from '@iut-intranet/db/enums'
import type {
  CreateNewsInput,
  UpdateNewsInput,
} from '@iut-intranet/helpers/schemas/news'
import type { TrpcOutput } from '@iut-intranet/trpc'
import type { UseQueryReturn } from '@pinia/colada'
import { useMutation, useQuery, useQueryCache } from '@pinia/colada'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'

import { trpc } from '@/lib/trpc'
import type { QueryKey } from '@/types/api.type'

// Forme « news » du front, dérivée de la sortie tRPC plutôt que d'un schéma de
// sortie dédié. Deux champs sont raffinés : `content`, que Prisma stocke en JSON
// (typé `JsonValue`, union récursive) mais que l'éditeur PrimeVue sérialise
// toujours en HTML (`string`) ; et `publishedAt`, recoercé en `Date`.
// On réécrit ces clés via un type mappé conditionnel plutôt qu'un `Omit & {…}` :
// la branche `content` renvoie `string` sans jamais évaluer la `JsonValue`
// récursive d'origine, ce qui évite une instanciation explosive (TS2589).
type RawNews = TrpcOutput['news']['getById']
export type News = {
  [K in keyof RawNews]: K extends 'content'
    ? string
    : K extends 'publishedAt'
      ? Date | null
      : RawNews[K]
}
export type NewsList = News[]

// Sans transformer tRPC, les dates transitent en ISO string : on recoerce
// `publishedAt` en `Date` pour honorer le type renvoyé par le serveur.
const coerceNews = (news: RawNews): News => ({
  ...news,
  content: news.content as unknown as string,
  publishedAt: news.publishedAt ? new Date(news.publishedAt) : null,
})

export const NEWS_PAGE_SIZE = 12

export const NEWS_KEYS = {
  all: () => ['news', 'all'] as const,
  getById: (newsId: string) => ['news', newsId] as const,
  visibleList: (
    status: NewsStatus,
    page: number,
    search: string,
    departmentCodes: string[],
  ) => ['news', 'visible', { departmentCodes, page, search, status }] as const,
} as const satisfies QueryKey<'news'>

export const useCreateNews = () => {
  const queryCache = useQueryCache()
  return useMutation({
    mutation: async (data: CreateNewsInput): Promise<News> => {
      const result = await trpc.news.create.mutate(data)
      return coerceNews(result)
    },
    onSuccess() {
      queryCache.invalidateQueries({ key: ['news'] })
    },
  })
}

export interface VisibleNewsPage {
  items: NewsList
  total: number
}

export const useVisibleNews = (
  status: NewsStatus,
  page: MaybeRefOrGetter<number>,
  search: MaybeRefOrGetter<string>,
  departmentCodes: MaybeRefOrGetter<string[]>,
  pageSize: number = NEWS_PAGE_SIZE,
): UseQueryReturn<VisibleNewsPage> => {
  return useQuery({
    key: () =>
      NEWS_KEYS.visibleList(
        status,
        toValue(page),
        toValue(search),
        toValue(departmentCodes),
      ),
    placeholderData: (previous) => previous,
    query: async (): Promise<VisibleNewsPage> => {
      const result = await trpc.news.listVisible.query({
        departmentCodes: toValue(departmentCodes) as DepartmentCode[],
        page: toValue(page),
        pageSize,
        search: toValue(search).trim() || undefined,
        status,
      })
      return {
        items: result.items.map(coerceNews),
        total: result.total,
      }
    },
    staleTime: 30_000,
  })
}

export const useUpdateNews = () => {
  const queryCache = useQueryCache()
  return useMutation({
    mutation: async (data: UpdateNewsInput): Promise<News> => {
      const result = await trpc.news.update.mutate(data)
      return coerceNews(result)
    },
    onSuccess() {
      queryCache.invalidateQueries({ key: ['news'] })
    },
  })
}

export const useNewsId = (
  newsId: MaybeRefOrGetter<string | null>,
): UseQueryReturn<News> => {
  return useQuery({
    enabled: () => !!toValue(newsId),
    key: () => NEWS_KEYS.getById(toValue(newsId) ?? ''),
    query: async (): Promise<News> => {
      const id = toValue(newsId)
      if (!id) throw new Error('newsId is required')
      const result = await trpc.news.getById.query({ newsId: id })
      return coerceNews(result)
    },
  })
}
