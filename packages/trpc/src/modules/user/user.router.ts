import { createUserProcedure } from '@/modules/user/procedures/create-user.procedure'
import { deleteUser } from '@/modules/user/procedures/delete-user-from-admin.procedure'
import { getByIdProcedure } from '@/modules/user/procedures/get-by-id.procedure'
import { getMeProcedure } from '@/modules/user/procedures/get-me.procedure'
import { listUsersProcedure } from '@/modules/user/procedures/list-users.procedure'
import { updateMeProcedure } from '@/modules/user/procedures/update-me.procedure'
import { updatePasswordProcedure } from '@/modules/user/procedures/update-password.procedure'
import { updateUserProcedure } from '@/modules/user/procedures/update-user.procedure'
import { updateUserFromAdmin } from '@/modules/user/procedures/update-user-from-admin.procedure'
import { uploadMyAvatarProcedure } from '@/modules/user/procedures/upload-my-avatar.procedure'
import { router } from '@/trpc'

export const userRouter = router({
  create: createUserProcedure,
  delete: deleteUser,
  getById: getByIdProcedure,
  getMe: getMeProcedure,
  list: listUsersProcedure,
  update: updateUserFromAdmin,
  updateMe: updateMeProcedure,
  updatePassword: updatePasswordProcedure,
  updateUser: updateUserProcedure,
  uploadMyAvatar: uploadMyAvatarProcedure,
})
