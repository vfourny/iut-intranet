import { prisma } from '@/client'
import { seedDepartments } from '@/seeds/department.seed'
import { seedEvents } from '@/seeds/event.seed'
import { seedUsers } from '@/seeds/user.seed'

async function main() {
  await seedDepartments()
  await seedUsers()
  await seedEvents()

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
