import { NAME_PATTERN_REGEX, PASSWORD_REGEX } from '@/utils/regex.util'

describe('NAME_PATTERN_REGEX', () => {
  it('should accept names with accents, spaces, hyphens and apostrophes', () => {
    expect(NAME_PATTERN_REGEX.test('Jean-François')).toBe(true)
    expect(NAME_PATTERN_REGEX.test("D'Artagnan")).toBe(true)
    expect(NAME_PATTERN_REGEX.test('Anne Marie')).toBe(true)
  })

  it('should reject digits, leading separators and empty strings', () => {
    expect(NAME_PATTERN_REGEX.test('John3')).toBe(false)
    expect(NAME_PATTERN_REGEX.test('-John')).toBe(false)
    expect(NAME_PATTERN_REGEX.test('')).toBe(false)
  })
})

describe('PASSWORD_REGEX', () => {
  it('should accept a strong password', () => {
    expect(PASSWORD_REGEX.test('Password123!')).toBe(true)
  })

  it('should reject when a character class is missing or it is too short', () => {
    expect(PASSWORD_REGEX.test('password123!')).toBe(false) // no uppercase
    expect(PASSWORD_REGEX.test('Password!')).toBe(false) // no digit
    expect(PASSWORD_REGEX.test('Pass1!')).toBe(false) // too short
  })
})
