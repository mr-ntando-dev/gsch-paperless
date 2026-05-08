import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const deptId = searchParams.get('departmentId')
    const status = searchParams.get('status')

    const where = {}
    if (deptId) where.departmentId = deptId
    if (status) where.status = status

    if (!['SUPERADMIN','ADMIN','MANAGER'].includes(session.user.role)) {
      where.departmentId = session.user.departmentId
    }

    const documents = await prisma.document.findMany({
      where,
      include: {
        author: { select: { name: true } },
        department: { select: { name: true, code: true } }
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(documents)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { title, content, type, departmentId, priority, tags } = body

    const document = await prisma.document.create({
      data: {
        title,
        content,
        type: type || 'General',
        departmentId: departmentId || session.user.departmentId,
        priority: priority || 'MEDIUM',
        tags: tags || [],
        authorId: session.user.id,
      },
    })

    return NextResponse.json(document, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
