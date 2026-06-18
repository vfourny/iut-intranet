import { z } from 'zod'

import { formatPhoneForStorage, isValidPhone } from '@/utils/phone.util'
import { NAME_PATTERN_REGEX, PASSWORD_REGEX } from '@/utils/regex.util'

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

const UNIV_EMAIL_DOMAIN = 'univ-littoral.fr'
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email()
  .endsWith(`@${UNIV_EMAIL_DOMAIN}`, {
    message: `L'adresse e-mail doit appartenir au domaine @${UNIV_EMAIL_DOMAIN}`,
  })

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
 * Schéma de pagination partagé : `page`/`pageSize` avec une taille de page par
 */
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

/**
 * Sortie paginée générique : la tranche d'éléments demandée et le total des
 * lignes correspondant au filtre, toutes pages confondues (pour le front).
 */
export interface Paginated<T> {
  items: T[]
  total: number
}

// Password

export const MIN_PASSWORD_LENGTH = 8

export const passwordSchema = z
  .string()
  .min(MIN_PASSWORD_LENGTH)
  .regex(PASSWORD_REGEX)
