import type { DepartmentCode } from '@iut-intranet/db/enums'
import type { UseQueryReturn } from '@pinia/colada'
import { useQuery } from '@pinia/colada'

import { trpc } from '@/lib/trpc'
import type { QueryKey } from '@/types/api.type'

interface Article {
  author: {
    firstName: string
    lastName: string
  }
  coverUrl: string | null
  excerpt: string | null
  id: string
  publishedAt: string
  targetDepartments: {
    code: DepartmentCode
  }[]
  title: string
}

export type ArticleList = Article[]

export const ARTICLE_KEYS = {
  visibleForUser: (userId: string) => ['article', 'visible', userId] as const,
} as const satisfies QueryKey<'article'>

export const useVisibleArticles = (
  userId: string,
): UseQueryReturn<ArticleList> => {
  return useQuery({
    enabled: () => !!userId,
    key: () => ARTICLE_KEYS.visibleForUser(userId),
    query: async (): Promise<ArticleList> => {
      const result = await trpc.articles.listVisibleArticlesForUser.query({
        userId,
      })
      return result as ArticleList
    },
    staleTime: 30_000,
  }) as UseQueryReturn<ArticleList>
}
