import { UserRole } from '@iut-intranet/db/enums'
import { ADMIN_ROLES } from '@iut-intranet/helpers/utils/role'
import { admin } from 'better-auth/plugins'
import { createAccessControl } from 'better-auth/plugins/access'
import {
  adminAc,
  defaultStatements as defaultUserStatements,
  userAc,
} from 'better-auth/plugins/admin/access'

const userStatement = {
  ...defaultUserStatements,
} as const

export const ac = createAccessControl(userStatement)

export const acUserRoles = {
  [UserRole.ADMIN]: ac.newRole({
    ...adminAc.statements,
  }),
  [UserRole.USER]: ac.newRole({
    ...userAc.statements,
  }),
}

export const adminPluginConfig = admin({
  ac,
  adminRoles: ADMIN_ROLES,
  defaultRole: UserRole.USER,
  roles: acUserRoles,
})
