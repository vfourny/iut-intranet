import { createArticleProcedure } from '@/modules/article/procedures/create-article.procedure'
import { deleteArticleProcedure } from '@/modules/article/procedures/delete-article.procedure'
import { getArticleByIdProcedure } from '@/modules/article/procedures/get-article-by-id.procedure'
import { listArticleProcedure } from '@/modules/article/procedures/list-article.procedure'
import { listVisibleArticlesForUserProcedure } from '@/modules/article/procedures/list-visible-articles.procedure'
import { updateArticleProcedure } from '@/modules/article/procedures/update-article.procedure'
import { router } from '@/trpc'

export const articleRouter = router({
  createArticle: createArticleProcedure,
  deleteArticle: deleteArticleProcedure,
  getArticleById: getArticleByIdProcedure,
  listArticle: listArticleProcedure,
  listVisibleArticlesForUser: listVisibleArticlesForUserProcedure,
  updateArticle: updateArticleProcedure,
})
