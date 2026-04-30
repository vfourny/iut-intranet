import { initTRPC } from '@trpc/server'

import type { AuthenticatedContext, Context } from '@/context'

export const { middleware, procedure, router } = initTRPC
  .context<Context>()
  .create({
    errorFormatter(opts) {
      const { error, shape } = opts
      const { code, httpStatus, path } = shape.data

      return {
        code,
        error,
        httpStatus,
        procedure: path,
        shape,
      }
    },
  })

export const { procedure: procedureWithSession } = initTRPC
  .context<AuthenticatedContext>()
  .create()
