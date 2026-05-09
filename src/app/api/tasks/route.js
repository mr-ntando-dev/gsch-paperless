import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { notify } from '@/lib/notify'

export async function GET(request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const deptId = searchParams.get('departmentId')

    const where = {}
    if (deptId) where.departmentId = deptId
    if (!['SUPERADMIN','ADMIN','MANAGER'].includes(session.user.role)) {
      where.departmentId = session.user.departmentId
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        creator: { select: { name: true } },
        assignee: { select: { name: true } },
        department: { select: { name: true, code: true } }
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(tasks)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { title, description, departmentId, priority, status, dueDate, assigneeId } = body

    const task = await prisma.task.create({
      data: {
        title,
        description,
        departmentId: departmentId || session.user.departmentId,
        priority: priority || 'MEDIUM',
        status: status || 'TODO',
        dueDate: dueDate ? new Date(dueDate) : null,
        assigneeId,
        creatorId: session.user.id,
      },
    })

    // Notify assignee (if different from creator)
    if (assigneeId && assigneeId !== session.user.id) {
      await notify({
        userId: assigneeId,
        title: 'New task assigned to you',
        message: `"${title}" was assigned to you by ${session.user.name}${dueDate ? ` — due ${new Date(dueDate).toLocaleDateString('en-ZW')}` : ''}.`,
        type: 'TASK',
        link: '/dashboard/tasks',
      })
    }

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
