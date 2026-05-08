import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const deptId = searchParams.get('departmentId')

    const where = { isActive: true }
    if (deptId) where.departmentId = deptId
    else if (!['SUPERADMIN','ADMIN','MANAGER'].includes(session.user.role)) {
      where.departmentId = session.user.departmentId
    }

    const forms = await prisma.form.findMany({
      where,
      include: {
        department: { select: { name: true, code: true } },
        _count: { select: { submissions: true } }
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(forms)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { title, description, departmentId, fields } = body

    const form = await prisma.form.create({
      data: {
        title,
        description,
        departmentId: departmentId || session.user.departmentId,
        fields: fields || [],
      },
    })

    return NextResponse.json(form, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
