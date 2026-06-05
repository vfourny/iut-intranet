import { UserRole } from '@iut-intranet/db/enums'

import { isAdminRole, isAtLeastRole, isEditorRole } from '@/utils/role.util'

describe('isAdminRole', () => {
  it('should be true only for ADMIN', () => {
    expect(isAdminRole(UserRole.ADMIN)).toBe(true)
    expect(isAdminRole(UserRole.EDITOR)).toBe(false)
    expect(isAdminRole(UserRole.USER)).toBe(false)
  })
})

describe('isEditorRole', () => {
  it('should be true for ADMIN and EDITOR', () => {
    expect(isEditorRole(UserRole.ADMIN)).toBe(true)
    expect(isEditorRole(UserRole.EDITOR)).toBe(true)
    expect(isEditorRole(UserRole.USER)).toBe(false)
  })
})

describe('isAtLeastRole', () => {
  it('should always allow the USER threshold', () => {
    expect(isAtLeastRole(UserRole.USER, UserRole.USER)).toBe(true)
    expect(isAtLeastRole(UserRole.ADMIN, UserRole.USER)).toBe(true)
  })

  it('should gate the EDITOR threshold to editors and admins', () => {
    expect(isAtLeastRole(UserRole.EDITOR, UserRole.EDITOR)).toBe(true)
    expect(isAtLeastRole(UserRole.ADMIN, UserRole.EDITOR)).toBe(true)
    expect(isAtLeastRole(UserRole.USER, UserRole.EDITOR)).toBe(false)
  })

  it('should gate the ADMIN threshold to admins only', () => {
    expect(isAtLeastRole(UserRole.ADMIN, UserRole.ADMIN)).toBe(true)
    expect(isAtLeastRole(UserRole.EDITOR, UserRole.ADMIN)).toBe(false)
  })
})
