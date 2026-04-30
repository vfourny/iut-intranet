import { prisma } from '@/client'
import { seedUsers } from '@/seeds/user.seed'

async function main() {
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
