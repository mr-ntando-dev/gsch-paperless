import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        firstLogin: true,
        isRosterManager: true,
        createdAt: true,
        department: { select: { id: true, name: true, shortName: true, color: true, description: true, code: true } }
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// Called when user dismisses welcome screen — marks firstLogin as false
// Also handles password change when body contains currentPassword + newPassword
export async function PATCH(request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    let body = {}
    try { body = await request.json() } catch { /* no body = welcome dismiss */ }

    // Password change flow
    if (body.currentPassword && body.newPassword) {
      if (body.newPassword.length < 8) {
        return NextResponse.json({ error: 'New password must be at least 8 characters.' }, { status: 400 })
      }

      const user = await prisma.user.findUnique({ where: { id: session.user.id } })
      const valid = await bcrypt.compare(body.currentPassword, user.password)
      if (!valid) {
        return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 })
      }

      const hashed = await bcrypt.hash(body.newPassword, 12)
      await prisma.user.update({
        where: { id: session.user.id },
        data: { password: hashed },
      })

      return NextResponse.json({ ok: true, message: 'Password updated successfully.' })
    }

    // Default: welcome screen dismiss
    await prisma.user.update({
      where: { id: session.user.id },
      data: { firstLogin: false }
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
