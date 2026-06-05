import { uploadMyAvatarInputSchema } from '@iut-intranet/helpers/schemas/user'

import { authenticatedProcedure } from '@/procedures'

export const uploadMyAvatarProcedure = authenticatedProcedure
  .input(uploadMyAvatarInputSchema)
  .mutation(({ ctx, input }) => {
    return ctx.services.user.uploadAvatar(input, ctx.user.id)
  })
