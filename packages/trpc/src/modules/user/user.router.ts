import { getMeProcedure } from '@/modules/user/procedures/get-me.procedure'
import { listUsersProcedure } from '@/modules/user/procedures/list-users.procedure'
import { updateMeProcedure } from '@/modules/user/procedures/update-me.procedure'
import { updateUserProcedure } from '@/modules/user/procedures/update-user.procedure'
import { uploadMyAvatarProcedure } from '@/modules/user/procedures/upload-my-avatar.procedure'
import { router } from '@/trpc'

export const userRouter = router({
  getMe: getMeProcedure,
  list: listUsersProcedure,
  updateMe: updateMeProcedure,
  updateUser: updateUserProcedure,
  uploadMyAvatar: uploadMyAvatarProcedure,
})
