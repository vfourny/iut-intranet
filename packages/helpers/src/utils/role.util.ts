import { UserRole } from '@iut-intranet/db/enums'

/**
 * User roles considered administrators at the application level.
 */
export const ADMIN_ROLES = [UserRole.ADMIN] as const satisfies UserRole[]

/**
 * User roles allowed to edit content (administrators included).
 */
export const EDITOR_ROLES = [
  ...ADMIN_ROLES,
  UserRole.EDITOR,
] as const satisfies UserRole[]

/**
 * Whether a user role grants application-level admin privileges.
 * @param {UserRole} role - User role to test
 * @returns {boolean} `true` if `role` is one of {@link ADMIN_ROLES}
 */
export const isAdminRole = (role: UserRole) =>
  ADMIN_ROLES.some((adminRole) => adminRole === role)

/**
 * Whether a user role grants content-editing privileges.
 * @param {UserRole} role - User role to test
 * @returns {boolean} `true` if `role` is one of {@link EDITOR_ROLES}
 */
export const isEditorRole = (role: UserRole) =>
  EDITOR_ROLES.some((editorRole) => editorRole === role)

/**
 * Whether a user's role meets or exceeds a minimum required role.
 * @param {UserRole} userRole - The role held by the user
 * @param {UserRole} minimumRole - The minimum role required
 * @returns {boolean} `true` if `userRole >= minimumRole` in the role hierarchy (USER < EDITOR < ADMIN)
 */
export const isAtLeastRole = (
  userRole: UserRole,
  minimumRole: UserRole,
): boolean => {
  switch (minimumRole) {
    case UserRole.USER:
      return true
    case UserRole.EDITOR:
      return isEditorRole(userRole)
    case UserRole.ADMIN:
      return isAdminRole(userRole)
  }
}
