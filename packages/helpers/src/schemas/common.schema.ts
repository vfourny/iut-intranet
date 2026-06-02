import { z } from 'zod'

import { formatPhoneForStorage, isValidPhone } from '@/utils/phone.util'
import { NAME_PATTERN_REGEX } from '@/utils/regex.util'

const MAX_NAME_LENGTH = 70
const MAX_JOB_TITLE_LENGTH = 100

export const firstNameSchema = z
  .string()
  .trim()
  .max(MAX_NAME_LENGTH)
  .regex(NAME_PATTERN_REGEX)

export const lastNameSchema = z
  .string()
  .trim()
  .toUpperCase()
  .max(MAX_NAME_LENGTH)
  .regex(NAME_PATTERN_REGEX)

export const emailSchema = z.string().trim().toLowerCase().email()

// Accepte un numéro saisi au format national (avec espaces) ou international,
// le valide via libphonenumber et le normalise en E.164 pour le stockage.
export const phoneValueSchema = z
  .string()
  .refine(isValidPhone)
  .transform(formatPhoneForStorage)

export const jobTitleSchema = z.string().trim().min(1).max(MAX_JOB_TITLE_LENGTH)

const DEFAULT_PAGE_SIZE = 10
const MAX_PAGE_SIZE = 100

export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z
    .number()
    .int()
    .min(1)
    .max(MAX_PAGE_SIZE)
    .default(DEFAULT_PAGE_SIZE),
})

export const searchSchema = z.string().trim().optional()
