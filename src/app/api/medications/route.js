import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

export async function GET(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const patientId = searchParams.get('patientId')
  const status = searchParams.get('status')
  const where = {}
  if (patientId) where.patientId = patientId
  if (status) where.status = status
  try {
    const meds = await prisma.medication.findMany({
      where,
      include: { patient: { select: { firstName: true, lastName: true, patientId: true } }, administrations: { orderBy: { givenAt: 'desc' }, take: 5 } },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(meds)
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await req.json()
    const { patientId, name, dose, route, frequency, startDate, endDate, prescribedBy, notes } = body
    if (!patientId || !name || !dose || !frequency || !prescribedBy) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    const med = await prisma.medication.create({
      data: { patientId, name, dose, route: route || 'ORAL', frequency, startDate: startDate ? new Date(startDate) : new Date(), endDate: endDate ? new Date(endDate) : null, prescribedBy, notes: notes || null },
      include: { patient: { select: { firstName: true, lastName: true, patientId: true } } }
    })
    return NextResponse.json(med, { status: 201 })
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function PATCH(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await req.json()
    const { id, action, givenBy, dose: adminDose, notes: adminNotes, ...updates } = body
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    if (action === 'administer') {
      const admin = await prisma.medicationAdmin.create({
        data: { medicationId: id, givenBy: givenBy || session.user.name, dose: adminDose || null, notes: adminNotes || null }
      })
      return NextResponse.json(admin)
    }
    const med = await prisma.medication.update({ where: { id }, data: updates })
    return NextResponse.json(med)
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
