import { createNewsProcedure } from '@/modules/news/procedures/create-news.procedure'
import { getNewsByIdProcedure } from '@/modules/news/procedures/get-news-by-id.procedure'
import { listVisibleNewsProcedure } from '@/modules/news/procedures/list-visible-news.procedure'
import { updateNewsProcedure } from '@/modules/news/procedures/update-news.procedure'
import { router } from '@/trpc'

export const newsRouter = router({
  create: createNewsProcedure,
  getById: getNewsByIdProcedure,
  listVisible: listVisibleNewsProcedure,
  update: updateNewsProcedure,
})
