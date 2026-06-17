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

// ── Upload (avatar) ───────────────────────────────────────────────────────────

export const uploadMyAvatarInputSchema = uploadObjectInputSchema
export type UploadMyAvatarInput = z.infer<typeof uploadMyAvatarInputSchema>

// ── Inputs (gestion de l'utilisateur par un admin) ────────────────────────────────────────────

export const createUserInputSchema = userSchema
  .omit({ role: true, userId: true })
  .extend({
    departmentCodes: z.array(z.enum(DepartmentCode)).min(1),
  })
  .strict()
export type CreateUserInput = z.infer<typeof createUserInputSchema>

export const updateUserFromAdminInputSchema = userSchema.extend({
  departmentCodes: z.array(z.enum(DepartmentCode)).min(1),
})
export type updateUserFromAdminInput = z.infer<
  typeof updateUserFromAdminInputSchema
>

export const deleteUserInputSchema = z.object({
  userId: z.string(),
})
export type deleteUserInput = z.infer<typeof deleteUserInputSchema>

export const getByIdInputSchema = z.object({
  userId: z.string(),
})
export type getByIdInput = z.infer<typeof getByIdInputSchema>

// ── Listing ───────────────────────────────────────────────────────────────────

export const listUsersInputSchema = paginationSchema
  .extend({
    department: z.enum(DepartmentCode).optional(),
    search: searchSchema,
  })
  .strict()
export type ListUsersInputSchema = z.infer<typeof listUsersInputSchema>
