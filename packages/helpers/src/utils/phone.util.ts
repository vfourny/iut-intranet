import {
  type CountryCode,
  formatIncompletePhoneNumber,
  isValidPhoneNumber,
  parsePhoneNumberWithError,
} from 'libphonenumber-js'

const DEFAULT_COUNTRY: CountryCode = 'FR'

export const formatPhone = (phone: string) => {
  return parsePhoneNumberWithError(phone).formatInternational()
}

export const isValidPhone = (phone: string) => {
  return isValidPhoneNumber(phone, DEFAULT_COUNTRY)
}

export const formatPhoneToE164 = (
  input: string,
  country: CountryCode = DEFAULT_COUNTRY,
) => {
  return parsePhoneNumberWithError(input, country).number
}
export const formatPhoneInternational = (e164: string): string =>
  parsePhoneNumberWithError(e164).formatInternational()

export const formatPhoneIncomplete = (
  input: string,
  country: CountryCode = DEFAULT_COUNTRY,
) => formatIncompletePhoneNumber(input, country)
