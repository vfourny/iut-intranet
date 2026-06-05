import { listHighlightProcedure } from '@/modules/highlight/procedures/list-highlight.procedure'
import { uploadHighlightProcedure } from '@/modules/highlight/procedures/upload-highlight.procedure'
import { router } from '@/trpc'

export const highlightRouter = router({
  list: listHighlightProcedure,
  upload: uploadHighlightProcedure,
})
