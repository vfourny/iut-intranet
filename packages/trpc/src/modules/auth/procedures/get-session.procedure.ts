import { authenticatedProcedure } from '@/procedures'

export const getSessionProcedure = authenticatedProcedure.query(
  async ({ ctx }) => {
    const session = await ctx.services.auth.getSession(ctx.headers)

    if (!session) {
      throw new Error('No active session')
    }

    const { activeOrganization, user } = session
    const { email, firstName, id, lastName, role } = user
    return {
      activeOrganization,
      user: { email, firstName, id, lastName, role },
    }
  },
)
