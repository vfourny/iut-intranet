import { DepartmentCode, UserRole } from '@iut-intranet/db/enums'
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

export const jobTitleSchema = z.string().trim().min(1)

// ── Entité ────────────────────────────────────────────────────────────────────

export const userSchema = z.object({
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

// ── Inputs (création par un admin) ────────────────────────────────────────────

export const createUserInputSchema = userSchema
  .omit({ userId: true })
  .extend({
    departmentCode: z.enum(DepartmentCode),
    role: z.enum(UserRole).default(UserRole.USER),
  })
  .strict()
export type CreateUserInput = z.infer<typeof createUserInputSchema>

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
