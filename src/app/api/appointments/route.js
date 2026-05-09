import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

export async function GET(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date')
  const doctor = searchParams.get('doctor')
  const status = searchParams.get('status')
  const patientId = searchParams.get('patientId')
  const where = {}
  if (date) where.date = date
  if (doctor) where.doctor = { contains: doctor, mode: 'insensitive' }
  if (status) where.status = status
  if (patientId) where.patientId = patientId
  try {
    const appts = await prisma.appointment.findMany({
      where,
      include: { patient: { select: { firstName: true, lastName: true, patientId: true } } },
      orderBy: [{ date: 'asc' }, { time: 'asc' }]
    })
    return NextResponse.json(appts)
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await req.json()
    const { patientId, patientName, guardianPhone, doctor, department, date, time, duration, type, reason, notes } = body
    if (!doctor || !department || !date || !time) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    const appt = await prisma.appointment.create({
      data: { patientId: patientId || null, patientName: patientName || null, guardianPhone: guardianPhone || null, doctor, department, date, time, duration: duration ? parseInt(duration) : 30, type: type || 'OUTPATIENT', reason: reason || null, notes: notes || null },
      include: { patient: { select: { firstName: true, lastName: true, patientId: true } } }
    })
    return NextResponse.json(appt, { status: 201 })
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function PATCH(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { id, ...updates } = await req.json()
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    const appt = await prisma.appointment.update({ where: { id }, data: updates })
    return NextResponse.json(appt)
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function DELETE(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  try {
    await prisma.appointment.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
