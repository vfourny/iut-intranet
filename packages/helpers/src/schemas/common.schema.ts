import { z } from 'zod'

import { NAME_PATTERN_REGEX, SLUG_REGEX } from '@/utils/regex.util'

const MAX_NAME_LENGTH = 70

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

export const slugSchema = z.string().trim().regex(SLUG_REGEX)
