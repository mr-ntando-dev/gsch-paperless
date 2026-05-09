import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

export async function GET(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!['SUPERADMIN', 'ADMIN'].includes(session.user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')
  const resource = searchParams.get('resource')
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const limit = parseInt(searchParams.get('limit') || '100')
  const where = {}
  if (userId) where.userId = userId
  if (resource) where.resource = { contains: resource, mode: 'insensitive' }
  if (from || to) {
    where.createdAt = {}
    if (from) where.createdAt.gte = new Date(from)
    if (to) where.createdAt.lte = new Date(to)
  }
  try {
    const logs = await prisma.activityLog.findMany({
      where,
      include: { user: { select: { id: true, name: true, role: true, department: { select: { name: true, shortName: true } } } } },
      orderBy: { createdAt: 'desc' },
      take: limit
    })
    return NextResponse.json(logs)
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { action, resource, resourceId, details } = body
  if (!action || !resource) return NextResponse.json({ error: 'action and resource required' }, { status: 400 })
  try {
    const log = await prisma.activityLog.create({
      data: { userId: session.user.id, action, resource, resourceId: resourceId || null, details: details || null }
    })
    return NextResponse.json(log, { status: 201 })
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
