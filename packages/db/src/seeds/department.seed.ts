import { prisma } from '@/client'
import { DepartmentCode, Site } from '@/generated/enums'

const DEPARTMENT_SITES: Record<DepartmentCode, Site> = {
  [DepartmentCode.Administration]: Site.BOULOGNE,
  [DepartmentCode.GACO]: Site.BOULOGNE,
  [DepartmentCode.GB]: Site.BOULOGNE,
  [DepartmentCode.GEA]: Site.SAINT_OMER,
  [DepartmentCode.GEII]: Site.DUNKERQUE,
  [DepartmentCode.GIM]: Site.CALAIS,
  [DepartmentCode.INFO]: Site.CALAIS,
  [DepartmentCode.MT2E]: Site.DUNKERQUE,
  [DepartmentCode.TC]: Site.SAINT_OMER,
  [DepartmentCode.Technique]: Site.BOULOGNE,
}

export const seedDepartments = async () => {
  await Promise.all(
    Object.entries(DEPARTMENT_SITES).map(([code, site]) =>
      prisma.department.upsert({
        create: {
          code: code as DepartmentCode,
          site,
        },
        update: {
          site,
        },
        where: {
          code: code as DepartmentCode,
        },
      }),
    ),
  )
}
