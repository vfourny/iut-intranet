import { DepartmentCode } from '@iut-intranet/db/enums'

export type DepartmentSpecialty = 'admin' | 'bio' | 'energy' | 'indus' | 'info'

/**
 * Mapping code département → spécialité (charte ADIUT, p.7-8) :
 *   admin  → GACO, GEA, TC      (Administration, Gestion, Commerce)
 *   info   → INFO, GEII         (Électricité, Automatique, Informatique)
 *   indus  → GIM                (Sciences Industrielles, Matériaux, Contrôle)
 *   bio    → GB                 (Chimie, Biologie, Procédés Industriels)
 *   energy → GTE                (Construction, Énergie, Sécurité)
 */
export const SPECIALTY_BY_DEPARTMENT: Record<
  DepartmentCode,
  DepartmentSpecialty
> = {
  [DepartmentCode.GACO]: 'admin',
  [DepartmentCode.GB]: 'bio',
  [DepartmentCode.GEA]: 'admin',
  [DepartmentCode.GEII]: 'info',
  [DepartmentCode.GIM]: 'indus',
  [DepartmentCode.GTE]: 'energy',
  [DepartmentCode.INFO]: 'info',
  [DepartmentCode.TC]: 'admin',
}

/**
 * Classes Tailwind par spécialité — strings complets pour que le scanner
 * Tailwind v4 les détecte (pas de concaténation dynamique).
 */
export const SPECIALTY_TAG_CLASSES: Record<DepartmentSpecialty, string> = {
  admin:
    'bg-dept-admin-100 text-dept-admin-800 dark:bg-dept-admin-900 dark:text-dept-admin-100',
  bio: 'bg-dept-bio-100 text-dept-bio-800 dark:bg-dept-bio-900 dark:text-dept-bio-100',
  energy:
    'bg-dept-energy-100 text-dept-energy-800 dark:bg-dept-energy-900 dark:text-dept-energy-100',
  indus:
    'bg-dept-indus-100 text-dept-indus-800 dark:bg-dept-indus-900 dark:text-dept-indus-100',
  info: 'bg-dept-info-100 text-dept-info-800 dark:bg-dept-info-900 dark:text-dept-info-100',
}
