import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

// SUPERADMIN only: edit an audit log entry (action, resource, details)
export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== 'SUPERADMIN') return NextResponse.json({ error: 'Forbidden – SUPERADMIN only' }, { status: 403 })

  try {
    const body = await req.json()
    const { action, resource, resourceId, details } = body

    const updated = await prisma.activityLog.update({
      where: { id: params.id },
      data: {
        ...(action !== undefined && { action }),
        ...(resource !== undefined && { resource }),
        ...(resourceId !== undefined && { resourceId }),
        ...(details !== undefined && { details }),
      }
    })
    return NextResponse.json(updated)
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// SUPERADMIN only: permanently delete an audit log entry
export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== 'SUPERADMIN') return NextResponse.json({ error: 'Forbidden – SUPERADMIN only' }, { status: 403 })

  try {
    await prisma.activityLog.delete({ where: { id: params.id } })
    return NextResponse.json({ message: 'Log entry deleted' })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
