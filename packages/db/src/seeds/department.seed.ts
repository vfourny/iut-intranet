import { prisma } from '@/client'
import { DepartmentCode, Site } from '@/generated/enums'

const DEPARTMENT_SITES: Record<DepartmentCode, Site> = {
  [DepartmentCode.GACO]: Site.BOULOGNE,
  [DepartmentCode.GB]: Site.BOULOGNE,
  [DepartmentCode.GEA]: Site.SAINT_OMER,
  [DepartmentCode.GEII]: Site.DUNKERQUE,
  [DepartmentCode.GIM]: Site.CALAIS,
  [DepartmentCode.GTE]: Site.DUNKERQUE,
  [DepartmentCode.INFO]: Site.CALAIS,
  [DepartmentCode.TC]: Site.SAINT_OMER,
}

export const seedDepartments = async () => {
  await Promise.all(
    Object.entries(DEPARTMENT_SITES).map(([code, site]) =>
      prisma.department.create({
        data: { code: code as DepartmentCode, site },
      }),
    ),
  )
}
