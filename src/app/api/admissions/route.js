import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { notifyDept } from '@/lib/notify'

export async function GET(request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const where = {}
    if (status) where.status = status
    const admissions = await prisma.admission.findMany({
      where,
      include: { patient: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(admissions)
  } catch (e) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()
    const { patientId, ward, bed, doctor, diagnosis, notes, dietaryNotes } = body
    const admission = await prisma.admission.create({
      data: { patientId, ward, bed: bed || null, doctor, diagnosis: diagnosis || null, notes: notes || null, dietaryNotes: dietaryNotes || null },
      include: { patient: true },
    })
    await prisma.patient.update({ where: { id: patientId }, data: { careType: 'ADMITTED' } })

    // Notify Patient Care department
    const patientCareDept = await prisma.departmentModel.findFirst({ where: { code: 'PATIENT_CARE', isActive: true } })
    if (patientCareDept) {
      await notifyDept({
        departmentId: patientCareDept.id,
        excludeUserId: session.user.id,
        title: 'New patient admitted',
        message: `${admission.patient.firstName} ${admission.patient.lastName} (${admission.patient.patientId}) admitted to ${ward}${bed ? `, Bed ${bed}` : ''} under Dr. ${doctor}.`,
        type: 'PATIENT',
        link: '/dashboard/admissions',
      })
    }

    return NextResponse.json(admission, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()
    const { id, status, dischargeDate, notes } = body
    const admission = await prisma.admission.update({
      where: { id },
      data: { status, dischargeDate: dischargeDate ? new Date(dischargeDate) : undefined, notes },
      include: { patient: true },
    })
    if (status === 'DISCHARGED') {
      await prisma.patient.update({ where: { id: admission.patientId }, data: { careType: 'OUTPATIENT' } })

      // Notify dept of discharge
      const patientCareDept = await prisma.departmentModel.findFirst({ where: { code: 'PATIENT_CARE', isActive: true } })
      if (patientCareDept) {
        await notifyDept({
          departmentId: patientCareDept.id,
          excludeUserId: session.user.id,
          title: 'Patient discharged',
          message: `${admission.patient.firstName} ${admission.patient.lastName} (${admission.patient.patientId}) has been discharged.`,
          type: 'PATIENT',
          link: '/dashboard/admissions',
        })
      }
    }
    return NextResponse.json(admission)
  } catch (e) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
