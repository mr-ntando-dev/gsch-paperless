import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession, isSuperAdmin } from '@/lib/auth'

export async function GET(request) {
  try {
    const session = await getSession()
    if (!session || !isSuperAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const resource = searchParams.get('resource') || 'all'
    const deptId = searchParams.get('deptId')

    const deptFilter = deptId ? { departmentId: deptId } : {}

    let data = {}

    if (resource === 'all' || resource === 'users') {
      data.users = await prisma.user.findMany({
        where: { role: { not: 'SUPERADMIN' }, ...deptFilter },
        select: {
          id: true, name: true, email: true, role: true,
          isActive: true, createdAt: true,
          department: { select: { name: true, code: true } }
        },
        orderBy: { createdAt: 'desc' }
      })
    }

    if (resource === 'all' || resource === 'documents') {
      data.documents = await prisma.document.findMany({
        where: deptFilter,
        include: {
          author: { select: { name: true, email: true } },
          department: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 100
      })
    }

    if (resource === 'all' || resource === 'tasks') {
      data.tasks = await prisma.task.findMany({
        where: deptFilter,
        include: {
          creator: { select: { name: true } },
          assignee: { select: { name: true } },
          department: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 100
      })
    }

    if (resource === 'all' || resource === 'messages') {
      data.messages = await prisma.message.findMany({
        where: deptFilter,
        include: {
          sender: { select: { name: true, email: true } },
          department: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 200
      })
    }

    if (resource === 'all' || resource === 'forms') {
      data.forms = await prisma.form.findMany({
        where: deptFilter,
        include: {
          department: { select: { name: true } },
          _count: { select: { submissions: true } }
        },
        orderBy: { createdAt: 'desc' }
      })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
