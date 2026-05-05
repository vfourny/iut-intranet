import { trpc } from '@/lib/trpc'

export async function getUsers(name?: string) {
  return trpc.user.getByName.query({ name })
}
