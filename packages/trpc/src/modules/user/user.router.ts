import { createUserFromAdmin } from '@/modules/user/procedures/create-user-from-admin'
import { deleteUserProcedure } from '@/modules/user/procedures/delete-user.procedure'
import { getMeProcedure } from '@/modules/user/procedures/get-me.procedure'
import { getMeWithDepartmentProcedure } from '@/modules/user/procedures/get-me-with-department'
import { getUserByIdProcedure } from '@/modules/user/procedures/get-user-by-id.procedure'
import { listUsersProcedure } from '@/modules/user/procedures/list-users.procedure'
import { updateOwnUserProcedure } from '@/modules/user/procedures/update-own-user.procedure'
import { updateUserProcedure } from '@/modules/user/procedures/update-user.procedure'
import { uploadAvatarProcedure } from '@/modules/user/procedures/upload-avatar.procedure'
import { router } from '@/trpc'

export const userRouter = router({
  create: createUserFromAdmin,
  delete: deleteUserProcedure,
  getById: getUserByIdProcedure,
  getMe: getMeProcedure,
  getMeWithDepartment: getMeWithDepartmentProcedure,
  list: listUsersProcedure,
  update: updateUserProcedure,
  updateOwnUser: updateOwnUserProcedure,
  uploadAvatar: uploadAvatarProcedure,
})
