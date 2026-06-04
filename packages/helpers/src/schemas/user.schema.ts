import { UserRole } from '@iut-intranet/db/enums'
import { z } from 'zod'

import { userIdSchema } from '@/schemas/brand.schema'
import {
  emailSchema,
  firstNameSchema,
  lastNameSchema,
  paginationSchema,
  phoneValueSchema,
  searchSchema,
} from '@/schemas/common.schema'
import { uploadObjectInputSchema } from '@/schemas/storage.schema'

const MAX_JOB_TITLE_LENGTH = 100

// Réutilisé par `auth.schema` (sign up) : reste exporté.
export const jobTitleSchema = z.string().trim().min(1).max(MAX_JOB_TITLE_LENGTH)

// ── Entité ────────────────────────────────────────────────────────────────────

const userSchema = z.object({
  email: emailSchema,
  firstName: firstNameSchema,
  jobTitle: jobTitleSchema.optional(),
  lastName: lastNameSchema,
  phone: phoneValueSchema.optional(),
  role: z.enum(UserRole),
  userId: userIdSchema,
})

// ── Inputs (mise à jour) ──────────────────────────────────────────────────────

export const updateUserInputSchema = userSchema
  .partial()
  .required({ userId: true })
  .strict()
export type UpdateUserInput = z.infer<typeof updateUserInputSchema>

export const updateMeInputSchema = userSchema
  .pick({ jobTitle: true, phone: true })
  .partial()
  .strict()
export type UpdateMeInput = z.infer<typeof updateMeInputSchema>

/**
 * Colonnes éditables acceptées par `UserService.updateUser` : l'union de tous
 * les champs que n'importe quel appelant peut poser. Chaque procédure restreint
 * le sous-ensemble réel via son propre schéma d'input ; le service se contente
 * de persister ce qu'on lui donne.
 */
export type UpdateUserData = Omit<UpdateUserInput, 'userId'> & UpdateMeInput

// ── Upload (avatar) ───────────────────────────────────────────────────────────

export const uploadMyAvatarInputSchema = uploadObjectInputSchema
export type UploadMyAvatarInput = z.infer<typeof uploadMyAvatarInputSchema>

// ── Listing ───────────────────────────────────────────────────────────────────

export const listUsersInputSchema = paginationSchema
  .extend({
    search: searchSchema,
  })
  .strict()
export type ListUsersInputSchema = z.infer<typeof listUsersInputSchema>
