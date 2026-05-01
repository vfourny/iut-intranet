import { prisma } from '@/client'
import { seedDepartments } from '@/seeds/department.seed'
import { seedUsers } from '@/seeds/user.seed'

async function main() {
  await seedDepartments()
  await seedUsers()

  return
}

main()
  .catch((error) => {
    console.error('Seed error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
