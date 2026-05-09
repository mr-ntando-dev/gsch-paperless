import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession, isAdmin, isSuperAdmin } from '@/lib/auth'

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

    const { searchParams } = new URL(request.url)
    const hardDelete = searchParams.get('hard') === 'true'

    if (hardDelete && isSuperAdmin(session)) {
      // Fetch dept info before deleting for audit
      const dept = await prisma.departmentModel.findUnique({ where: { id: params.id } })
      if (!dept) return NextResponse.json({ error: 'Department not found' }, { status: 404 })

      // Nullify all FK references so delete does not violate constraints
      await prisma.user.updateMany({
        where: { departmentId: params.id },
        data: { departmentId: null }
      })
      await prisma.document.updateMany({
        where: { departmentId: params.id },
        data: { departmentId: null }
      })
      await prisma.task.updateMany({
        where: { departmentId: params.id },
        data: { departmentId: null }
      })
      await prisma.form.updateMany({
        where: { departmentId: params.id },
        data: { departmentId: null }
      })
      await prisma.message.updateMany({
        where: { departmentId: params.id },
        data: { departmentId: null }
      })
      await prisma.deptItem.deleteMany({ where: { departmentId: params.id } })
      await prisma.deptNotice.deleteMany({ where: { departmentId: params.id } })
      await prisma.documentRoute.deleteMany({
        where: { OR: [{ fromDeptId: params.id }, { toDeptId: params.id }] }
      })
      await prisma.taskEscalation.deleteMany({
        where: { OR: [{ fromDeptId: params.id }, { toDeptId: params.id }] }
      })
      await prisma.dutyRoster.deleteMany({ where: { departmentId: params.id } })

      // Now delete the department itself
      await prisma.departmentModel.delete({ where: { id: params.id } })

      // Audit trail
      try {
        await prisma.activityLog.create({
          data: {
            userId: session.user.id,
            action: 'HARD_DELETE_DEPARTMENT',
            resource: 'Department',
            resourceId: params.id,
            details: { deletedName: dept.name, deletedCode: dept.code },
          }
        })
      } catch (_) {}

      return NextResponse.json({ message: `Department "${dept.name}" permanently deleted` })
    }

    // Default (non-superadmin or soft): deactivate only
    await prisma.departmentModel.update({
      where: { id: params.id },
      data: { isActive: false }
    })

    try {
      await prisma.activityLog.create({
        data: {
          userId: session.user.id,
          action: 'DEACTIVATE_DEPARTMENT',
          resource: 'Department',
          resourceId: params.id,
        }
      })
    } catch (_) {}

    return NextResponse.json({ message: 'Department deactivated' })
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
