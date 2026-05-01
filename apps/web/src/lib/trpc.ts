import type { AppRouter } from '@iut-intranet/trpc'
import { createTRPCClient, httpBatchLink } from '@trpc/client'

export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      fetch: (url, options) =>
        fetch(url, { ...options, credentials: 'include' }),
      url: `${import.meta.env.PUBLIC_API_URL}/trpc`,
    }),
  ],
})
