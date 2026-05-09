import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const where = {}
    if (status) where.status = status
    const obs = await prisma.observation.findMany({
      where,
      include: { patient: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(obs)
  } catch (e) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()
    const { patientId, reason, doctor, observationArea, notes, vitals } = body
    const obs = await prisma.observation.create({
      data: {
        patientId,
        reason,
        doctor,
        observationArea: observationArea || 'General',
        notes: notes || null,
        vitals: vitals || null,
      },
      include: { patient: true },
    })
    await prisma.patient.update({ where: { id: patientId }, data: { careType: 'OBSERVATION' } })
    return NextResponse.json(obs, { status: 201 })
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
    const { id, status, notes, vitals, endDate } = body
    const obs = await prisma.observation.update({
      where: { id },
      data: {
        status,
        notes,
        vitals,
        endDate: endDate ? new Date(endDate) : status === 'COMPLETED' ? new Date() : undefined,
      },
      include: { patient: true },
    })
    if (status === 'COMPLETED') {
      await prisma.patient.update({ where: { id: obs.patientId }, data: { careType: 'OUTPATIENT' } })
    } else if (status === 'ESCALATED') {
      await prisma.patient.update({ where: { id: obs.patientId }, data: { careType: 'ADMITTED' } })
    }
    return NextResponse.json(obs)
  } catch (e) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
