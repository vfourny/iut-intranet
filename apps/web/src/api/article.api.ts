import { articleSchema } from '@iut-intranet/helpers/schemas/article'
import type {
  Article,
  ArticleList,
  createArticleInput,
  updateArticleInput,
} from '@iut-intranet/helpers/types/article'
import type { UseQueryReturn } from '@pinia/colada'
import { useMutation, useQuery, useQueryCache } from '@pinia/colada'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import z from 'zod'

import { trpc } from '@/lib/trpc'
import type { QueryKey } from '@/types/api.type'

export const ARTICLE_KEYS = {
  all: () => ['article', 'all'] as const,
  getById: (articleId: string) => ['article', articleId] as const,
  visibleForUser: (userId: string) => ['article', 'visible', userId] as const,
} as const satisfies QueryKey<'article'>

export const useCreateArticle = () => {
  const queryCache = useQueryCache()
  return useMutation({
    mutation: async (data: createArticleInput): Promise<Article> => {
      const result = await trpc.articles.createArticle.mutate(data)
      return articleSchema.parse(result)
    },
    onSuccess() {
      queryCache.invalidateQueries({ key: ['article'] })
    },
  })
}
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
      return z.array(articleSchema).parse(result)
    },
    staleTime: 30_000,
  })
}

export const useUpdateArticles = () => {
  const queryCache = useQueryCache()
  return useMutation({
    mutation: async (data: updateArticleInput): Promise<Article> => {
      const result = await trpc.articles.updateArticle.mutate(data)
      return articleSchema.parse(result)
    },
    onSuccess() {
      queryCache.invalidateQueries({ key: ['article'] })
    },
  })
}

export const useArticleId = (
  articleId: MaybeRefOrGetter<string | null>,
): UseQueryReturn<Article> => {
  return useQuery({
    enabled: () => !!toValue(articleId),
    key: () => ARTICLE_KEYS.getById(toValue(articleId) ?? ''),
    query: async (): Promise<Article> => {
      const id = toValue(articleId)
      if (!id) throw new Error('articleId is required')
      const result = await trpc.articles.getArticleById.query({ articleId: id })
      return articleSchema.parse(result)
    },
  })
}
