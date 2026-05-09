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
    if (date) where.visitDate = date
    const visits = await prisma.babyClinicVisit.findMany({ where, orderBy: { createdAt: 'desc' } })
    return NextResponse.json(visits)
  } catch (e) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()
    const today = new Date()
    const visit = await prisma.babyClinicVisit.create({
      data: {
        babyName: body.babyName,
        dob: body.dob,
        parentName: body.parentName,
        parentPhone: body.parentPhone,
        visitType: body.visitType || 'IMMUNIZATION',
        weight: body.weight || null,
        height: body.height || null,
        notes: body.notes || null,
        status: 'WAITING',
        visitDate: body.visitDate || today.toISOString().split('T')[0],
        visitTime: new Date().toLocaleTimeString('en-ZW', { hour: '2-digit', minute: '2-digit' }),
        attendedBy: session.user.name || null,
      },
    })
    return NextResponse.json(visit, { status: 201 })
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
    const { id, ...data } = body
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
    const visit = await prisma.babyClinicVisit.update({ where: { id }, data })
    return NextResponse.json(visit)
  } catch (e) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
