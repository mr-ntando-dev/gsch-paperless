import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

export async function GET(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const patientId = searchParams.get('patientId')
  const type = searchParams.get('type') // LABORATORY | RADIOLOGY
  const status = searchParams.get('status')
  const where = {}
  if (patientId) where.patientId = patientId
  if (type) where.type = type
  if (status) where.status = status
  try {
    const requests = await prisma.labRequest.findMany({
      where,
      include: {
        patient: { select: { id: true, patientId: true, firstName: true, lastName: true } },
        requestedBy: { select: { id: true, name: true, role: true } },
        resultEnteredBy: { select: { id: true, name: true } }
      },
      orderBy: { requestedAt: 'desc' }
    })
    return NextResponse.json(requests)
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { patientId, type, testName, urgency, clinicalNotes } = body
  if (!patientId || !type || !testName) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  try {
    const request = await prisma.labRequest.create({
      data: {
        patientId, type, testName,
        urgency: urgency || 'ROUTINE',
        clinicalNotes: clinicalNotes || null,
        requestedById: session.user.id
      },
      include: {
        patient: { select: { id: true, patientId: true, firstName: true, lastName: true } },
        requestedBy: { select: { id: true, name: true, role: true } }
      }
    })
    return NextResponse.json(request, { status: 201 })
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function PATCH(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { id, result, resultFileUrl, status, ...rest } = body
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const updateData = { ...rest }
  if (status) updateData.status = status
  if (result !== undefined) {
    updateData.result = result
    updateData.resultEnteredById = session.user.id
    updateData.resultEnteredAt = new Date()
    if (status !== 'CANCELLED') updateData.status = 'COMPLETED'
  }
  if (resultFileUrl) updateData.resultFileUrl = resultFileUrl
  try {
    const updated = await prisma.labRequest.update({
      where: { id },
      data: updateData,
      include: {
        patient: { select: { id: true, patientId: true, firstName: true, lastName: true } },
        requestedBy: { select: { id: true, name: true } },
        resultEnteredBy: { select: { id: true, name: true } }
      }
    })
    return NextResponse.json(updated)
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
    await prisma.labRequest.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
