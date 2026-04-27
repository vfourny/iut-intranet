import "dotenv/config"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  await prisma.user.deleteMany()
  const user1 = await prisma.user.create({
    data: { name: 'Armand', lastName: 'Cuvelier' },
  })
  console.log('Succès :', user1)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })