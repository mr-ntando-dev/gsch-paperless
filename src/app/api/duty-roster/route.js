import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

// Helper: can this session user manage rosters?
function canManage(session) {
  if (!session) return false
  const role = session.user.role
  if (['SUPERADMIN', 'ADMIN'].includes(role)) return true
  if (session.user.isRosterManager) return true
  return false
}

export async function GET(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const deptId = searchParams.get('departmentId')
  const status = searchParams.get('status')
  const where = {}
  if (deptId) where.departmentId = deptId
  if (status) where.status = status
  // Non-admin staff only see their own department
  if (!['SUPERADMIN', 'ADMIN'].includes(session.user.role) && session.user.departmentId) {
    where.departmentId = session.user.departmentId
  }
  try {
    const rosters = await prisma.dutyRoster.findMany({
      where,
      include: {
        department: { select: { id: true, name: true, shortName: true, color: true } },
        createdBy: { select: { id: true, name: true } },
        entries: {
          include: { user: { select: { id: true, name: true, role: true } } },
          orderBy: [{ date: 'asc' }, { shiftType: 'asc' }]
        }
      },
      orderBy: [{ weekStart: 'desc' }]
    })
    return NextResponse.json(rosters)
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Enrich session with isRosterManager from DB
  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { isRosterManager: true, departmentId: true } })
  session.user.isRosterManager = dbUser?.isRosterManager || false

  if (!canManage(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { title, departmentId, weekStart, weekEnd, entries = [] } = body
  if (!title || !departmentId || !weekStart || !weekEnd) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })

  // Roster managers can only create for their own department
  if (session.user.isRosterManager && !['SUPERADMIN', 'ADMIN'].includes(session.user.role)) {
    if (session.user.departmentId !== departmentId) return NextResponse.json({ error: 'You can only create rosters for your own department' }, { status: 403 })
  }

  try {
    const roster = await prisma.dutyRoster.create({
      data: {
        title, departmentId, weekStart, weekEnd,
        createdById: session.user.id,
        entries: {
          create: entries.map(e => ({
            userId: e.userId, date: e.date,
            shiftType: e.shiftType || 'DAY',
            startTime: e.startTime || null,
            endTime: e.endTime || null,
            notes: e.notes || null
          }))
        }
      },
      include: {
        department: { select: { id: true, name: true, shortName: true } },
        createdBy: { select: { id: true, name: true } },
        entries: { include: { user: { select: { id: true, name: true, role: true } } } }
      }
    })
    return NextResponse.json(roster, { status: 201 })
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function PATCH(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { isRosterManager: true, departmentId: true } })
  session.user.isRosterManager = dbUser?.isRosterManager || false
  if (!canManage(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { id, entries, ...updates } = body
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  try {
    const existing = await prisma.dutyRoster.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    // Roster managers can only edit their own dept
    if (session.user.isRosterManager && !['SUPERADMIN', 'ADMIN'].includes(session.user.role)) {
      if (existing.departmentId !== session.user.departmentId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const roster = await prisma.dutyRoster.update({
      where: { id },
      data: updates,
      include: { department: { select: { id: true, name: true } }, createdBy: { select: { id: true, name: true } }, entries: { include: { user: { select: { id: true, name: true } } } } }
    })
    return NextResponse.json(roster)
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
    await prisma.dutyRoster.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
