import type { TRPC_ERROR_CODE_KEY } from '@trpc/server'

export class AppError extends Error {
  constructor(
    public readonly code: TRPC_ERROR_CODE_KEY,
    message: string,
  ) {
    super(code)
    this.message = message
    this.name = 'AppError'
  }
}
