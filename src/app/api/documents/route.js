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
    const department = searchParams.get('department')
    const status = searchParams.get('status')

    const where = {}
    if (department) where.department = department
    if (status) where.status = status

    // Non-admins can only see their department's documents
    if (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER') {
      where.department = session.user.department
    }

    const documents = await prisma.document.findMany({
      where,
      include: { author: { select: { name: true, department: true } } },
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
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, content, type, department, priority, tags } = body

    const document = await prisma.document.create({
      data: {
        title,
        content,
        type,
        department: department || session.user.department,
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
