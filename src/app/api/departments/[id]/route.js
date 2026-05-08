import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession, isAdmin } from '@/lib/auth'

export async function PATCH(request, { params }) {
  try {
    const session = await getSession()
    if (!session || !isAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = await request.json()
    const dept = await prisma.departmentModel.update({
      where: { id: params.id },
      data: body,
    })
    return NextResponse.json(dept)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getSession()
    if (!session || !isAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    await prisma.departmentModel.update({
      where: { id: params.id },
      data: { isActive: false }
    })
    return NextResponse.json({ message: 'Department deactivated' })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
