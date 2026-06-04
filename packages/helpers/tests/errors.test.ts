import { AppError } from '@/errors'

describe('AppError', () => {
  it('should expose the tRPC code, the message and its name', () => {
    const error = new AppError('FORBIDDEN', 'You are not allowed')

    expect(error).toBeInstanceOf(Error)
    expect(error.code).toBe('FORBIDDEN')
    expect(error.message).toBe('You are not allowed')
    expect(error.name).toBe('AppError')
  })
})
