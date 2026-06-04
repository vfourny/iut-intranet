import { z } from 'zod'

// ── Identifiant ───────────────────────────────────────────────────────────────
// Id du domaine department, brandé dans son propre schéma (comme news/event).
// `brand.schema` ne conserve désormais que les ids réellement transverses (cf.
// sa doc).

export const departmentIdSchema = z.cuid().brand<'DepartmentId'>()
export type DepartmentId = z.infer<typeof departmentIdSchema>
