import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const now = new Date()
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
      return { year: d.getFullYear(), month: d.getMonth(), label: d.toLocaleString('default', { month: 'short' }) }
    })

    const [
      totalPatients, activeAdmissions, activeObservations, openMaintenance,
      pendingDocs, openTasks, totalInvoices, unpaidInvoices,
      admissionsByMonth, tasksByStatus, maintenanceByPriority,
      invoicesByStatus, patientsByCareType, docsByStatus,
    ] = await Promise.all([
      prisma.patient.count({ where: { isActive: true } }),
      prisma.admission.count({ where: { status: 'ADMITTED' } }),
      prisma.observation.count({ where: { status: 'ACTIVE' } }),
      prisma.maintenanceRequest.count({ where: { status: 'OPEN' } }),
      prisma.document.count({ where: { status: 'PENDING' } }),
      prisma.task.count({ where: { status: { not: 'DONE' } } }),
      prisma.invoice.count(),
      prisma.invoice.aggregate({ where: { status: 'UNPAID' }, _sum: { totalAmount: true } }),
      // Admissions per month for last 6 months
      Promise.all(last6Months.map(async m => {
        const start = new Date(m.year, m.month, 1)
        const end = new Date(m.year, m.month + 1, 1)
        const count = await prisma.admission.count({ where: { admitDate: { gte: start, lt: end } } })
        return { month: m.label, count }
      })),
      // Tasks by status
      prisma.task.groupBy({ by: ['status'], _count: true }),
      // Maintenance by priority
      prisma.maintenanceRequest.groupBy({ by: ['priority'], _count: true, where: { status: 'OPEN' } }),
      // Invoices by status
      prisma.invoice.groupBy({ by: ['status'], _count: true, _sum: { totalAmount: true } }),
      // Patients by care type
      prisma.patient.groupBy({ by: ['careType'], _count: true, where: { isActive: true } }),
      // Documents by status
      prisma.document.groupBy({ by: ['status'], _count: true }),
    ])

    return NextResponse.json({
      summary: {
        totalPatients,
        activeAdmissions,
        activeObservations,
        openMaintenance,
        pendingDocs,
        openTasks,
        totalInvoices,
        unpaidAmount: unpaidInvoices._sum.totalAmount || 0,
      },
      charts: {
        admissionsByMonth,
        tasksByStatus: tasksByStatus.map(t => ({ status: t.status, count: t._count })),
        maintenanceByPriority: maintenanceByPriority.map(m => ({ priority: m.priority, count: m._count })),
        invoicesByStatus: invoicesByStatus.map(i => ({ status: i.status, count: i._count, total: i._sum.totalAmount || 0 })),
        patientsByCareType: patientsByCareType.map(p => ({ careType: p.careType, count: p._count })),
        docsByStatus: docsByStatus.map(d => ({ status: d.status, count: d._count })),
      },
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
