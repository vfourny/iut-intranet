import { UserRole } from '@iut-intranet/db/enums'

export const ADMIN_ROLES = [UserRole.ADMIN] as const satisfies UserRole[]

export const isAdminRole = (role: UserRole) =>
  ADMIN_ROLES.some((adminRole) => adminRole === role)
