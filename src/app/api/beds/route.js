import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

export async function GET(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const ward = searchParams.get('ward')
  const status = searchParams.get('status')
  const where = {}
  if (ward) where.wardName = ward
  if (status) where.status = status
  try {
    const beds = await prisma.bed.findMany({ where, orderBy: [{ wardName: 'asc' }, { bedNumber: 'asc' }] })
    // Attach patient info
    const bedsWithPatient = await Promise.all(beds.map(async (bed) => {
      if (bed.patientId) {
        const patient = await prisma.patient.findUnique({ where: { id: bed.patientId }, select: { id: true, patientId: true, firstName: true, lastName: true, careType: true } })
        return { ...bed, patient }
      }
      return { ...bed, patient: null }
    }))
    return NextResponse.json(bedsWithPatient)
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!['SUPERADMIN', 'ADMIN'].includes(session.user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await req.json()
  const { bedNumber, wardName, departmentId, status, notes } = body
  if (!bedNumber || !wardName) return NextResponse.json({ error: 'bedNumber and wardName required' }, { status: 400 })
  try {
    const bed = await prisma.bed.create({ data: { bedNumber, wardName, departmentId: departmentId || null, status: status || 'AVAILABLE', notes: notes || null } })
    return NextResponse.json(bed, { status: 201 })
  } catch (e) {
    if (e.code === 'P2002') return NextResponse.json({ error: 'Bed already exists in this ward' }, { status: 400 })
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PATCH(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, ...updates } = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  try {
    const bed = await prisma.bed.update({ where: { id }, data: updates })
    return NextResponse.json(bed)
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function DELETE(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!['SUPERADMIN', 'ADMIN'].includes(session.user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  try {
    await prisma.bed.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
