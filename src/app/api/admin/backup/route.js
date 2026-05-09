import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession, isSuperAdmin } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session || !isSuperAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Collect all tables in parallel
    const [
      users,
      departments,
      documents,
      approvals,
      tasks,
      taskEscalations,
      forms,
      formSubmissions,
      messages,
      notifications,
      comments,
      activityLogs,
      auditLogs,
      deptItems,
      deptNotices,
      documentRoutes,
      patients,
      admissions,
      observations,
      vitalsRecords,
      daycare,
      kitchenRequests,
      patientMessages,
      labRequests,
      prescriptions,
      medications,
      vaccinations,
      appointments,
      invoices,
      inventory,
      maintenanceRequests,
      shifts,
      dutyRosters,
      dutyEntries,
      pharmacy,
    ] = await Promise.all([
      prisma.user.findMany({ select: { id: true, email: true, name: true, role: true, departmentId: true, avatar: true, isActive: true, createdByAdmin: true, firstLogin: true, isRosterManager: true, createdAt: true, updatedAt: true } }),
      prisma.departmentModel.findMany(),
      prisma.document.findMany(),
      prisma.approval.findMany(),
      prisma.task.findMany(),
      prisma.taskEscalation.findMany().catch(() => []),
      prisma.form.findMany(),
      prisma.formSubmission.findMany().catch(() => []),
      prisma.message.findMany(),
      prisma.notification.findMany(),
      prisma.comment.findMany(),
      prisma.activityLog.findMany(),
      prisma.auditLog.findMany().catch(() => []),
      prisma.deptItem.findMany(),
      prisma.deptNotice.findMany(),
      prisma.documentRoute.findMany().catch(() => []),
      prisma.patient.findMany().catch(() => []),
      prisma.admission.findMany().catch(() => []),
      prisma.observation.findMany().catch(() => []),
      prisma.vitalsRecord.findMany().catch(() => []),
      prisma.dayCare.findMany().catch(() => []),
      prisma.kitchenRequest.findMany().catch(() => []),
      prisma.patientMessage.findMany().catch(() => []),
      prisma.labRequest.findMany().catch(() => []),
      prisma.prescription.findMany().catch(() => []),
      prisma.medication.findMany().catch(() => []),
      prisma.vaccination.findMany().catch(() => []),
      prisma.appointment.findMany().catch(() => []),
      prisma.invoice.findMany().catch(() => []),
      prisma.inventoryItem.findMany().catch(() => []),
      prisma.maintenanceRequest.findMany().catch(() => []),
      prisma.shiftRoster.findMany().catch(() => []),
      prisma.dutyRoster.findMany().catch(() => []),
      prisma.dutyEntry.findMany().catch(() => []),
      prisma.pharmacyItem.findMany().catch(() => []),
    ])

    const backup = {
      meta: {
        system: 'MediFile v3.0 — GSCH',
        exportedAt: new Date().toISOString(),
        exportedBy: session.user.email,
        version: '3.0',
      },
      data: {
        users,
        departments,
        documents,
        approvals,
        tasks,
        taskEscalations,
        forms,
        formSubmissions,
        messages,
        notifications,
        comments,
        activityLogs,
        auditLogs,
        deptItems,
        deptNotices,
        documentRoutes,
        patients,
        admissions,
        observations,
        vitalsRecords,
        daycare,
        kitchenRequests,
        patientMessages,
        labRequests,
        prescriptions,
        medications,
        vaccinations,
        appointments,
        invoices,
        inventory,
        maintenanceRequests,
        shifts,
        dutyRosters,
        dutyEntries,
        pharmacy,
      },
    }

    const filename = `gsch-backup-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.json`

    return new NextResponse(JSON.stringify(backup, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('[BACKUP ERROR]', error)
    return NextResponse.json({ error: 'Backup failed', detail: error.message }, { status: 500 })
  }
}

// GET backup history / stats (non-download)
export async function POST() {
  try {
    const session = await getSession()
    if (!session || !isSuperAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Return table row counts as a quick health summary
    const counts = await Promise.all([
      prisma.user.count(),
      prisma.departmentModel.count(),
      prisma.document.count(),
      prisma.task.count(),
      prisma.form.count(),
      prisma.message.count(),
      prisma.activityLog.count(),
      prisma.patient.count().catch(() => 0),
      prisma.admission.count().catch(() => 0),
      prisma.labRequest.count().catch(() => 0),
    ])

    const labels = ['users', 'departments', 'documents', 'tasks', 'forms', 'messages', 'activityLogs', 'patients', 'admissions', 'labRequests']
    const summary = Object.fromEntries(labels.map((l, i) => [l, counts[i]]))

    return NextResponse.json({ summary, checkedAt: new Date().toISOString() })
  } catch (error) {
    return NextResponse.json({ error: 'Stats failed', detail: error.message }, { status: 500 })
  }
}
