import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const where = {}
    if (date) where.date = date
    const records = await prisma.dayCareRecord.findMany({
      where,
      include: { patient: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(records)
  } catch (e) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()
    const { childName, age, parentName, parentPhone, checkInTime, notes, dietaryNeeds, patientId } = body
    const today = new Date().toLocaleDateString('en-ZW')
    const record = await prisma.dayCareRecord.create({
      data: {
        childName,
        age,
        parentName,
        parentPhone,
        checkInTime: checkInTime || new Date().toLocaleTimeString('en-ZW', { hour: '2-digit', minute: '2-digit' }),
        date: today,
        notes: notes || null,
        dietaryNeeds: dietaryNeeds || null,
        patientId: patientId || null,
      },
      include: { patient: true },
    })
    return NextResponse.json(record, { status: 201 })
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
    const { id, status, checkOutTime } = body
    const record = await prisma.dayCareRecord.update({
      where: { id },
      data: {
        status,
        checkOutTime: checkOutTime || new Date().toLocaleTimeString('en-ZW', { hour: '2-digit', minute: '2-digit' }),
      },
      include: { patient: true },
    })
    return NextResponse.json(record)
  } catch (e) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
