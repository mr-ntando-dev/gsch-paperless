import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession, isAdmin } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const session = await getSession()
    if (!session || !isAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const where = session.user.role === 'SUPERADMIN' ? {} : { role: { not: 'SUPERADMIN' } }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        departmentId: true,
        department: { select: { id: true, name: true, code: true, color: true } },
        isActive: true,
        firstLogin: true,
        createdAt: true,
        createdByAdmin: true,
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getSession()
    if (!session || !isAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { email, name, password, role, departmentId } = body

    if (!email || !name || !password || !departmentId) {
      return NextResponse.json({ error: 'email, name, password and departmentId are required' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: role || 'STAFF',
        departmentId,
        createdByAdmin: true,
      },
    })

    return NextResponse.json({ id: user.id, email: user.email, name: user.name }, { status: 201 })
  } catch (error) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
