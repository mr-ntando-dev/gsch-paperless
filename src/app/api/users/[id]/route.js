import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession, isAdmin, isSuperAdmin } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function PATCH(request, { params }) {
  try {
    const session = await getSession()
    if (!session || !isAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = await request.json()
    const { password, ...rest } = body

    // Only SUPERADMIN can assign SUPERADMIN role
    if (rest.role === 'SUPERADMIN' && !isSuperAdmin(session)) {
      return NextResponse.json({ error: 'Only SUPERADMIN can assign SUPERADMIN role' }, { status: 403 })
    }

    const updateData = { ...rest }
    if (password) {
      updateData.password = await bcrypt.hash(password, 12)
    }
    const user = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
    })

    // Audit log
    try {
      await prisma.activityLog.create({
        data: {
          userId: session.user.id,
          action: 'UPDATE_USER',
          resource: 'User',
          resourceId: params.id,
          details: { updatedFields: Object.keys(rest), targetName: user.name },
        }
      })
    } catch (_) {}

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

    const { searchParams } = new URL(request.url)
    const hardDelete = searchParams.get('hard') === 'true'

    // Prevent deleting yourself
    if (params.id === session.user.id) {
      return NextResponse.json({ error: 'You cannot delete your own account' }, { status: 400 })
    }

    if (hardDelete && isSuperAdmin(session)) {
      // SUPERADMIN: permanently delete the user and all their activity logs
      await prisma.activityLog.deleteMany({ where: { userId: params.id } })
      const deleted = await prisma.user.delete({ where: { id: params.id } })

      // Audit the deletion under the superadmin own log
      try {
        await prisma.activityLog.create({
          data: {
            userId: session.user.id,
            action: 'HARD_DELETE_USER',
            resource: 'User',
            resourceId: params.id,
            details: { deletedName: deleted.name, deletedEmail: deleted.email },
          }
        })
      } catch (_) {}

      return NextResponse.json({ message: 'User permanently deleted' })
    }

    // Default: deactivate only
    const target = await prisma.user.findUnique({ where: { id: params.id } })
    if (target?.role === 'SUPERADMIN' && !isSuperAdmin(session)) {
      return NextResponse.json({ error: 'Cannot deactivate a SUPERADMIN' }, { status: 403 })
    }

    await prisma.user.update({
      where: { id: params.id },
      data: { isActive: false }
    })

    try {
      await prisma.activityLog.create({
        data: {
          userId: session.user.id,
          action: 'DEACTIVATE_USER',
          resource: 'User',
          resourceId: params.id,
          details: { targetName: target?.name },
        }
      })
    } catch (_) {}

    return NextResponse.json({ message: 'User deactivated' })
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
