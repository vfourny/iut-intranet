import {
  formatPhoneForStorage,
  formatPhoneNational,
  isValidPhone,
  parsePhone,
} from '@/utils/phone.util'

describe('isValidPhone', () => {
  it('should return true for a valid FR number', () => {
    expect(isValidPhone('0612345678')).toBe(true)
  })

  it('should return false for garbage input', () => {
    expect(isValidPhone('abc')).toBe(false)
  })
})

describe('parsePhone', () => {
  it('should parse a valid FR number into structured parts', () => {
    expect(parsePhone('0612345678')).toEqual({
      e164: '+33612345678',
      international: '+33 6 12 34 56 78',
      national: '06 12 34 56 78',
    })
  })

  it('should return null when the input cannot be parsed', () => {
    expect(parsePhone('abc')).toBeNull()
  })
})

describe('formatPhoneForStorage', () => {
  it('should return the E.164 representation', () => {
    expect(formatPhoneForStorage('0612345678')).toBe('+33612345678')
  })

  it('should throw when the input is unparseable', () => {
    expect(() => formatPhoneForStorage('abc')).toThrow('Invalid phone number')
  })
})

describe('formatPhoneNational', () => {
  it('should format a national FR number with separators as you type', () => {
    expect(formatPhoneNational('0612345678')).toBe('06 12 34 56 78')
  })
})
