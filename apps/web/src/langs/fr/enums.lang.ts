import { DepartmentCode } from '@iut-intranet/db/enums'

const department = {
  [DepartmentCode.GACO]:
    'Gestion Administrative et Commerciale des Organisations',
  [DepartmentCode.GB]: 'Génie Biologique',
  [DepartmentCode.GEA]: 'Gestion des Entreprises et des Administrations',
  [DepartmentCode.GEII]: 'Génie Électrique et Informatique Industrielle',
  [DepartmentCode.GIM]: 'Génie Industriel et Maintenance',
  [DepartmentCode.GTE]: 'Génie Thermique et Énergie',
  [DepartmentCode.INFO]: 'Informatique',
  [DepartmentCode.TC]: 'Techniques de Commercialisation',
} as const satisfies Record<DepartmentCode, string>

export const enums = {
  department,
} as const
