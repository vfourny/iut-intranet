import { Prisma } from '@iut-intranet/db'
import { AppError } from '@iut-intranet/helpers/errors'
import { TRPCError } from '@trpc/server'

import { procedure } from '@/trpc'

export const errorMiddleware = procedure.use(async ({ ctx, next }) => {
  try {
    return await next()
  } catch (err) {
    if (err instanceof TRPCError) throw err

    if (err instanceof Prisma.PrismaClientValidationError)
      throw new TRPCError({
        cause: err,
        code: 'BAD_REQUEST',
        message: 'Bad request',
      })

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2025')
        throw new TRPCError({
          cause: err,
          code: 'NOT_FOUND',
          message: 'Resource not found',
        })
      if (err.code === 'P2002')
        throw new TRPCError({
          cause: err,
          code: 'CONFLICT',
          message: 'Already exists',
        })
      ctx.logger.error({ err, prismaCode: err.code }, 'Unhandled Prisma error')
      throw new TRPCError({ cause: err, code: 'INTERNAL_SERVER_ERROR' })
    }

    if (err instanceof AppError)
      throw new TRPCError({
        cause: err,
        code: err.code,
        message: err.message,
      })

    ctx.logger.error({ err }, 'Unhandled error in procedure')
    throw new TRPCError({ cause: err, code: 'INTERNAL_SERVER_ERROR' })
  }
})
