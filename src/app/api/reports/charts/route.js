import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

export async function GET(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    // Last 7 days labels
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      return d
    })
    const dayLabels = days.map(d => d.toLocaleDateString('en-ZW', { weekday: 'short', day: 'numeric' }))

    // Admissions per day (last 7 days)
    const admissionsPerDay = await Promise.all(days.map(async (d) => {
      const start = new Date(d); start.setHours(0, 0, 0, 0)
      const end = new Date(d); end.setHours(23, 59, 59, 999)
      return prisma.admission.count({ where: { admitDate: { gte: start, lte: end } } })
    }))

    // Patients per care type
    const [admitted, observation, daycare, outpatient] = await Promise.all([
      prisma.patient.count({ where: { careType: 'ADMITTED' } }),
      prisma.patient.count({ where: { careType: 'OBSERVATION' } }),
      prisma.patient.count({ where: { careType: 'DAYCARE' } }),
      prisma.patient.count({ where: { careType: 'OUTPATIENT' } }),
    ])

    // Appointments this week by status
    const today = new Date()
    const weekStart = new Date(today); weekStart.setDate(today.getDate() - today.getDay())
    const weekDates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart); d.setDate(weekStart.getDate() + i)
      return d.toISOString().split('T')[0]
    })
    const apptThisWeek = await prisma.appointment.groupBy({
      by: ['status'],
      where: { date: { in: weekDates } },
      _count: { id: true }
    })

    // Medications active vs stopped
    const [activeMeds, stoppedMeds] = await Promise.all([
      prisma.medication.count({ where: { status: 'ACTIVE' } }),
      prisma.medication.count({ where: { status: { in: ['STOPPED', 'COMPLETED'] } } }),
    ])

    // Tasks this month by priority
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    const tasksByPriority = await prisma.task.groupBy({
      by: ['priority'],
      where: { createdAt: { gte: monthStart } },
      _count: { id: true }
    })

    // Maintenance open vs resolved
    const [openMaint, resolvedMaint] = await Promise.all([
      prisma.maintenanceRequest.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
      prisma.maintenanceRequest.count({ where: { status: 'RESOLVED' } }),
    ])

    return NextResponse.json({
      admissionsTrend: { labels: dayLabels, data: admissionsPerDay },
      patientsByType: { admitted, observation, daycare, outpatient },
      appointmentsThisWeek: apptThisWeek.reduce((acc, x) => ({ ...acc, [x.status]: x._count.id }), {}),
      medications: { active: activeMeds, stopped: stoppedMeds },
      tasksByPriority: tasksByPriority.reduce((acc, x) => ({ ...acc, [x.priority]: x._count.id }), {}),
      maintenance: { open: openMaint, resolved: resolvedMaint }
    })
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
