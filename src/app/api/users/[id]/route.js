import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession, isAdmin } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function PATCH(request, { params }) {
  try {
    const session = await getSession()
    if (!session || !isAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = await request.json()
    const { password, ...rest } = body
    const updateData = { ...rest }
    if (password) {
      updateData.password = await bcrypt.hash(password, 12)
    }
    const user = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
    })
    return NextResponse.json({ id: user.id, name: user.name, email: user.email })
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
    await prisma.user.update({
      where: { id: params.id },
      data: { isActive: false }
    })
    return NextResponse.json({ message: 'User deactivated' })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
