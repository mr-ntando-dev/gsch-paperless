import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

// Add or remove individual entries from a roster
export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { isRosterManager: true, departmentId: true } })
  const isRosterManager = dbUser?.isRosterManager || false
  const isAdminRole = ['SUPERADMIN', 'ADMIN'].includes(session.user.role)
  if (!isAdminRole && !isRosterManager) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { rosterId, userId, date, shiftType, startTime, endTime, notes } = body
  if (!rosterId || !userId || !date) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  // Check department match for roster manager
  if (!isAdminRole && isRosterManager) {
    const roster = await prisma.dutyRoster.findUnique({ where: { id: rosterId }, select: { departmentId: true } })
    if (!roster || roster.departmentId !== dbUser.departmentId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const entry = await prisma.dutyEntry.create({
      data: { rosterId, userId, date, shiftType: shiftType || 'DAY', startTime: startTime || null, endTime: endTime || null, notes: notes || null },
      include: { user: { select: { id: true, name: true, role: true } } }
    })
    return NextResponse.json(entry, { status: 201 })
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function DELETE(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { isRosterManager: true, departmentId: true } })
  const isRosterManager = dbUser?.isRosterManager || false
  const isAdminRole = ['SUPERADMIN', 'ADMIN'].includes(session.user.role)
  if (!isAdminRole && !isRosterManager) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  try {
    await prisma.dutyEntry.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
