import { adminProcedure } from '@/procedures'

export const listUsersProcedure = adminProcedure.query(async ({ ctx }) => {
  const users = await ctx.services.user.list()
  return users.map((user) => {
    const { email, firstName, id, lastName, role } = user
    return { email, firstName, id, lastName, role }
  })
})
