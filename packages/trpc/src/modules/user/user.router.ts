import { createUserProcedure } from '@/modules/user/procedures/create-user.procedure'
import { deleteUser } from '@/modules/user/procedures/delete-user-from-admin'
import { getMeProcedure } from '@/modules/user/procedures/get-me.procedure'
import { listUsersProcedure } from '@/modules/user/procedures/list-users.procedure'
import { updateMeProcedure } from '@/modules/user/procedures/update-me.procedure'
import { updateUserProcedure } from '@/modules/user/procedures/update-user.procedure'
import { updateUserFromAdmin } from '@/modules/user/procedures/update-user-from-admin'
import { uploadMyAvatarProcedure } from '@/modules/user/procedures/upload-my-avatar.procedure'
import { router } from '@/trpc'

export const userRouter = router({
  create: createUserProcedure,
  delete: deleteUser,
  getMe: getMeProcedure,
  list: listUsersProcedure,
  update: updateUserFromAdmin,
  updateMe: updateMeProcedure,
  updateUser: updateUserProcedure,
  uploadMyAvatar: uploadMyAvatarProcedure,
})
