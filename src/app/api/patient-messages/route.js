import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')
    const channel = searchParams.get('channel')
    const where = {}
    if (patientId) where.patientId = patientId
    if (channel) where.channel = channel
    const msgs = await prisma.patientMessage.findMany({
      where,
      include: { patient: true },
      orderBy: { createdAt: 'asc' },
      take: 200,
    })
    return NextResponse.json(msgs)
  } catch (e) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()
    const { patientId, channel, content, senderRole } = body
    const patient = await prisma.patient.findUnique({ where: { id: patientId } })
    if (!patient) return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    const msg = await prisma.patientMessage.create({
      data: {
        patientId,
        channel: channel || 'KITCHEN',
        content,
        senderName: session.user.name,
        senderRole: senderRole || 'NURSE',
      },
      include: { patient: true },
    })
    // Mirror to dept channel if kitchen
    if (channel === 'KITCHEN') {
      const kitchenDept = await prisma.departmentModel.findFirst({ where: { code: 'KITCHEN' } })
      if (kitchenDept) {
        await prisma.message.create({
          data: {
            content: `[Patient ${patient.patientId} — ${patient.firstName} ${patient.lastName}] ${content}`,
            senderId: session.user.id,
            departmentId: kitchenDept.id,
            channel: 'kitchen',
          },
        })
      }
    }
    return NextResponse.json(msg, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
