import { UserRole } from '@iut-intranet/db/enums'

import {
  jobTitleSchema,
  listUsersInputSchema,
  updateMeInputSchema,
  updateUserInputSchema,
} from '@/schemas/user.schema'

const USER_ID = 'cjld2cjxh0000qzrmn831i7rn'

describe('jobTitleSchema', () => {
  it('should trim a valid job title', () => {
    expect(jobTitleSchema.parse('  Enseignant  ')).toBe('Enseignant')
  })

  it('should reject an empty job title', () => {
    expect(jobTitleSchema.safeParse('').success).toBe(false)
  })
})

describe('updateUserInputSchema', () => {
  it('should require only the userId', () => {
    expect(updateUserInputSchema.parse({ userId: USER_ID })).toEqual({
      userId: USER_ID,
    })
  })

  it('should accept a partial update with a normalised last name', () => {
    const result = updateUserInputSchema.parse({
      lastName: 'martin',
      role: UserRole.EDITOR,
      userId: USER_ID,
    })

    expect(result.lastName).toBe('MARTIN')
    expect(result.role).toBe(UserRole.EDITOR)
  })

  it('should reject a payload without a userId', () => {
    expect(updateUserInputSchema.safeParse({ firstName: 'Jane' }).success).toBe(
      false,
    )
  })
})

describe('updateMeInputSchema', () => {
  it('should accept only jobTitle and phone', () => {
    const result = updateMeInputSchema.parse({
      jobTitle: 'Enseignant',
      phone: '0612345678',
    })

    expect(result.jobTitle).toBe('Enseignant')
    expect(result.phone).toBe('+33612345678')
  })

  it('should reject unknown keys (strict)', () => {
    expect(updateMeInputSchema.safeParse({ email: 'x@y.com' }).success).toBe(
      false,
    )
  })
})

describe('listUsersInputSchema', () => {
  it('should apply pagination defaults and trim the search term', () => {
    expect(listUsersInputSchema.parse({ search: '  jean  ' })).toEqual({
      page: 1,
      pageSize: 10,
      search: 'jean',
    })
  })
})
