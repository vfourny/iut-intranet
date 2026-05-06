import { deleteUserProcedure } from '@/modules/user/procedures/delete-user.procedure'
import { getMeProcedure } from '@/modules/user/procedures/get-me.procedure'
import { getUserByIdProcedure } from '@/modules/user/procedures/get-user-by-id.procedure'
import { listUsersProcedure } from '@/modules/user/procedures/list-users.procedure'
import { updateUserProcedure } from '@/modules/user/procedures/update-user.procedure'
import { router } from '@/trpc'

export const userRouter = router({
  delete: deleteUserProcedure,
  getById: getUserByIdProcedure,
  getMe: getMeProcedure,
  list: listUsersProcedure,
  update: updateUserProcedure,
})
