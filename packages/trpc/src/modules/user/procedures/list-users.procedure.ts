import { adminProcedure } from '@/procedures'

export const listUsersProcedure = adminProcedure.query(async ({ ctx }) => {
  return ctx.services.user.list()
})
