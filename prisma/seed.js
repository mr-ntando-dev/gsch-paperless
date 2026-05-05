const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 12)

  // Create admin user
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

  // Create department users
  const deptUsers = [
    { email: 'dr.moyo@gsch.co.zw', name: 'Dr. T. Moyo', role: 'MANAGER', department: 'PATIENT_CARE' },
    { email: 't.chirwa@gsch.co.zw', name: 'T. Chirwa', role: 'STAFF', department: 'ACCOUNTS' },
    { email: 's.ndlovu@gsch.co.zw', name: 'S. Ndlovu', role: 'STAFF', department: 'KITCHEN' },
    { email: 'k.zimba@gsch.co.zw', name: 'K. Zimba', role: 'MANAGER', department: 'IT' },
    { email: 'p.mhlanga@gsch.co.zw', name: 'P. Mhlanga', role: 'STAFF', department: 'SAFETY_MAINTENANCE' },
    { email: 'l.ncube@gsch.co.zw', name: 'L. Ncube', role: 'STAFF', department: 'CRD' },
    { email: 'd.sibanda@gsch.co.zw', name: 'D. Sibanda', role: 'STAFF', department: 'HOSPITAL_RELATIONS' },
    { email: 'm.chikwanha@gsch.co.zw', name: 'M. Chikwanha', role: 'STAFF', department: 'BILLING' },
  ]

  for (const user of deptUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        ...user,
        password: hashedPassword,
      },
    })
  }

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
