const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 12)

  // Create admin user only - department users will register themselves
  await prisma.user.upsert({
    where: { email: 'admin@gsch.co.zw' },
    update: {},
    create: {
      email: 'admin@gsch.co.zw',
      name: 'System Admin',
      password: hashedPassword,
      role: 'ADMIN',
      department: 'MANAGEMENT',
    },
  })

  console.log('Database seeded successfully! Admin account created.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
