import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const forms = await prisma.form.findMany({
      where: { isActive: true },
      include: { _count: { select: { submissions: true } } },
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
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, department, fields } = body

    const form = await prisma.form.create({
      data: {
        title,
        description,
        department: department || session.user.department,
        fields: fields || [],
      },
    })

    return NextResponse.json(form, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
