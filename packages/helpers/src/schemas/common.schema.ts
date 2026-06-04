import { z } from 'zod'

import { formatPhoneForStorage, isValidPhone } from '@/utils/phone.util'
import { NAME_PATTERN_REGEX } from '@/utils/regex.util'

// ── Identité ────────────────────────────────────────────────────────────────

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

// Accepte un numéro saisi au format national (avec espaces) ou international,
// le valide via libphonenumber et le normalise en E.164 pour le stockage.
export const phoneValueSchema = z
  .string()
  .refine(isValidPhone)
  .transform(formatPhoneForStorage)

// ── Listing (pagination & recherche) ──────────────────────────────────────────

const DEFAULT_PAGE_SIZE = 10
const MAX_PAGE_SIZE = 100

/**
 * Fabrique de schéma de pagination : `page`/`pageSize` partagés, seule la taille
 * de page par défaut varie d'un module à l'autre (cf. news). Source unique
 * pour la borne `MAX_PAGE_SIZE`, qu'aucun module ne redéfinit.
 */
export const buildPaginationSchema = (defaultPageSize = DEFAULT_PAGE_SIZE) =>
  z.object({
    page: z.number().int().min(1).default(1),
    pageSize: z
      .number()
      .int()
      .min(1)
      .max(MAX_PAGE_SIZE)
      .default(defaultPageSize),
  })

export const paginationSchema = buildPaginationSchema()

export const searchSchema = z.string().trim().optional()
