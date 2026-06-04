import {
  emailSchema,
  firstNameSchema,
  lastNameSchema,
  paginationSchema,
  phoneValueSchema,
  searchSchema,
} from '@/schemas/common.schema'

describe('firstNameSchema', () => {
  it('should trim a valid first name', () => {
    expect(firstNameSchema.parse('  Marie  ')).toBe('Marie')
  })

  it('should reject a name containing digits', () => {
    expect(firstNameSchema.safeParse('Marie3').success).toBe(false)
  })
})

describe('lastNameSchema', () => {
  it('should trim and uppercase the last name', () => {
    expect(lastNameSchema.parse('  dupont  ')).toBe('DUPONT')
  })
})

describe('emailSchema', () => {
  it('should trim and lowercase the email', () => {
    expect(emailSchema.parse('  John.DOE@Example.COM ')).toBe(
      'john.doe@example.com',
    )
  })

  it('should reject an invalid email', () => {
    expect(emailSchema.safeParse('not-an-email').success).toBe(false)
  })
})

describe('phoneValueSchema', () => {
  it('should transform a valid FR number to E.164', () => {
    expect(phoneValueSchema.parse('0612345678')).toBe('+33612345678')
  })

  it('should reject an invalid phone number', () => {
    expect(phoneValueSchema.safeParse('abc').success).toBe(false)
  })
})

describe('paginationSchema', () => {
  it('should apply the default page and pageSize', () => {
    expect(paginationSchema.parse({})).toEqual({ page: 1, pageSize: 10 })
  })

  it('should reject a pageSize above the maximum', () => {
    expect(paginationSchema.safeParse({ pageSize: 1000 }).success).toBe(false)
  })
})

describe('searchSchema', () => {
  it('should trim the search term', () => {
    expect(searchSchema.parse('  hello  ')).toBe('hello')
  })

  it('should allow undefined', () => {
    expect(searchSchema.parse(undefined)).toBeUndefined()
  })
})
