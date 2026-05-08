import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const deptId = searchParams.get('deptId') || searchParams.get('departmentId') || session.user.departmentId

    const where = {}
    if (!['SUPERADMIN','ADMIN'].includes(session.user.role)) {
      where.departmentId = deptId
    } else if (deptId) {
      where.departmentId = deptId
    }

    const messages = await prisma.message.findMany({
      where,
      include: {
        sender: { select: { name: true } },
        department: { select: { name: true, code: true } }
      },
      orderBy: { createdAt: 'asc' },
      take: 200,
    })

    return NextResponse.json(messages)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { content, departmentId, channel } = body

    const message = await prisma.message.create({
      data: {
        content,
        senderId: session.user.id,
        departmentId: departmentId || session.user.departmentId,
        channel: channel || 'general',
      },
    })

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
