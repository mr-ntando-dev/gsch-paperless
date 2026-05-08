import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const deptId = searchParams.get('deptId')

    const where = {}
    if (deptId) where.departmentId = deptId
    else if (!['SUPERADMIN','ADMIN'].includes(session.user.role)) {
      where.departmentId = session.user.departmentId
    }

    const items = await prisma.deptItem.findMany({
      where,
      include: {
        author: { select: { name: true } },
        department: { select: { name: true, code: true } }
      },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }]
    })

    return NextResponse.json(items)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { title, content, type, departmentId, isPinned } = body

    if (!title || !content || !departmentId) {
      return NextResponse.json({ error: 'title, content and departmentId are required' }, { status: 400 })
    }

    const item = await prisma.deptItem.create({
      data: {
        title, content, type: type || 'NOTE',
        departmentId,
        authorId: session.user.id,
        isPinned: isPinned || false,
      }
    })

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
