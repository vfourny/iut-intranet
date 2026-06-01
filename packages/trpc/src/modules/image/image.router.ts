import { listImageProcedure } from '@/modules/image/procedure/list-image.procedure'
import { uploadImageProcedure } from '@/modules/image/procedure/upload-image.procedure'
import { router } from '@/trpc'

export const imageRouter = router({
  list: listImageProcedure,
  upload: uploadImageProcedure,
})
