import { z } from 'zod'

/**
 * Identifiants brandés des entités **transverses** : référencés depuis plusieurs
 * domaines (FK) ou sans fichier de domaine propre.
 *
 * - `UserId` : importé comme valeur par l'auth/la middleware et référencé par
 *   les services news/event/user → vocabulaire partagé, pas la propriété du
 *   domaine user.
 *
 * Les ids mono-domaine vivent au contraire dans leur propre schéma
 * (`newsIdSchema` → `news.schema`, `eventIdSchema` → `event.schema`,
 * `departmentIdSchema` → `department.schema`).
 *
 * La validation `cuid` « gagne » le brand : impossible de confondre deux ids ou
 * de passer une string nue, sans aucun cast `as`. Côté frontières, on fait
 * `xIdSchema.parse(value)` pour transformer une string en id brandé.
 */

export const userIdSchema = z.cuid().brand<'UserId'>()
export type UserId = z.infer<typeof userIdSchema>
