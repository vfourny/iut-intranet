import { initTRPC } from '@trpc/server'

import type { Context } from '@/context'

export const { middleware, procedure, router } = initTRPC
  .context<Context>()
  .create({
    errorFormatter({ shape }) {
      return {
        ...shape,
        data: {
          ...shape.data,
          procedure: shape.data.path,
        },
      }
    },
  })
