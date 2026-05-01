import { z } from 'zod'

import { NAME_PATTERN_REGEX, PHONE_FR_REGEX } from '@/utils/regex.util'

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

export const phoneSchema = z.string().trim().regex(PHONE_FR_REGEX)

export const jobTitleSchema = z.string().trim().min(1).max(MAX_JOB_TITLE_LENGTH)
