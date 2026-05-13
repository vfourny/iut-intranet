import { useQuery } from '@pinia/colada'

import { trpc } from '@/lib/trpc'

export const useGetDepartments = () => {
  return useQuery({
    key: () => ['departments'],
    query: () => trpc.department.list.query(),
  })
}
