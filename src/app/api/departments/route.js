import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession, isAdmin } from '@/lib/auth'

export async function GET() {
  try {
    const departments = await prisma.departmentModel.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { users: true, documents: true, tasks: true } }
      }
    })
    return NextResponse.json(departments)
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
    const { code, name, shortName, color, description } = body
    if (!code || !name || !shortName) {
      return NextResponse.json({ error: 'code, name and shortName are required' }, { status: 400 })
    }
    const dept = await prisma.departmentModel.create({
      data: { code: code.toUpperCase(), name, shortName, color: color || 'blue', description }
    })
    return NextResponse.json(dept, { status: 201 })
  } catch (error) {
    if (error.code === 'P2002') return NextResponse.json({ error: 'Department code already exists' }, { status: 400 })
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
