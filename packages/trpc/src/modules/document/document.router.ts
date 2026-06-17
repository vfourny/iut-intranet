import { deleteDocumentProcedure } from '@/modules/document/procedures/delete-document.procedure'
import { listDocumentProcedure } from '@/modules/document/procedures/list-document.procedure'
import { uploadDocumentProcedure } from '@/modules/document/procedures/upload-document.procedure'
import { router } from '@/trpc'

export const documentRouter = router({
  delete: deleteDocumentProcedure,
  list: listDocumentProcedure,
  upload: uploadDocumentProcedure,
})
