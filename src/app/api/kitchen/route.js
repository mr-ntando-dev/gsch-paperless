import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // Only kitchen and clinical staff can access meal requests
    const allowedDepts = ['KITCHEN', 'PATIENT_CARE', 'CRD', 'MANAGEMENT']
    const userDeptCode = session.user.departmentCode
    if (!['SUPERADMIN', 'ADMIN'].includes(session.user.role) && !allowedDepts.includes(userDeptCode)) {
      return NextResponse.json({ error: 'Access denied. Kitchen data is restricted to kitchen and clinical departments.' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const patientId = searchParams.get('patientId')
    const where = {}
    if (status) where.status = status
    if (patientId) where.patientId = patientId
    const requests = await prisma.kitchenRequest.findMany({
      where,
      include: { patient: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(requests)
  } catch (e) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()
    const { patientId, requestType, mealTime, description, dietaryNotes, priority } = body
    const req = await prisma.kitchenRequest.create({
      data: {
        patientId,
        requestType: requestType || 'MEAL',
        mealTime: mealTime || 'LUNCH',
        description,
        dietaryNotes: dietaryNotes || null,
        priority: priority || 'MEDIUM',
        requestedBy: session.user.name,
        status: 'PENDING',
      },
      include: { patient: true },
    })
    // Also send a message to the KITCHEN department channel
    const kitchenDept = await prisma.departmentModel.findFirst({ where: { code: 'KITCHEN' } })
    if (kitchenDept) {
      await prisma.message.create({
        data: {
          content: `[KITCHEN REQUEST] Patient ${req.patient.firstName} ${req.patient.lastName} (${req.patient.patientId}) — ${mealTime} ${requestType}: ${description}${dietaryNotes ? '. Dietary notes: ' + dietaryNotes : ''}`,
          senderId: session.user.id,
          departmentId: kitchenDept.id,
          channel: 'kitchen',
        },
      })
    }
    return NextResponse.json(req, { status: 201 })
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
    const { id, status, notes } = body
    const req = await prisma.kitchenRequest.update({
      where: { id },
      data: {
        status,
        notes: notes || undefined,
        deliveredAt: status === 'DELIVERED' ? new Date() : undefined,
      },
      include: { patient: true },
    })
    return NextResponse.json(req)
  } catch (e) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
