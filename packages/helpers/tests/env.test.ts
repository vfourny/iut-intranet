import { getPublicEnv, getServerEnv } from '@/env'

describe('getPublicEnv', () => {
  beforeEach(() => {
    vi.stubEnv('PUBLIC_API_URL', 'http://localhost:8000/api')
    vi.stubEnv('PUBLIC_APP_URL', 'http://localhost:5173')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('should return only the requested keys, validated', () => {
    expect(getPublicEnv('PUBLIC_API_URL')).toEqual({
      PUBLIC_API_URL: 'http://localhost:8000/api',
    })
  })

  it('should throw when a requested key is not a valid URL', () => {
    vi.stubEnv('PUBLIC_API_URL', 'not-a-url')
    expect(() => getPublicEnv('PUBLIC_API_URL')).toThrow()
  })
})

describe('getServerEnv', () => {
  beforeEach(() => {
    vi.stubEnv('DATABASE_URL', 'postgresql://root:root@localhost:5432/db')
    vi.stubEnv('BETTER_AUTH_SECRET', 'a-secret')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('should validate and return the requested subset', () => {
    expect(getServerEnv('DATABASE_URL')).toEqual({
      DATABASE_URL: 'postgresql://root:root@localhost:5432/db',
    })
  })

  it('should coerce a provided API_PORT into a number', () => {
    vi.stubEnv('API_PORT', '3000')
    expect(getServerEnv('API_PORT')).toEqual({ API_PORT: 3000 })
  })

  it('should throw when a required key is empty', () => {
    vi.stubEnv('BETTER_AUTH_SECRET', '')
    expect(() => getServerEnv('BETTER_AUTH_SECRET')).toThrow()
  })
})
