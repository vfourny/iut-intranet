import { z } from 'zod'

/**
 * Identifiants brandés de toutes les entités, regroupés ici pour être faciles à
 * suivre (un seul fichier source de vérité plutôt qu'un id éparpillé par
 * domaine).
 */

export const userIdSchema = z.cuid().brand<'UserId'>()
export type UserId = z.infer<typeof userIdSchema>

export const departmentIdSchema = z.cuid().brand<'DepartmentId'>()
export type DepartmentId = z.infer<typeof departmentIdSchema>

export const newsIdSchema = z.cuid().brand<'NewsId'>()
export type NewsId = z.infer<typeof newsIdSchema>

export const eventIdSchema = z.cuid().brand<'EventId'>()
export type EventId = z.infer<typeof eventIdSchema>
