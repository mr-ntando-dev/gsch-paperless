import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { notifyDept } from '@/lib/notify'

export async function GET(request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const direction = searchParams.get('direction') // 'incoming' | 'outgoing' | null=both
    const deptId = session.user.departmentId

    let where = {}
    if (['ADMIN', 'SUPERADMIN'].includes(session.user.role)) {
      // Admins see all, but still respect direction filter if provided
      if (direction === 'incoming') where = { toDeptId: deptId }
      else if (direction === 'outgoing') where = { fromDeptId: deptId }
      // else where = {} — see everything
    } else {
      if (direction === 'incoming') where = { toDeptId: deptId }
      else if (direction === 'outgoing') where = { fromDeptId: deptId }
      else where = { OR: [{ fromDeptId: deptId }, { toDeptId: deptId }] }
    }

    const routes = await prisma.documentRoute.findMany({
      where,
      include: {
        document: { select: { id: true, title: true, type: true, status: true, priority: true } },
        fromDept: { select: { id: true, name: true, shortName: true, code: true, color: true } },
        toDept: { select: { id: true, name: true, shortName: true, code: true, color: true } },
        sentBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(routes)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { documentId, toDeptId, note, priority } = body

    if (!documentId || !toDeptId) {
      return NextResponse.json({ error: 'documentId and toDeptId are required' }, { status: 400 })
    }

    // Validate that the sender's dept owns the document OR they are admin
    const doc = await prisma.document.findUnique({ where: { id: documentId } })
    if (!doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 })

    const fromDeptId = session.user.departmentId
    if (!fromDeptId) return NextResponse.json({ error: 'You are not assigned to a department' }, { status: 400 })

    const route = await prisma.documentRoute.create({
      data: {
        documentId,
        fromDeptId,
        toDeptId,
        sentById: session.user.id,
        note: note || null,
        priority: priority || doc.priority,
        status: 'PENDING',
      },
      include: {
        document: { select: { id: true, title: true, type: true } },
        fromDept: { select: { name: true, code: true } },
        toDept: { select: { name: true, code: true } },
      }
    })

    // Log it
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'routed document to',
        resource: route.toDept.name,
        resourceId: documentId,
        details: { note, toDeptId, fromDeptId },
      }
    }).catch(() => {})

    // Notify all users in the receiving department
    await notifyDept({
      departmentId: toDeptId,
      excludeUserId: session.user.id,
      title: 'Document routed to your department',
      message: `"${route.document.title}" was routed to ${route.toDept.name} by ${session.user.name} (${route.fromDept.name}).${note ? ` Note: ${note}` : ''}`,
      type: 'DOCUMENT',
      link: '/dashboard/documents',
    })

    return NextResponse.json(route, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
