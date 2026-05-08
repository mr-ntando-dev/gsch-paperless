const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  // Create default departments
  const deptData = [
    { code: 'CRD', name: 'Client Relations Department', shortName: 'CRD', color: 'blue', description: 'Managing patient and family relationships, complaints, feedback' },
    { code: 'PATIENT_CARE', name: 'Patient Care', shortName: 'Patient Care', color: 'teal', description: 'Clinical documentation, patient records, treatment plans' },
    { code: 'BILLING', name: 'Billing', shortName: 'Billing', color: 'green', description: 'Patient invoicing, payment tracking, insurance claims' },
    { code: 'ACCOUNTS', name: 'Accounts', shortName: 'Accounts', color: 'yellow', description: 'Financial management, budgets, payroll' },
    { code: 'KITCHEN', name: 'Kitchen', shortName: 'Kitchen', color: 'orange', description: 'Meal planning, dietary management' },
    { code: 'SAFETY_MAINTENANCE', name: 'Safety & Maintenance', shortName: 'Safety', color: 'red', description: 'Facility maintenance, safety audits' },
    { code: 'IT', name: 'IT Department', shortName: 'IT', color: 'purple', description: 'System management, asset tracking' },
    { code: 'MANAGEMENT', name: 'Management', shortName: 'Management', color: 'gray', description: 'Strategic planning, policies, HR' },
    { code: 'HOSPITAL_RELATIONS', name: 'Hospital Relations', shortName: 'H. Relations', color: 'pink', description: 'External partnerships, referrals' },
  ]

  const departments = {}
  for (const dept of deptData) {
    const d = await prisma.departmentModel.upsert({
      where: { code: dept.code },
      update: {},
      create: dept,
    })
    departments[dept.code] = d
  }

  // Hidden superadmin - devntando
  const superAdminHash = await bcrypt.hash('ntando2006', 12)
  await prisma.user.upsert({
    where: { email: 'devntando@system.internal' },
    update: {},
    create: {
      email: 'devntando@system.internal',
      name: 'devntando',
      password: superAdminHash,
      role: 'SUPERADMIN',
      departmentId: departments['MANAGEMENT'].id,
      isActive: true,
      createdByAdmin: true,
    },
  })

  // Regular admin
  const adminHash = await bcrypt.hash('admin2026', 12)
  await prisma.user.upsert({
    where: { email: 'admin@gsch.co.zw' },
    update: {},
    create: {
      email: 'admin@gsch.co.zw',
      name: 'System Administrator',
      password: adminHash,
      role: 'ADMIN',
      departmentId: departments['MANAGEMENT'].id,
      isActive: true,
      createdByAdmin: true,
    },
  })

  console.log('Database seeded successfully!')
  console.log('Admin: admin@gsch.co.zw / admin2026')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
