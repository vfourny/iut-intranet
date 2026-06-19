import { DepartmentCode } from '@iut-intranet/db/enums'
import {
  signInWithPasswordInputSchema,
  signUpWithPasswordInputSchema,
} from '@iut-intranet/helpers/schemas/auth'
import { MIN_PASSWORD_LENGTH } from '@iut-intranet/helpers/schemas/common'

const validSignUp = {
  departmentCodes: [DepartmentCode.INFO],
  email: 'jane.doe@univ-littoral.fr',
  firstName: 'Jane',
  lastName: 'Doe',
  password: 'Password123!',
}

describe('signUpWithPasswordInputSchema', () => {
  it('should accept and normalise a valid payload', () => {
    const result = signUpWithPasswordInputSchema.parse(validSignUp)

    expect(result.email).toBe('jane.doe@univ-littoral.fr')
    expect(result.lastName).toBe('DOE')
    expect(result.departmentCodes).toEqual([DepartmentCode.INFO])
  })

  it('should reject a weak password', () => {
    expect(
      signUpWithPasswordInputSchema.safeParse({
        ...validSignUp,
        password: 'weak',
      }).success,
    ).toBe(false)
  })

  it('should reject an unknown department code', () => {
    expect(
      signUpWithPasswordInputSchema.safeParse({
        ...validSignUp,
        departmentCodes: ['UNKNOWN'],
      }).success,
    ).toBe(false)
  })
})

describe('signInWithPasswordInputSchema', () => {
  it('should accept valid credentials', () => {
    const result = signInWithPasswordInputSchema.parse({
      email: 'jane.doe@univ-littoral.fr',
      password: 'Password123!',
    })

    expect(result.email).toBe('jane.doe@univ-littoral.fr')
  })

  it('should keep an explicit rememberMe flag', () => {
    const result = signInWithPasswordInputSchema.parse({
      email: 'jane.doe@univ-littoral.fr',
      password: 'Password123!',
      rememberMe: true,
    })

    expect(result.rememberMe).toBe(true)
  })
})

describe('MIN_PASSWORD_LENGTH', () => {
  it('should be 8', () => {
    expect(MIN_PASSWORD_LENGTH).toBe(8)
  })
})
