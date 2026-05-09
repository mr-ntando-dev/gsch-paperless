import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

export async function GET(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const patientId = searchParams.get('patientId')
  const limit = parseInt(searchParams.get('limit') || '50')
  if (!patientId) return NextResponse.json({ error: 'patientId required' }, { status: 400 })
  try {
    const vitals = await prisma.vitalsRecord.findMany({
      where: { patientId },
      include: { recordedBy: { select: { id: true, name: true, role: true } } },
      orderBy: { recordedAt: 'desc' },
      take: limit
    })
    return NextResponse.json(vitals)
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { patientId, temperature, pulse, systolic, diastolic, spo2, weight, height, respRate, glucoseLevel, notes } = body
  if (!patientId) return NextResponse.json({ error: 'patientId required' }, { status: 400 })
  try {
    const record = await prisma.vitalsRecord.create({
      data: {
        patientId, recordedById: session.user.id,
        temperature: temperature ? parseFloat(temperature) : null,
        pulse: pulse ? parseInt(pulse) : null,
        systolic: systolic ? parseInt(systolic) : null,
        diastolic: diastolic ? parseInt(diastolic) : null,
        spo2: spo2 ? parseInt(spo2) : null,
        weight: weight ? parseFloat(weight) : null,
        height: height ? parseFloat(height) : null,
        respRate: respRate ? parseInt(respRate) : null,
        glucoseLevel: glucoseLevel ? parseFloat(glucoseLevel) : null,
        notes: notes || null
      },
      include: { recordedBy: { select: { id: true, name: true, role: true } } }
    })
    return NextResponse.json(record, { status: 201 })
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
    await prisma.vitalsRecord.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
