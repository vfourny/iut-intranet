import { listDocumentProcedure } from '@/modules/document/procedures/list-document.procedure'
import { uploadDocumentProcedure } from '@/modules/document/procedures/upload-document.procedure'
import { router } from '@/trpc'

export const documentRouter = router({
  list: listDocumentProcedure,
  upload: uploadDocumentProcedure,
})
