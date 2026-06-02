import { uploadAvatarInputSchema } from '@iut-intranet/helpers/schemas/storage'

import { authenticatedProcedure } from '@/procedures'

export const uploadAvatarProcedure = authenticatedProcedure
  .input(uploadAvatarInputSchema)
  .mutation(({ ctx, input }) => {
    return ctx.services.user.uploadAvatar(input, ctx.user.id)
  })
