import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const department = searchParams.get('department')

    const where = {}
    if (status) where.status = status
    if (department) where.department = department

    if (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER') {
      where.assigneeId = session.user.id
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: { select: { name: true } },
        creator: { select: { name: true } },
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
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, department, priority, assigneeId, dueDate } = body

    const task = await prisma.task.create({
      data: {
        title,
        description,
        department: department || session.user.department,
        priority: priority || 'MEDIUM',
        assigneeId,
        creatorId: session.user.id,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
