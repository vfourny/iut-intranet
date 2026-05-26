import { articleSchema } from '@iut-intranet/helpers/schemas/article'
import type {
  Article,
  ArticleList,
  createArticleInput,
  updateArticleInput,
} from '@iut-intranet/helpers/types/article'
import type { UseMutationReturn, UseQueryReturn } from '@pinia/colada'
import { useMutation, useQuery } from '@pinia/colada'
import z from 'zod'

import { trpc } from '@/lib/trpc'
import type { QueryKey } from '@/types/api.type'

export const ARTICLE_KEYS = {
  all: () => ['article', 'all'] as const,
  visibleForUser: (userId: string) => ['article', 'visible', userId] as const,
} as const satisfies QueryKey<'article'>

export const useAllArticles = (): UseQueryReturn<ArticleList> => {
  return useQuery({
    key: ARTICLE_KEYS.all,
    query: async (): Promise<ArticleList> => {
      const result = await trpc.articles.listArticle.query()
      return z.array(articleSchema).parse(result)
    },
  })
}

export const useCreateArticle = (): UseMutationReturn<
  Article,
  createArticleInput,
  Error
> => {
  return useMutation({
    mutation: async (data: createArticleInput): Promise<Article> => {
      const result = await trpc.articles.createArticle.mutate(data)
      return articleSchema.parse(result)
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

export const useUpdateArticles = (): UseMutationReturn<
  Article,
  updateArticleInput,
  Error
> => {
  return useMutation({
    mutation: async (data: updateArticleInput): Promise<Article> => {
      const result = await trpc.articles.updateArticle.mutate(data)
      return articleSchema.parse(result)
    },
  })
}
