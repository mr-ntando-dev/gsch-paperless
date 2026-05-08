import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession, isSuperAdmin } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session || !isSuperAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [
      totalUsers, activeUsers, totalDepts, totalDocs,
      totalTasks, totalForms, totalMessages, recentLogs
    ] = await Promise.all([
      prisma.user.count({ where: { role: { not: 'SUPERADMIN' } } }),
      prisma.user.count({ where: { isActive: true, role: { not: 'SUPERADMIN' } } }),
      prisma.departmentModel.count({ where: { isActive: true } }),
      prisma.document.count(),
      prisma.task.count(),
      prisma.form.count(),
      prisma.message.count(),
      prisma.activityLog.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true, role: true } } }
      })
    ])

    return NextResponse.json({
      totalUsers, activeUsers, totalDepts, totalDocs,
      totalTasks, totalForms, totalMessages, recentLogs
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
