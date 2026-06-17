import type { Prisma } from '@iut-intranet/db'

export const userInclude = {
  departments: {
    include: {
      department: true,
    },
  },
} satisfies Prisma.UserInclude

// Projection de l'annuaire : uniquement ce que le front affiche. `email`/`phone`
// sont volontairement exposés (annuaire interne) ; `role` et les `ban*` ne le
// sont jamais — ils restent côté serveur.
export const userListSelect = {
  departments: {
    include: {
      department: {
        select: {
          code: true,
          site: true,
        },
      },
    },
  },
  email: true,
  firstName: true,
  id: true,
  image: true,
  jobTitle: true,
  lastName: true,
  phone: true,
} satisfies Prisma.UserSelect
