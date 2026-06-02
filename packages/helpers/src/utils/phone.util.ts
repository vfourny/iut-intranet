import {
  AsYouType,
  type CountryCode,
  isValidPhoneNumber,
  parsePhoneNumberFromString,
} from 'libphonenumber-js'

const DEFAULT_COUNTRY: CountryCode = 'FR'

/**
 * Parsed representation of a phone number.
 */
export interface ParsedPhone {
  e164: string
  international: string
  national: string
}

/**
 * Validates a phone number string.
 * @param {string} value - Phone number, with or without an international prefix
 * @returns {boolean} `true` if the number is a valid phone number
 */
export const isValidPhone = (value: string) =>
  isValidPhoneNumber(value, DEFAULT_COUNTRY)

/**
 * Parses a phone number string into its structured parts.
 * @param {string} value - Phone number, with or without an international prefix
 * @returns {ParsedPhone | null} Parsed phone or `null` if the input could not be parsed
 */
export const parsePhone = (value: string): ParsedPhone | null => {
  const parsed = parsePhoneNumberFromString(value, DEFAULT_COUNTRY)
  if (!parsed) return null
  return {
    e164: parsed.format('E.164'),
    international: parsed.formatInternational(),
    national: parsed.formatNational(),
  } satisfies ParsedPhone
}

/**
 * Formats a phone number into E.164 (e.g. `+33612345678`), suitable for storage.
 * Inputs are expected to have been validated upstream (e.g. via a Zod validator);
 * reaching this function with an unparseable value indicates a bug or a validation bypass.
 * @param {string} value - Phone number, with or without an international prefix
 * @returns {string} E.164 string
 * @throws {Error} If the input could not be parsed
 */
export const formatPhoneForStorage = (value: string) => {
  const e164 = parsePhone(value)?.e164
  if (!e164) throw new Error('Invalid phone number')
  return e164
}

/**
 * Formats a phone number in the French national format (e.g. `06 12 34 56 78`)
 * as the user types. Accepts partial input, so it is suitable for live
 * formatting on each keystroke. Non-digit characters in the input are ignored.
 * @param {string} value - Raw or partially-formatted national number
 * @returns {string} Nationally-formatted number
 */
export const formatPhoneNational = (value: string) =>
  new AsYouType(DEFAULT_COUNTRY).input(value)
