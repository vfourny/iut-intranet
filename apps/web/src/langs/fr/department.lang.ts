import { DepartmentCode } from '@iut-intranet/db/enums'

export const department = {
  label: {
    [DepartmentCode.GACO]:
      'Gestion Administrative et Commerciale des Organisations',
    [DepartmentCode.GB]: 'Génie Biologique',
    [DepartmentCode.GEA]: 'Gestion des Entreprises et des Administrations',
    [DepartmentCode.GEII]: 'Génie Électrique et Informatique Industrielle',
    [DepartmentCode.GIM]: 'Génie Industriel et Maintenance',
    [DepartmentCode.GTE]: 'Génie Thermique et Énergie',
    [DepartmentCode.INFO]: 'Informatique',
    [DepartmentCode.TC]: 'Techniques de Commercialisation',
  },
} as const
