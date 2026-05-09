import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

export async function GET(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date')
  const week = searchParams.get('week') // YYYY-Www
  const department = searchParams.get('department')
  const userId = searchParams.get('userId')
  const where = {}
  if (date) where.date = date
  if (department) where.department = department
  if (userId) where.userId = userId
  if (week) {
    // week = "2025-05-05" start of week
    const start = new Date(week)
    const dates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start); d.setDate(d.getDate() + i)
      return d.toISOString().split('T')[0]
    })
    where.date = { in: dates }
  }
  try {
    const shifts = await prisma.shiftRoster.findMany({
      where,
      include: { user: { select: { id: true, name: true, role: true, department: { select: { name: true, shortName: true } } } } },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }]
    })
    return NextResponse.json(shifts)
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await req.json()
    const { userId, date, shiftType, startTime, endTime, department, notes } = body
    if (!userId || !date || !startTime || !endTime || !department) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    const shift = await prisma.shiftRoster.create({
      data: { userId, date, shiftType: shiftType || 'DAY', startTime, endTime, department, notes: notes || null },
      include: { user: { select: { id: true, name: true, role: true, department: { select: { name: true, shortName: true } } } } }
    })
    return NextResponse.json(shift, { status: 201 })
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function PATCH(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { id, ...updates } = await req.json()
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    const shift = await prisma.shiftRoster.update({ where: { id }, data: updates })
    return NextResponse.json(shift)
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function DELETE(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  try {
    await prisma.shiftRoster.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
