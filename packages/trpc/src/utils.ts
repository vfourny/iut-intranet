import type { Response } from 'express'

export const formatResponseHeaders = (res: Response, headers: Headers) => {
  headers.forEach((value, key) => {
    res.append(key, value)
  })
}
